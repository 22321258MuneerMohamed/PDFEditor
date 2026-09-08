import { Router } from 'express'
import {
  editPdf,
  extractPdfText,
  uploadPdf,
} from '../controllers/pdf.controller.js'
import { uploadPdf as uploadPdfMiddleware } from '../middleware/upload.middleware.js'

const router = Router()

router.post(
  '/upload',
  uploadPdfMiddleware,
  uploadPdf,
)

router.post(
  '/extract-blocks',
  uploadPdfMiddleware,
  extractPdfText,
)

router.post(
  '/edit',
  uploadPdfMiddleware,
  editPdf,
)

export default router