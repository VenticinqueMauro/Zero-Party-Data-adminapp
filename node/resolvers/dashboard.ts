import { UserInputError } from '@vtex/api'

import {
  DATA_ENTITY_SURVEYS,
  DATA_ENTITY_RESPONSES,
  SCHEMA_RESPONSES,
} from '../utils/constants'

interface ResponseWithOption {
  selectedOption: string
}

interface SurveyBasic {
  id: string
  question: string
  responseCount?: number
}

// Query: getSurveyDashboard
export const getSurveyDashboard = async (
  _: unknown,
  { surveyId }: { surveyId: string },
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  // Obtener info de la encuesta
  let survey: SurveyBasic

  try {
    survey = await masterdata.getDocument<SurveyBasic>({
      dataEntity: DATA_ENTITY_SURVEYS,
      id: surveyId,
      fields: ['id', 'question', 'responseCount'],
    })
  } catch {
    throw new UserInputError('Encuesta no encontrada')
  }

  if (!survey) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // Obtener todas las respuestas con paginacion
  // MD v2 tiene limite de 100 por pagina, usamos scroll pattern
  const allResponses: ResponseWithOption[] = []
  let page = 1
  const pageSize = 100
  let hasMore = true

  while (hasMore) {
    const batch = await masterdata.searchDocuments<ResponseWithOption>({
      dataEntity: DATA_ENTITY_RESPONSES,
      schema: SCHEMA_RESPONSES,
      fields: ['selectedOption'],
      where: `surveyId=${surveyId}`,
      pagination: { page, pageSize },
    })

    allResponses.push(...batch)
    hasMore = batch.length === pageSize
    page++

    // Safety limit to avoid infinite loops
    if (page > 100) break
  }

  // Agregar por opcion
  const counts: Record<string, number> = {}

  for (const resp of allResponses) {
    counts[resp.selectedOption] = (counts[resp.selectedOption] || 0) + 1
  }

  const total = allResponses.length
  const distribution = Object.entries(counts)
    .map(([option, count]) => ({
      option,
      count,
      percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    surveyId,
    question: survey.question,
    totalResponses: total,
    distribution,
  }
}
