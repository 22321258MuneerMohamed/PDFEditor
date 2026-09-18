import { Router } from 'express'

import {
  uploadPdf,
  extractPdfText,
  editPdf,
} from '../controllers/pdf.controller.js'

import {
  uploadPdf as uploadPdfMiddleware,
} from '../middleware/upload.middleware.js'

import {
  validateEdits,
} from '../middleware/validation.middleware.js'

const router = Router()

/**
 * Upload a PDF and return basic PDF information.
 */
router.post(
  '/upload',
  uploadPdfMiddleware,
  uploadPdf,
)

/**
 * Extract text blocks and their PDF coordinates.
 */
router.post(
  '/extract-blocks',
  uploadPdfMiddleware,
  extractPdfText,
)

/**
 * Apply frontend-selected text edits.
 */
router.post(
  '/edit',
  uploadPdfMiddleware,
  validateEdits,
  editPdf,
)

export default router