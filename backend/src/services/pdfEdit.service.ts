import {
  PDFDocument,
  rgb,
  StandardFonts,
} from 'pdf-lib'

export interface TextEdit {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  newText: string
}

export async function applyTextEdits(
  buffer: Buffer,
  edits: TextEdit[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer)

  const font = await pdf.embedFont(StandardFonts.Helvetica)

  for (const edit of edits) {
    if (
      edit.pageNumber < 1 ||
      edit.pageNumber > pdf.getPageCount()
    ) {
      throw new Error(
        `Invalid page number: ${edit.pageNumber}`,
      )
    }

    const page = pdf.getPage(edit.pageNumber - 1)

    const pdfY =
      page.getHeight() - edit.y - edit.height

    // Cover the original text.
    page.drawRectangle({
      x: edit.x,
      y: pdfY,
      width: edit.width,
      height: edit.height,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    })

    // Draw replacement text.
    page.drawText(edit.newText, {
      x: edit.x,
      y: pdfY,
      size: Math.max(edit.height * 0.8, 8),
      font,
      color: rgb(0, 0, 0),
    })
  }

  return pdf.save()
}