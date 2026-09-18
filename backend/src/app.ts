import express from 'express'
import cors from 'cors'

import { env } from './config/env.js'
import pdfRoutes from './routes/pdf.routes.js'
import { errorMiddleware } from './middleware/error.middleware.js'

const app = express()

// Allow requests from the frontend.
app.use(
  cors({
    origin: env.frontendUrl,
  }),
)

// Parse JSON request bodies.
app.use(express.json())

// Basic API information.
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'PDF Editor API is running',
  })
})

// Health check.
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PDF Editor backend is running',
  })
})

// Service status.
app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    service: 'pdf-editor-backend',
    environment: env.nodeEnv,
    features: {
      upload: true,
      textExtraction: true,
      textEditing: true,
      export: true,
    },
  })
})

// PDF API routes.
app.use('/api/pdf', pdfRoutes)

// Global error handler.
app.use(errorMiddleware)

export default app