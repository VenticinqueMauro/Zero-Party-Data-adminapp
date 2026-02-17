export const DATA_ENTITY_SURVEYS = 'zpd_surveys'
export const DATA_ENTITY_RESPONSES = 'zpd_responses'

export const SCHEMA_SURVEYS = 'survey-schema-v1'
export const SCHEMA_RESPONSES = 'response-schema-v1'

export const SURVEY_FIELDS = [
  'id',
  'question',
  'options',
  'isActive',
  'allowOther',
  'responseCount',
  'createdAt',
  'updatedAt',
]

export const RESPONSE_FIELDS = [
  'id',
  'surveyId',
  'selectedOption',
  'otherText',
  'orderId',
  'clientEmail',
  'respondedAt',
]
