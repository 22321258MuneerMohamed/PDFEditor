import multer from 'multer'

import { env } from '../config/env.js'

const storage = multer.memoryStorage()

const fileFilter: multer.Options['fileFilter'] = (
  _req,
  file,
  cb,
) => {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.originalname
      .toLowerCase()
      .endsWith('.pdf')

  if (isPdf) {
    cb(null, true)
    return
  }

  cb(new Error('Only PDF files are allowed.'))
}

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
}).single('pdf')