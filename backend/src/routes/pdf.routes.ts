import { Router } from 'express'
import { uploadPdf } from '../controllers/pdf.controller.js'
import { uploadPdf as uploadPdfMiddleware } from '../middleware/upload.middleware.js'

const router = Router()

router.post('/upload', uploadPdfMiddleware, uploadPdf)

export default router
