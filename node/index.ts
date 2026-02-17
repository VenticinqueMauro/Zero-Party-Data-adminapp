import type { ClientsConfig, ServiceContext, RecorderState } from '@vtex/api'
import { Service } from '@vtex/api'

import { Clients } from './clients'
import {
  getSurveys,
  getSurvey,
  getActiveSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  toggleSurveyStatus,
} from './resolvers/survey'
import {
  getResponses,
  submitResponse,
  hasOrderResponded,
} from './resolvers/response'
import { getSurveyDashboard } from './resolvers/dashboard'

const TIMEOUT_MS = 5000

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, RecorderState>
}

export default new Service({
  clients,
  graphql: {
    resolvers: {
      Query: {
        getSurveys,
        getSurvey,
        getActiveSurvey,
        getResponses,
        getSurveyDashboard,
        hasOrderResponded,
      },
      Mutation: {
        createSurvey,
        updateSurvey,
        deleteSurvey,
        toggleSurveyStatus,
        submitResponse,
      },
    },
  },
})
