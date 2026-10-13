const fs = require('fs')
const crypto = require('crypto')
const multer = require('multer')
const config = require('../config')
const ApiError = require('../errors/ApiError')

const ALLOWED = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
}

fs.mkdirSync(config.upload.dir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.upload.dir),
  // Never trust the client filename for storage: use a random name + extension by MIME type.
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype]}`),
})

const uploader = multer({
  storage,
  limits: { fileSize: config.upload.maxFileMb * 1024 * 1024, files: config.upload.maxFilesPerRequest },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      return cb(ApiError.validation({ files: 'Only PDF, JPG, and PNG files are allowed.' }))
    }
    // Keep the human filename readable: decode multer's latin1 interpretation of UTF-8.
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, true)
  },
})

/** Accepts one or more files in the multipart field "files". */
const uploadFiles = uploader.array('files', config.upload.maxFilesPerRequest)

function requireFiles(req, _res, next) {
  if (!req.files || req.files.length === 0) {
    return next(ApiError.validation({ files: 'Choose at least one file to upload.' }))
  }
  next()
}

module.exports = { uploadFiles, requireFiles }
