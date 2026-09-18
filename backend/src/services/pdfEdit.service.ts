import {
  PDFDocument,
  StandardFonts,
  rgb,
} from 'pdf-lib'

import type {
  ResolvedTextEdit,
  TextEditRequest,
} from '../types/pdf.types.js'

import { extractTextBlocks } from './pdfText.service.js'

const fontMap: Record<
  string,
  {
    normal: StandardFonts
    bold: StandardFonts
    italic: StandardFonts
    boldItalic: StandardFonts
  }
> = {
  helvetica: {
    normal: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
    italic: StandardFonts.HelveticaOblique,
    boldItalic: StandardFonts.HelveticaBoldOblique,
  },

  'arial': {
    normal: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
    italic: StandardFonts.HelveticaOblique,
    boldItalic: StandardFonts.HelveticaBoldOblique,
  },

  'times': {
    normal: StandardFonts.TimesRoman,
    bold: StandardFonts.TimesRomanBold,
    italic: StandardFonts.TimesRomanItalic,
    boldItalic: StandardFonts.TimesRomanBoldItalic,
  },

  'times new roman': {
    normal: StandardFonts.TimesRoman,
    bold: StandardFonts.TimesRomanBold,
    italic: StandardFonts.TimesRomanItalic,
    boldItalic: StandardFonts.TimesRomanBoldItalic,
  },

  'courier': {
    normal: StandardFonts.Courier,
    bold: StandardFonts.CourierBold,
    italic: StandardFonts.CourierOblique,
    boldItalic: StandardFonts.CourierBoldOblique,
  },

  'courier new': {
    normal: StandardFonts.Courier,
    bold: StandardFonts.CourierBold,
    italic: StandardFonts.CourierOblique,
    boldItalic: StandardFonts.CourierBoldOblique,
  },
}

function getFont(
  fontFamily: string,
  fontWeight: 'normal' | 'bold',
  fontStyle: 'normal' | 'italic',
): StandardFonts {
  const family = fontFamily.trim().toLowerCase()

  const fonts = fontMap[family]

  if (!fonts) {
    throw new Error(
      `Unsupported font family: ${fontFamily}`,
    )
  }

  if (fontWeight === 'bold' && fontStyle === 'italic') {
    return fonts.boldItalic
  }

  if (fontWeight === 'bold') {
    return fonts.bold
  }

  if (fontStyle === 'italic') {
    return fonts.italic
  }

  return fonts.normal
}

export async function resolveTextEdits(
  buffer: Buffer,
  edits: TextEditRequest[],
): Promise<ResolvedTextEdit[]> {
  const pages = await extractTextBlocks(buffer)

  const blocks = pages.flatMap((page) =>
    page.blocks.map((block) => ({
      ...block,
      pageNumber: page.pageNumber,
    })),
  )

  return edits.map((edit) => {
    const block = blocks.find(
      (item) => item.id === edit.blockId,
    )

    if (!block) {
      throw new Error(
        `Text block not found: ${edit.blockId}`,
      )
    }

    // Validate that the requested font is supported.
    getFont(
      edit.fontFamily,
      edit.fontWeight ?? 'normal',
      edit.fontStyle ?? 'normal',
    )

    return {
      blockId: block.id,
      pageNumber: block.pageNumber,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      newText: edit.newText,
      fontFamily: edit.fontFamily,
      fontSize: edit.fontSize,
      fontWeight: edit.fontWeight ?? 'normal',
      fontStyle: edit.fontStyle ?? 'normal',
    }
  })
}

export async function applyTextEdits(
  buffer: Buffer,
  edits: ResolvedTextEdit[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer)

  for (const edit of edits) {
    const page = pdfDoc.getPage(edit.pageNumber - 1)

    const fontName = getFont(
      edit.fontFamily,
      edit.fontWeight,
      edit.fontStyle,
    )

    const font = await pdfDoc.embedFont(fontName)

    /*
     * Cover the original text.
     *
     * This is intentionally simple for the MVP.
     * It is NOT secure PDF redaction.
     */
    page.drawRectangle({
      x: edit.x,
      y: page.getHeight() - edit.y - edit.height,
      width: edit.width,
      height: edit.height,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    })

    /*
 * Draw the replacement text using
 * the properties supplied by the frontend.
 */
    page.drawText(edit.newText, {
      x: edit.x,
      y:
        page.getHeight() -
        edit.y -
        edit.fontSize,
      size: edit.fontSize,
      font,
      color: rgb(0, 0, 0),
    })
  }

  return pdfDoc.save()
}