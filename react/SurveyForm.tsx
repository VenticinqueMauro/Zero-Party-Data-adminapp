import React, { FC, useState, useEffect, CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Input,
  Checkbox,
  Button,
  Alert,
} from 'vtex.styleguide'
import { withRuntimeContext } from 'vtex.render-runtime'
import { useQuery, useMutation } from 'react-apollo'

import { Survey, RuntimeProps, RouteParams } from './types'
import { SurveyFormSkeleton } from './Skeleton'
import GET_SURVEY from './graphql/getSurvey.graphql'
import GET_SURVEYS from './graphql/getSurveys.graphql'
import CREATE_SURVEY from './graphql/createSurvey.graphql'
import UPDATE_SURVEY from './graphql/updateSurvey.graphql'

type Props = RuntimeProps & RouteParams

const MIN_OPTIONS = 2

const cardStyle: CSSProperties = {
  border: '1px solid #e3e4e6',
  borderRadius: '4px',
  padding: '24px',
  backgroundColor: '#ffffff',
}

const numberBadge: CSSProperties = {
  width: '24px',
  minWidth: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#f2f4f5',
  fontSize: '12px',
  fontWeight: 600,
  color: '#727273',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
}

const removeBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: '#979899',
  padding: '6px',
  borderRadius: '4px',
}

const addBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#134cd8',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '6px 0',
  marginTop: '8px',
}

const SurveyForm: FC<Props> = ({ runtime, params }) => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [allowOther, setAllowOther] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = Boolean(params?.id)
  const surveyId = params?.id

  const { data: surveyData, loading: surveyLoading } = useQuery<{
    getSurvey: Survey
  }>(GET_SURVEY, {
    variables: { id: surveyId },
    skip: !isEditMode || !surveyId,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!surveyData?.getSurvey) return
    const survey = surveyData.getSurvey
    setQuestion(survey.question)
    setOptions(survey.options)
    setAllowOther(survey.allowOther)
  }, [surveyData])

  const handleBack = () => {
    runtime.navigate({ page: 'admin.app.zpd-surveys' })
  }

  const [createSurvey, { loading: creating }] = useMutation(CREATE_SURVEY, {
    refetchQueries: [{ query: GET_SURVEYS }],
    awaitRefetchQueries: true,
    onCompleted: () => handleBack(),
    onError: (err: { message: string }) => setError(err.message),
  })

  const [updateSurvey, { loading: updating }] = useMutation(UPDATE_SURVEY, {
    refetchQueries: [{ query: GET_SURVEYS }],
    awaitRefetchQueries: true,
    onCompleted: () => handleBack(),
    onError: (err: { message: string }) => setError(err.message),
  })

  const isSaving = creating || updating

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value)
    setError(null)
  }

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
    setError(null)
  }

  const handleAddOption = () => {
    setOptions((prev) => [...prev, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAllowOtherChange = () => {
    setAllowOther((prev) => !prev)
  }

  const validateForm = (): boolean => {
    if (!question.trim()) {
      setError('La pregunta es obligatoria')
      return false
    }
    const validOptions = options.filter((opt) => opt.trim() !== '')
    if (validOptions.length < MIN_OPTIONS) {
      setError(`Se requieren al menos ${MIN_OPTIONS} opciones de respuesta`)
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validateForm()) return

    const input = {
      question: question.trim(),
      options: options.filter((opt) => opt.trim() !== ''),
      allowOther,
    }

    if (isEditMode && surveyId) {
      updateSurvey({ variables: { id: surveyId, input } })
    } else {
      createSurvey({ variables: { input } })
    }
  }

  const renderOptionInput = (option: string, index: number) => {
    const canDelete = options.length > MIN_OPTIONS

    return (
      <div
        key={index}
        style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}
      >
        <div style={numberBadge}>{index + 1}</div>
        <div style={{ flex: '1 1 auto', marginRight: '12px' }}>
          <Input
            placeholder={`Opción ${index + 1}`}
            value={option}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleOptionChange(index, e.target.value)
            }
          />
        </div>
        {canDelete && (
          <button
            type="button"
            style={removeBtn}
            onClick={() => handleRemoveOption(index)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }

  const pageTitle = isEditMode ? (
    <FormattedMessage id="admin/zpd.form.edit" />
  ) : (
    <FormattedMessage id="admin/zpd.surveys.new" />
  )

  if (isEditMode && surveyLoading) {
    return (
      <Layout
        pageHeader={
          <PageHeader
            title={pageTitle}
            linkLabel={<FormattedMessage id="admin/zpd.form.cancel" />}
            onLinkClick={handleBack}
          />
        }
      >
        <PageBlock variation="full">
          <SurveyFormSkeleton />
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={pageTitle}
          linkLabel={<FormattedMessage id="admin/zpd.form.cancel" />}
          onLinkClick={handleBack}
        />
      }
    >
      <PageBlock variation="full">
        {error && (
          <div className="mb5">
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        <div style={cardStyle}>
          {/* Question */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '12px',
                fontSize: '14px',
              }}
            >
              <FormattedMessage id="admin/zpd.survey.question" />{' '}
              <span style={{ color: '#ff4c4c' }}>*</span>
            </span>
            <Input
              placeholder="Ej: ¿Cómo nos conociste?"
              value={question}
              onChange={handleQuestionChange}
              size="large"
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '12px',
                fontSize: '14px',
              }}
            >
              <FormattedMessage id="admin/zpd.survey.options" />{' '}
              <span
                style={{ color: '#727273', fontWeight: 400, fontSize: '12px' }}
              >
                (mín. {MIN_OPTIONS})
              </span>
            </span>
            {options.map((option, index) => renderOptionInput(option, index))}
            <button type="button" style={addBtnStyle} onClick={handleAddOption}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3.33334V12.6667M3.33333 8.00001H12.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                <FormattedMessage id="admin/zpd.survey.options.add" />
              </span>
            </button>
          </div>

          {/* Allow Other */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #e3e4e6' }}>
            <Checkbox
              id="allowOther"
              name="allowOther"
              checked={allowOther}
              onChange={handleAllowOtherChange}
              label={<FormattedMessage id="admin/zpd.survey.allowOther" />}
            />
          </div>
        </div>

        {/* Save / Cancel buttons */}
        <div className="flex mt5">
          <div className="mr3">
            <Button
              variation="primary"
              onClick={handleSave}
              isLoading={isSaving}
            >
              <FormattedMessage id="admin/zpd.form.save" />
            </Button>
          </div>
          <Button variation="tertiary" onClick={handleBack} disabled={isSaving}>
            <FormattedMessage id="admin/zpd.form.cancel" />
          </Button>
        </div>
      </PageBlock>
    </Layout>
  )
}

export default withRuntimeContext(SurveyForm)
