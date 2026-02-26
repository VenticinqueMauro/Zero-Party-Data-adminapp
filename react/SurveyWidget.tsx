import React, { FC, useState, CSSProperties } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { useOrder } from 'vtex.order-placed/OrderContext'

import GET_ACTIVE_SURVEY from './graphql/getActiveSurvey.graphql'
import HAS_ORDER_RESPONDED from './graphql/hasOrderResponded.graphql'
import SUBMIT_RESPONSE from './graphql/submitResponse.graphql'

/* ========================================
   Types
   ======================================== */

interface OrderContext {
  orderId?: string
  clientProfileData?: { email?: string }
}

interface ActiveSurvey {
  id: string
  question: string
  options: string[]
  allowOther: boolean
}

/* ========================================
   Styles
   ======================================== */

const containerStyle: CSSProperties = {
  border: '1px solid #e3e4e6',
  borderRadius: '8px',
  padding: '24px',
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '24px auto',
}

const questionStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#3f3f40',
  marginBottom: '20px',
  lineHeight: '1.5',
}

const optionsGridStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '10px',
}

const optionBtnBase: CSSProperties = {
  padding: '10px 20px',
  borderRadius: '4px',
  border: '1px solid #e3e4e6',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#3f3f40',
  fontWeight: 500,
  transition: 'all 0.15s ease',
  outline: 'none',
}

const optionBtnHovered: CSSProperties = {
  ...optionBtnBase,
  borderColor: '#134cd8',
  backgroundColor: '#f0f4ff',
  color: '#134cd8',
}

const otherInputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e3e4e6',
  borderRadius: '4px',
  fontSize: '14px',
  color: '#3f3f40',
  marginTop: '12px',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const thanksStyle: CSSProperties = {
  textAlign: 'center' as const,
  padding: '16px 0',
}

const labelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#979899',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '8px',
  display: 'block',
}

/* ========================================
   Sub-components
   ======================================== */

const CheckIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#e8f5e9" />
    <path
      d="M7 12.5L10.5 16L17 9"
      stroke="#3f9a38"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ========================================
   Option Button with hover state
   ======================================== */

const OptionButton: FC<{
  label: string
  onClick: () => void
  disabled: boolean
}> = ({ label, onClick, disabled }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      style={hovered && !disabled ? optionBtnHovered : optionBtnBase}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

/* ========================================
   Inner widget — rendered once we have survey + order data
   ======================================== */

interface InnerWidgetProps {
  survey: ActiveSurvey
  orderId: string
  clientEmail: string
}

const InnerWidget: FC<InnerWidgetProps> = ({
  survey,
  orderId,
  clientEmail,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: respondedData } = useQuery<{ hasOrderResponded: boolean }>(
    HAS_ORDER_RESPONDED,
    {
      variables: { orderId, surveyId: survey.id },
      skip: !orderId || !survey.id,
    }
  )

  const [submitResponse, { loading: submitting }] = useMutation(
    SUBMIT_RESPONSE,
    {
      onCompleted: () => setSubmitted(true),
    }
  )

  const alreadyResponded = respondedData?.hasOrderResponded === true

  if (alreadyResponded || submitted) {
    return (
      <div style={containerStyle}>
        <div style={thanksStyle}>
          <div style={{ marginBottom: '12px' }}>
            <CheckIcon />
          </div>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#3f3f40',
              margin: '0 0 4px 0',
            }}
          >
            ¡Gracias por tu respuesta!
          </p>
          <p style={{ fontSize: '14px', color: '#727273', margin: 0 }}>
            Nos ayuda a mejorar tu experiencia.
          </p>
        </div>
      </div>
    )
  }

  const handleOptionClick = (option: string) => {
    if (option === 'Otro' && survey.allowOther) {
      setSelectedOption('Otro')
      return
    }
    submitResponse({
      variables: {
        input: {
          surveyId: survey.id,
          selectedOption: option,
          orderId,
          clientEmail,
        },
      },
    })
  }

  const handleOtherSubmit = () => {
    if (!otherText.trim()) return
    submitResponse({
      variables: {
        input: {
          surveyId: survey.id,
          selectedOption: 'Otro',
          otherText: otherText.trim(),
          orderId,
          clientEmail,
        },
      },
    })
  }

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>
        Ayúdanos con una pregunta rápida{' '}
        <span role="img" aria-label="manos juntas">
          🙏
        </span>
      </span>
      <p style={questionStyle}>{survey.question}</p>

      <div style={optionsGridStyle}>
        {survey.options.map((option) => (
          <OptionButton
            key={option}
            label={option}
            disabled={submitting}
            onClick={() => handleOptionClick(option)}
          />
        ))}
        {survey.allowOther && !survey.options.includes('Otro') && (
          <OptionButton
            label="Otro"
            disabled={submitting}
            onClick={() => setSelectedOption('Otro')}
          />
        )}
      </div>

      {selectedOption === 'Otro' && (
        <div>
          <input
            style={otherInputStyle}
            type="text"
            placeholder="Contanos más..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleOtherSubmit()}
          />
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              style={{
                padding: '8px 20px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#134cd8',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor:
                  otherText.trim() && !submitting ? 'pointer' : 'not-allowed',
                opacity: otherText.trim() && !submitting ? 1 : 0.5,
              }}
              onClick={handleOtherSubmit}
              disabled={!otherText.trim() || submitting}
            >
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ========================================
   Main Widget — fetches active survey + order context
   ======================================== */

const SurveyWidget: FC = () => {
  const { data, loading } = useQuery<{ getActiveSurvey: ActiveSurvey | null }>(
    GET_ACTIVE_SURVEY
  )

  const { order } = useOrder()

  const survey = data?.getActiveSurvey
  const typedOrder = order as OrderContext
  const orderId: string = typedOrder?.orderId ?? ''
  const clientEmail: string = typedOrder?.clientProfileData?.email ?? ''

  if (loading || !survey || !orderId) return null

  return (
    <InnerWidget survey={survey} orderId={orderId} clientEmail={clientEmail} />
  )
}

export default SurveyWidget
