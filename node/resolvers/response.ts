import { UserInputError } from '@vtex/api'

import {
  DATA_ENTITY_SURVEYS,
  DATA_ENTITY_RESPONSES,
  SCHEMA_RESPONSES,
  RESPONSE_FIELDS,
} from '../utils/constants'

interface ResponseInput {
  surveyId: string
  selectedOption: string
  otherText?: string
  orderId: string
  clientEmail: string
}

interface GetResponsesArgs {
  surveyId: string
  page?: number
  pageSize?: number
  dateFrom?: string
  dateTo?: string
}

// Query: getResponses
export const getResponses = async (
  _: unknown,
  { surveyId, page = 1, pageSize = 10, dateFrom, dateTo }: GetResponsesArgs,
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  let where = `surveyId=${surveyId}`

  if (dateFrom) {
    where += ` AND respondedAt>=${dateFrom}`
  }

  if (dateTo) {
    where += ` AND respondedAt<=${dateTo}`
  }

  const responses = await masterdata.searchDocuments({
    dataEntity: DATA_ENTITY_RESPONSES,
    schema: SCHEMA_RESPONSES,
    fields: RESPONSE_FIELDS,
    where,
    pagination: { page, pageSize },
    sort: 'respondedAt DESC',
  })

  // Get total count (approximation - MD v2 doesn't return total easily)
  // For MVP, we return the current page info
  return {
    data: responses,
    total: responses.length, // TODO: Implement proper count
    page,
    pageSize,
  }
}

// Query: hasOrderResponded
export const hasOrderResponded = async (
  _: unknown,
  { orderId, surveyId }: { orderId: string; surveyId: string },
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  const existing = await masterdata.searchDocuments({
    dataEntity: DATA_ENTITY_RESPONSES,
    schema: SCHEMA_RESPONSES,
    fields: ['id'],
    where: `orderId=${orderId} AND surveyId=${surveyId}`,
    pagination: { page: 1, pageSize: 1 },
  })

  return existing.length > 0
}

// Mutation: submitResponse
export const submitResponse = async (
  _: unknown,
  { input }: { input: ResponseInput },
  ctx: Context
) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  // RN-06: Verificar que no haya respondido ya este pedido
  const alreadyResponded = await hasOrderResponded(
    _,
    { orderId: input.orderId, surveyId: input.surveyId },
    ctx
  )

  if (alreadyResponded) {
    throw new UserInputError(
      'Este pedido ya tiene una respuesta registrada para esta encuesta.'
    )
  }

  // Crear respuesta
  const response = await masterdata.createDocument({
    dataEntity: DATA_ENTITY_RESPONSES,
    schema: SCHEMA_RESPONSES,
    fields: {
      ...input,
      respondedAt: now,
    },
  })

  // Incrementar responseCount en la encuesta (desnormalizacion)
  try {
    const survey = await masterdata.getDocument<{ responseCount?: number }>({
      dataEntity: DATA_ENTITY_SURVEYS,
      id: input.surveyId,
      fields: ['responseCount'],
    })

    await masterdata.updatePartialDocument({
      dataEntity: DATA_ENTITY_SURVEYS,
      id: input.surveyId,
      fields: { responseCount: (survey.responseCount || 0) + 1 },
    })
  } catch {
    // Si falla el incremento, no bloquear la respuesta
    console.warn('Failed to increment responseCount')
  }

  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_RESPONSES,
    id: response.DocumentId,
    fields: RESPONSE_FIELDS,
  })
}
