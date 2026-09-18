export interface TextBlock {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  originalFontSize: number
  fontRef: string | null
}

export interface PdfPageText {
  pageNumber: number
  width: number
  height: number
  blocks: TextBlock[]
}

export interface TextEditRequest {
  blockId: string
  newText: string
  fontFamily: string
  fontSize: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
}

export interface ResolvedTextEdit {
  blockId: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  newText: string
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
}