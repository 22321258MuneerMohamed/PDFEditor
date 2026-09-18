import type { Request, Response, NextFunction } from 'express'

export function validateEdits(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rawEdits = req.body?.edits

    if (!rawEdits) {
      res.status(400).json({
        success: false,
        message: 'The edits field is required.',
      })
      return
    }

    let edits: unknown

    try {
      edits =
        typeof rawEdits === 'string'
          ? JSON.parse(rawEdits)
          : rawEdits
    } catch {
      res.status(400).json({
        success: false,
        message: 'The edits field must contain valid JSON.',
      })
      return
    }

    if (!Array.isArray(edits)) {
      res.status(400).json({
        success: false,
        message: 'Edits must be an array.',
      })
      return
    }

    if (edits.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one edit is required.',
      })
      return
    }

    if (edits.length > 100) {
      res.status(400).json({
        success: false,
        message: 'A maximum of 100 edits is allowed per request.',
      })
      return
    }

    for (const edit of edits) {
      if (!edit || typeof edit !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Each edit must be an object.',
        })
        return
      }

      const item = edit as Record<string, unknown>

      if (
        typeof item.blockId !== 'string' ||
        !item.blockId.trim()
      ) {
        res.status(400).json({
          success: false,
          message: 'Each edit requires a valid blockId.',
        })
        return
      }

      if (
        typeof item.newText !== 'string' ||
        !item.newText.trim()
      ) {
        res.status(400).json({
          success: false,
          message: 'Each edit requires non-empty newText.',
        })
        return
      }

      if (
        typeof item.fontFamily !== 'string' ||
        !item.fontFamily.trim()
      ) {
        res.status(400).json({
          success: false,
          message: 'Each edit requires a fontFamily.',
        })
        return
      }

      if (
        typeof item.fontSize !== 'number' ||
        !Number.isFinite(item.fontSize) ||
        item.fontSize <= 0
      ) {
        res.status(400).json({
          success: false,
          message: 'Each edit requires a valid positive fontSize.',
        })
        return
      }

      if (
        item.fontWeight !== undefined &&
        item.fontWeight !== 'normal' &&
        item.fontWeight !== 'bold'
      ) {
        res.status(400).json({
          success: false,
          message: 'fontWeight must be normal or bold.',
        })
        return
      }

      if (
        item.fontStyle !== undefined &&
        item.fontStyle !== 'normal' &&
        item.fontStyle !== 'italic'
      ) {
        res.status(400).json({
          success: false,
          message: 'fontStyle must be normal or italic.',
        })
        return
      }
    }

    req.body.parsedEdits = edits
    next()
  } catch (error) {
    next(error)
  }
}