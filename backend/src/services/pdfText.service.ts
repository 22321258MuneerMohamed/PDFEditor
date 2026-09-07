import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

export interface TextBlock {
  text: string
  x: number
  y: number
  width: number
  height: number
}

export interface PdfPageText {
  pageNumber: number
  width: number
  height: number
  blocks: TextBlock[]
}

export async function extractTextBlocks(
  buffer: Buffer,
): Promise<PdfPageText[]> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  })

  const pdf = await loadingTask.promise
  const pages: PdfPageText[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)

    const viewport = page.getViewport({
      scale: 1,
    })

    const textContent = await page.getTextContent()

    const blocks: TextBlock[] = []

    for (const item of textContent.items) {
      if (!('str' in item)) {
        continue
      }

      if (!item.str.trim()) {
        continue
      }

      const transform = item.transform

      const x = transform[4]
      const y = viewport.height - transform[5]

      const width = item.width
      const height = Math.abs(transform[3]) || 1

      blocks.push({
        text: item.str,
        x,
        y,
        width,
        height,
      })
    }

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      blocks,
    })
  }


  return pages
}