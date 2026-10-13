const express = require('express')
const authenticate = require('../middleware/authenticate')
const validate = require('../middleware/validate')
const { uploadFiles, requireFiles } = require('../middleware/upload')
const controller = require('../controllers/travelRequestsController')
const schemas = require('../validators/travelRequests')

const router = express.Router()

// Every route requires a session. Ownership is enforced in the service.
router.use(authenticate)

router.get('/', validate(schemas.listSchema), controller.list)
router.post('/', validate(schemas.createSchema), controller.create)
router.get('/:id', validate(schemas.idSchema), controller.get)
router.patch('/:id', validate(schemas.patchSchema), controller.update)
router.post('/:id/policy-check', validate(schemas.idSchema), controller.policyCheck)
router.post('/:id/submit', validate(schemas.idSchema), controller.submit)

router.post('/:id/documents', validate(schemas.idSchema), uploadFiles, requireFiles, controller.addDocuments)
router.get('/:id/documents/:docId/file', validate(schemas.docSchema), controller.downloadDocument)
router.delete('/:id/documents/:docId', validate(schemas.docSchema), controller.removeDocument)

module.exports = router
