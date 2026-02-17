/**
 * Survey entity representing a post-purchase survey configuration
 */
export interface Survey {
  id: string
  question: string
  options: string[]
  isActive: boolean
  allowOther: boolean
  responseCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Individual survey response from a customer
 */
export interface SurveyResponse {
  id: string
  surveyId: string
  selectedOption: string
  otherText?: string
  orderId: string
  clientEmail: string
  respondedAt: string
}

/**
 * Distribution count for a single option in dashboard
 */
export interface OptionCount {
  option: string
  count: number
  percentage: number
}

/**
 * Navigation parameters for VTEX runtime
 */
export interface NavigateParams {
  page: string
  params?: Record<string, string>
}

/**
 * VTEX Runtime context interface
 */
export interface RuntimeContext {
  navigate: (params: NavigateParams) => void
}

/**
 * Props for components using runtime context
 */
export interface RuntimeProps {
  runtime: RuntimeContext
}

/**
 * Props for components with route params
 */
export interface RouteParams {
  params?: {
    id?: string
  }
}
