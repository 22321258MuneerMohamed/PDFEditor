import type { Request, Response, NextFunction } from 'express'
import { getPdfInfo } from '../services/pdf.service.js'

export async function uploadPdf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No PDF file was uploaded.',
      })
      return
    }

    const info = await getPdfInfo(req.file.buffer)

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully.',
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        pageCount: info.pageCount,
      },
    })
  } catch (error) {
    next(error)
  }
}
