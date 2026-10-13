const service = require('../services/travelRequestService')

async function list(req, res) {
  const { items, meta } = service.list(req.user, req.query)
  res.json({ data: items, meta })
}

async function create(req, res) {
  res.status(201).json({ data: service.create(req.user, req.body) })
}

async function get(req, res) {
  res.json({ data: service.get(req.user, req.params.id) })
}

async function update(req, res) {
  res.json({ data: service.update(req.user, req.params.id, req.body) })
}

async function policyCheck(req, res) {
  res.json({ data: service.policyCheck(req.user, req.params.id) })
}

async function submit(req, res) {
  res.json({ data: service.submit(req.user, req.params.id) })
}

async function addDocuments(req, res) {
  res.status(201).json({ data: service.addDocuments(req.user, req.params.id, req.files) })
}

async function removeDocument(req, res) {
  service.removeDocument(req.user, req.params.id, req.params.docId)
  res.json({ data: { success: true } })
}

async function downloadDocument(req, res) {
  const file = service.getDocumentFile(req.user, req.params.id, req.params.docId)
  res.download(file.path, file.name)
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
  downloadDocument,
}
