import { UserInputError } from '@vtex/api'

import {
  DATA_ENTITY_SURVEYS,
  SCHEMA_SURVEYS,
  SURVEY_FIELDS,
} from '../utils/constants'

interface SurveyInput {
  question: string
  options: string[]
  isActive?: boolean
  allowOther?: boolean
}

// Query: getSurveys
export const getSurveys = async (_: unknown, __: unknown, ctx: Context) => {
  const { masterdata } = ctx.clients

  const surveys = await masterdata.searchDocuments({
    dataEntity: DATA_ENTITY_SURVEYS,
    schema: SCHEMA_SURVEYS,
    fields: SURVEY_FIELDS,
    pagination: { page: 1, pageSize: 100 },
    sort: 'createdAt DESC',
  })

  return surveys
}

// Query: getSurvey
export const getSurvey = async (
  _: unknown,
  { id }: { id: string },
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  try {
    const survey = await masterdata.getDocument({
      dataEntity: DATA_ENTITY_SURVEYS,
      id,
      fields: SURVEY_FIELDS,
    })

    return survey
  } catch {
    return null
  }
}

// Query: getActiveSurvey
export const getActiveSurvey = async (
  _: unknown,
  __: unknown,
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  const surveys = await masterdata.searchDocuments({
    dataEntity: DATA_ENTITY_SURVEYS,
    schema: SCHEMA_SURVEYS,
    fields: SURVEY_FIELDS,
    where: 'isActive=true',
    pagination: { page: 1, pageSize: 1 },
  })

  return surveys[0] || null
}

// Mutation: createSurvey
export const createSurvey = async (
  _: unknown,
  { input }: { input: SurveyInput },
  ctx: Context
) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  // RN-04: Validar minimo 2 opciones
  if (input.options.length < 2) {
    throw new UserInputError(
      'La encuesta debe tener al menos 2 opciones de respuesta.'
    )
  }

  // RN-01/RN-02: Si se crea como activa, desactivar la actual
  if (input.isActive) {
    const activeSurveys = await masterdata.searchDocuments<{ id: string }>({
      dataEntity: DATA_ENTITY_SURVEYS,
      schema: SCHEMA_SURVEYS,
      fields: ['id'],
      where: 'isActive=true',
      pagination: { page: 1, pageSize: 10 },
    })

    for (const survey of activeSurveys) {
      await masterdata.updatePartialDocument({
        dataEntity: DATA_ENTITY_SURVEYS,
        id: survey.id,
        fields: { isActive: false, updatedAt: now },
      })
    }
  }

  // Crear documento
  const response = await masterdata.createDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    schema: SCHEMA_SURVEYS,
    fields: {
      ...input,
      isActive: input.isActive ?? false,
      allowOther: input.allowOther ?? false,
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  })

  // Retornar el documento creado
  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id: response.DocumentId,
    fields: SURVEY_FIELDS,
  })
}

// Mutation: updateSurvey
export const updateSurvey = async (
  _: unknown,
  { id, input }: { id: string; input: SurveyInput },
  ctx: Context
) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  // Verificar que existe
  const existing = await getSurvey(_, { id }, ctx)

  if (!existing) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // RN-04: Validar minimo 2 opciones
  if (input.options.length < 2) {
    throw new UserInputError(
      'La encuesta debe tener al menos 2 opciones de respuesta.'
    )
  }

  // RN-01/RN-02: Si se activa, desactivar otras
  if (input.isActive) {
    const activeSurveys = await masterdata.searchDocuments<{ id: string }>({
      dataEntity: DATA_ENTITY_SURVEYS,
      schema: SCHEMA_SURVEYS,
      fields: ['id'],
      where: 'isActive=true',
      pagination: { page: 1, pageSize: 10 },
    })

    for (const survey of activeSurveys) {
      if (survey.id !== id) {
        await masterdata.updatePartialDocument({
          dataEntity: DATA_ENTITY_SURVEYS,
          id: survey.id,
          fields: { isActive: false, updatedAt: now },
        })
      }
    }
  }

  await masterdata.updatePartialDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: {
      ...input,
      updatedAt: now,
    },
  })

  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: SURVEY_FIELDS,
  })
}

// Mutation: deleteSurvey
export const deleteSurvey = async (
  _: unknown,
  { id }: { id: string },
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  const survey = await getSurvey(_, { id }, ctx)

  if (!survey) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // RN-03: No eliminar encuesta activa
  if ((survey as { isActive: boolean }).isActive) {
    throw new UserInputError(
      'No se puede eliminar una encuesta activa. Desactivela primero.'
    )
  }

  // Eliminar respuestas asociadas
  // TODO: Implementar scroll para eliminar todas las respuestas

  // Eliminar la encuesta
  await masterdata.deleteDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
  })

  return true
}

// Mutation: toggleSurveyStatus
export const toggleSurveyStatus = async (
  _: unknown,
  { id, isActive }: { id: string; isActive: boolean },
  ctx: Context
) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  const survey = await getSurvey(_, { id }, ctx)

  if (!survey) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // RN-01: Si se activa, desactivar cualquier otra activa
  if (isActive) {
    const activeSurveys = await masterdata.searchDocuments<{ id: string }>({
      dataEntity: DATA_ENTITY_SURVEYS,
      schema: SCHEMA_SURVEYS,
      fields: ['id'],
      where: 'isActive=true',
      pagination: { page: 1, pageSize: 10 },
    })

    for (const s of activeSurveys) {
      if (s.id !== id) {
        await masterdata.updatePartialDocument({
          dataEntity: DATA_ENTITY_SURVEYS,
          id: s.id,
          fields: { isActive: false, updatedAt: now },
        })
      }
    }
  }

  await masterdata.updatePartialDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: { isActive, updatedAt: now },
  })

  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: SURVEY_FIELDS,
  })
}
