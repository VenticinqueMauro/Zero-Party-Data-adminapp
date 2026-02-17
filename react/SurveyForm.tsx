import React, { FC, useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Input,
  Checkbox,
  Button,
  IconDelete,
  Alert,
} from 'vtex.styleguide'
import { withRuntimeContext } from 'vtex.render-runtime'

import { RuntimeProps, RouteParams } from './types'
import { findSurveyById } from './mocks/data'

type Props = RuntimeProps & RouteParams

const MIN_OPTIONS = 2

const SurveyForm: FC<Props> = ({ runtime, params }) => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [allowOther, setAllowOther] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = Boolean(params?.id)
  const surveyId = params?.id

  useEffect(() => {
    if (!isEditMode || !surveyId) return

    const survey = findSurveyById(surveyId)
    if (!survey) return

    setQuestion(survey.question)
    setOptions(survey.options)
    setAllowOther(survey.allowOther)
  }, [isEditMode, surveyId])

  const handleBack = () => {
    runtime.navigate({ page: 'admin.app.zpd-surveys' })
  }

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
      setError('Question is required')
      return false
    }

    const validOptions = options.filter((opt) => opt.trim() !== '')
    if (validOptions.length < MIN_OPTIONS) {
      setError(`At least ${MIN_OPTIONS} options are required`)
      return false
    }

    return true
  }

  const handleSave = () => {
    if (!validateForm()) return
    handleBack()
  }

  const renderOptionInput = (option: string, index: number) => {
    const canDelete = options.length > MIN_OPTIONS

    return (
      <div key={index} className="flex items-center mb3">
        <div className="flex-auto mr3">
          <Input
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleOptionChange(index, e.target.value)
            }
          />
        </div>
        {canDelete && (
          <Button
            variation="danger-tertiary"
            size="small"
            onClick={() => handleRemoveOption(index)}
          >
            <IconDelete />
          </Button>
        )}
      </div>
    )
  }

  const pageTitle = isEditMode ? (
    <FormattedMessage id="admin/zpd.form.edit" />
  ) : (
    <FormattedMessage id="admin/zpd.surveys.new" />
  )

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

        <div className="mb5">
          <span className="db fw6 mb2">
            <FormattedMessage id="admin/zpd.survey.question" />
          </span>
          <Input
            placeholder="E.g.: How did you hear about us?"
            value={question}
            onChange={handleQuestionChange}
            size="large"
          />
        </div>

        <div className="mb5">
          <span className="db fw6 mb3">
            <FormattedMessage id="admin/zpd.survey.options" />
          </span>
          {options.map((option, index) => renderOptionInput(option, index))}
          <Button variation="tertiary" size="small" onClick={handleAddOption}>
            <FormattedMessage id="admin/zpd.survey.options.add" />
          </Button>
        </div>

        <div className="mb5">
          <Checkbox
            id="allowOther"
            name="allowOther"
            checked={allowOther}
            onChange={handleAllowOtherChange}
            label={<FormattedMessage id="admin/zpd.survey.allowOther" />}
          />
        </div>

        <div className="flex mt6">
          <div className="mr3">
            <Button variation="primary" onClick={handleSave}>
              <FormattedMessage id="admin/zpd.form.save" />
            </Button>
          </div>
          <Button variation="tertiary" onClick={handleBack}>
            <FormattedMessage id="admin/zpd.form.cancel" />
          </Button>
        </div>
      </PageBlock>
    </Layout>
  )
}

export default withRuntimeContext(SurveyForm)
