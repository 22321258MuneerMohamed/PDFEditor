import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import type {
  PdfPageText,
  TextBlock,
} from '../types/pdf.types.js'

export async function extractTextBlocks(
  buffer: Buffer,
): Promise<PdfPageText[]> {
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  }).promise

  const pages: PdfPageText[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()

    const blocks: TextBlock[] = []

    textContent.items.forEach((item, itemIndex) => {
      if (!('str' in item) || !item.str.trim()) {
        return
      }

      const transform = item.transform

      const x = transform[4]

      const fontSize = Math.sqrt(
        transform[0] ** 2 + transform[1] ** 2,
      )

      const height =
        Math.abs(transform[3]) ||
        fontSize ||
        1

      const y =
        viewport.height -
        transform[5] -
        height

      const width = item.width

      const fontRef =
        'fontName' in item
          ? item.fontName ?? null
          : null

      blocks.push({
        id: `page-${pageNumber}-block-${itemIndex}`,
        text: item.str,
        x,
        y,
        width,
        height,
        originalFontSize: fontSize,
        fontRef,
      })
    })

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      blocks,
    })
  }

  return pages
}