const fs = require('fs')
const path = require('path')
const config = require('../config')
const ApiError = require('../errors/ApiError')
const { ROLES } = require('../constants/roles')
const {
  TRAVEL_REQUEST_STATUS,
  TRAVEL_REQUEST_TRANSITIONS,
  canTransition,
} = require('../constants/statuses')
const requestsModel = require('../models/travelRequests')
const documentsModel = require('../models/documents')
const policyService = require('./policyService')
const { inclusiveDays } = require('../utils/dates')

const EDITABLE = [TRAVEL_REQUEST_STATUS.DRAFT, TRAVEL_REQUEST_STATUS.REVISION]

function documentDto(d) {
  return {
    id: d.id,
    name: d.originalName,
    mimeType: d.mimeType,
    size: d.size,
    uploadedAt: d.createdAt,
  }
}

function toDto(request, { withDocuments = false } = {}) {
  const dto = {
    id: request.id,
    sppdRef: request.sppdRef,
    employee: { id: request.userId, name: request.employeeName },
    destination: request.destination,
    departDate: request.departDate,
    returnDate: request.returnDate,
    days: inclusiveDays(request.departDate, request.returnDate),
    purpose: request.purpose,
    transport: request.transport,
    status: request.status,
    estimatedCost: request.estimatedCost,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    submittedAt: request.submittedAt,
  }
  if (withDocuments) dto.documents = documentsModel.listByRequest(request.id).map(documentDto)
  return dto
}

/** Loads a request the user may read (owner, approver, admin). */
function loadReadable(id, user) {
  const request = requestsModel.findById(id)
  if (!request) throw ApiError.notFound('Travel request not found')
  const privileged = user.role === ROLES.APPROVER || user.role === ROLES.ADMIN
  if (request.userId !== user.id && !privileged) throw ApiError.notFound('Travel request not found')
  return request
}

/** Loads a request only its owner may change, and only while editable. */
function loadEditable(id, user) {
  const request = requestsModel.findById(id)
  if (!request || request.userId !== user.id) throw ApiError.notFound('Travel request not found')
  if (!EDITABLE.includes(request.status)) {
    throw ApiError.invalidTransition(`A ${request.status} request can no longer be edited.`)
  }
  return request
}

function list(user, { status, page, pageSize }) {
  const { rows, total } = requestsModel.list({ userId: user.id, status, page, pageSize })
  return { items: rows.map((r) => toDto(r)), meta: { page, pageSize, total } }
}

function create(user, input) {
  const request = requestsModel.create({
    ...input,
    userId: user.id,
    status: TRAVEL_REQUEST_STATUS.DRAFT,
  })
  return toDto(request, { withDocuments: true })
}

function get(user, id) {
  return toDto(loadReadable(id, user), { withDocuments: true })
}

function update(user, id, patch) {
  const request = loadEditable(id, user)
  const tripChanged = Object.keys(patch).length > 0
  // The saved estimate is stale once trip details change; policy-check recomputes it.
  const updated = requestsModel.update(request.id, tripChanged ? { ...patch, estimatedCost: null } : patch)
  return toDto(updated, { withDocuments: true })
}

function policyCheck(user, id) {
  const request = loadEditable(id, user)
  const result = policyService.evaluate(user, request)
  requestsModel.update(request.id, { estimatedCost: result.breakdown.total })
  return result
}

function submit(user, id) {
  const request = loadEditable(id, user)
  if (!canTransition(TRAVEL_REQUEST_TRANSITIONS, request.status, TRAVEL_REQUEST_STATUS.PENDING)) {
    throw ApiError.invalidTransition()
  }

  const fields = {}
  if (documentsModel.countByRequest(request.id) === 0) {
    fields.documents = 'At least one supporting document is required.'
  }
  const policy = policyService.evaluate(user, request)
  if (!policy.compliant) {
    fields.policy = 'This request does not comply with the travel policy.'
  }
  if (Object.keys(fields).length) throw ApiError.validation(fields)

  const updated = requestsModel.update(request.id, {
    status: TRAVEL_REQUEST_STATUS.PENDING,
    estimatedCost: policy.breakdown.total,
    submittedAt: new Date().toISOString(),
  })
  return toDto(updated, { withDocuments: true })
}

// --- Documents ------------------------------------------------------------

function addDocuments(user, id, files) {
  const request = loadEditable(id, user)
  const current = documentsModel.countByRequest(request.id)
  if (current + files.length > config.upload.maxFilesPerRequest) {
    for (const f of files) fs.rmSync(f.path, { force: true })
    throw ApiError.validation({
      files: `At most ${config.upload.maxFilesPerRequest} documents per request.`,
    })
  }
  return files.map((f) =>
    documentDto(
      documentsModel.create({
        requestId: request.id,
        originalName: f.originalname,
        storedName: f.filename,
        mimeType: f.mimetype,
        size: f.size,
      }),
    ),
  )
}

function removeDocument(user, id, docId) {
  const request = loadEditable(id, user)
  const doc = documentsModel.findById(docId)
  if (!doc || doc.requestId !== request.id) throw ApiError.notFound('Document not found')
  documentsModel.remove(doc.id)
  fs.rmSync(path.join(config.upload.dir, doc.storedName), { force: true })
}

function getDocumentFile(user, id, docId) {
  const request = loadReadable(id, user)
  const doc = documentsModel.findById(docId)
  if (!doc || doc.requestId !== request.id) throw ApiError.notFound('Document not found')
  return { path: path.join(config.upload.dir, doc.storedName), name: doc.originalName }
}

module.exports = {
  list,
  create,
  get,
  update,
  policyCheck,
  submit,
  addDocuments,
  removeDocument,
  getDocumentFile,
}
