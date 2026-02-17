import { Survey, SurveyResponse, OptionCount } from '../types'

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 'survey-001',
    question: '¿Cómo nos conociste?',
    options: [
      'Instagram',
      'TikTok',
      'Búsqueda en Google',
      'Amigo/Familiar',
      'Podcast',
    ],
    isActive: true,
    allowOther: true,
    responseCount: 127,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 'survey-002',
    question: '¿Qué influyó en tu decisión de compra?',
    options: [
      'Precio',
      'Calidad',
      'Reseñas',
      'Reputación de marca',
      'Recomendación',
    ],
    isActive: false,
    allowOther: false,
    responseCount: 45,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-01-05T11:15:00Z',
  },
  {
    id: 'survey-003',
    question: '¿Dónde viste nuestra marca por primera vez?',
    options: [
      'Redes sociales',
      'TV/Streaming',
      'Anuncio online',
      'Tienda física',
      'Email',
    ],
    isActive: false,
    allowOther: true,
    responseCount: 0,
    createdAt: '2026-02-01T16:45:00Z',
    updatedAt: '2026-02-01T16:45:00Z',
  },
]

export const MOCK_RESPONSES: SurveyResponse[] = [
  {
    id: 'resp-001',
    surveyId: 'survey-001',
    selectedOption: 'Instagram',
    orderId: 'ORD-1234567',
    clientEmail: 'maria.garcia@email.com',
    respondedAt: '2026-02-15T10:30:00Z',
  },
  {
    id: 'resp-002',
    surveyId: 'survey-001',
    selectedOption: 'TikTok',
    orderId: 'ORD-1234568',
    clientEmail: 'juan.lopez@email.com',
    respondedAt: '2026-02-15T11:45:00Z',
  },
  {
    id: 'resp-003',
    surveyId: 'survey-001',
    selectedOption: 'Amigo/Familiar',
    orderId: 'ORD-1234569',
    clientEmail: 'ana.martinez@email.com',
    respondedAt: '2026-02-14T14:20:00Z',
  },
  {
    id: 'resp-004',
    surveyId: 'survey-001',
    selectedOption: 'Instagram',
    orderId: 'ORD-1234570',
    clientEmail: 'carlos.rodriguez@email.com',
    respondedAt: '2026-02-14T09:10:00Z',
  },
  {
    id: 'resp-005',
    surveyId: 'survey-001',
    selectedOption: 'Búsqueda en Google',
    orderId: 'ORD-1234571',
    clientEmail: 'laura.fernandez@email.com',
    respondedAt: '2026-02-13T16:30:00Z',
  },
  {
    id: 'resp-006',
    surveyId: 'survey-001',
    selectedOption: 'Podcast',
    orderId: 'ORD-1234572',
    clientEmail: 'diego.sanchez@email.com',
    respondedAt: '2026-02-13T12:00:00Z',
  },
  {
    id: 'resp-007',
    surveyId: 'survey-001',
    selectedOption: 'Otro',
    otherText: 'Video de YouTube',
    orderId: 'ORD-1234573',
    clientEmail: 'sofia.torres@email.com',
    respondedAt: '2026-02-12T18:45:00Z',
  },
  {
    id: 'resp-008',
    surveyId: 'survey-001',
    selectedOption: 'Instagram',
    orderId: 'ORD-1234574',
    clientEmail: 'pablo.ruiz@email.com',
    respondedAt: '2026-02-12T10:15:00Z',
  },
  {
    id: 'resp-009',
    surveyId: 'survey-001',
    selectedOption: 'TikTok',
    orderId: 'ORD-1234575',
    clientEmail: 'lucia.morales@email.com',
    respondedAt: '2026-02-11T15:30:00Z',
  },
  {
    id: 'resp-010',
    surveyId: 'survey-001',
    selectedOption: 'Amigo/Familiar',
    orderId: 'ORD-1234576',
    clientEmail: 'miguel.castro@email.com',
    respondedAt: '2026-02-11T08:00:00Z',
  },
  {
    id: 'resp-011',
    surveyId: 'survey-001',
    selectedOption: 'Instagram',
    orderId: 'ORD-1234577',
    clientEmail: 'elena.diaz@email.com',
    respondedAt: '2026-02-10T17:20:00Z',
  },
  {
    id: 'resp-012',
    surveyId: 'survey-001',
    selectedOption: 'Búsqueda en Google',
    orderId: 'ORD-1234578',
    clientEmail: 'roberto.jimenez@email.com',
    respondedAt: '2026-02-10T11:40:00Z',
  },
]

export const MOCK_DASHBOARD_DISTRIBUTION: OptionCount[] = [
  { option: 'Instagram', count: 45, percentage: 35.4 },
  { option: 'TikTok', count: 28, percentage: 22.0 },
  { option: 'Amigo/Familiar', count: 22, percentage: 17.3 },
  { option: 'Búsqueda en Google', count: 18, percentage: 14.2 },
  { option: 'Podcast', count: 8, percentage: 6.3 },
  { option: 'Otro', count: 6, percentage: 4.7 },
]

/**
 * Helper to find a survey by ID
 */
export const findSurveyById = (id: string): Survey | undefined => {
  return MOCK_SURVEYS.find((s) => s.id === id)
}

/**
 * Helper to get responses for a survey
 */
export const getResponsesBySurveyId = (surveyId: string): SurveyResponse[] => {
  return MOCK_RESPONSES.filter((r) => r.surveyId === surveyId)
}
