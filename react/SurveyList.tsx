import React, { FC, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Tag,
  Modal,
  EmptyState,
} from 'vtex.styleguide'
import { withRuntimeContext } from 'vtex.render-runtime'

import { Survey, RuntimeProps } from './types'
import { MOCK_SURVEYS } from './mocks/data'

type Props = RuntimeProps

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const SurveyList: FC<Props> = ({ runtime }) => {
  const [surveys, setSurveys] = useState<Survey[]>(MOCK_SURVEYS)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null)

  const handleNewSurvey = () => {
    runtime.navigate({ page: 'admin.app.zpd-surveys-new' })
  }

  const handleEdit = (id: string) => {
    runtime.navigate({
      page: 'admin.app.zpd-surveys-edit',
      params: { id },
    })
  }

  const handleViewResponses = (id: string) => {
    runtime.navigate({
      page: 'admin.app.zpd-surveys-responses',
      params: { id },
    })
  }

  const handleToggleStatus = (id: string) => {
    setSurveys((prev) =>
      prev.map((survey) => {
        if (survey.id === id) {
          return { ...survey, isActive: !survey.isActive }
        }
        if (survey.isActive && !surveys.find((s) => s.id === id)?.isActive) {
          return { ...survey, isActive: false }
        }
        return survey
      })
    )
  }

  const handleDeleteClick = (id: string) => {
    setSurveyToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (surveyToDelete) {
      setSurveys((prev) => prev.filter((s) => s.id !== surveyToDelete))
    }
    setIsDeleteModalOpen(false)
    setSurveyToDelete(null)
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setSurveyToDelete(null)
  }

  const renderSurveyCard = (survey: Survey) => {
    const statusTag = survey.isActive ? (
      <Tag bgColor="#8BC34A" color="#FFFFFF">
        <FormattedMessage id="admin/zpd.survey.status.active" />
      </Tag>
    ) : (
      <Tag bgColor="#757575" color="#FFFFFF">
        <FormattedMessage id="admin/zpd.survey.status.inactive" />
      </Tag>
    )

    return (
      <div
        key={survey.id}
        className="bg-white pa5 br3 shadow-1 mb4"
        style={{ border: '1px solid #e3e4e6' }}
      >
        <div className="flex justify-between items-start mb4">
          <h3 className="f5 fw6 ma0 truncate" style={{ maxWidth: '70%' }}>
            {survey.question}
          </h3>
          {statusTag}
        </div>

        <div className="flex mb4 gray">
          <div className="mr5">
            <span className="fw6">{survey.responseCount}</span>{' '}
            <FormattedMessage id="admin/zpd.survey.responses" />
          </div>
          <div>
            <FormattedMessage id="admin/zpd.survey.created" />:{' '}
            {formatDate(survey.createdAt)}
          </div>
        </div>

        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          <Button
            size="small"
            variation={survey.isActive ? 'danger-tertiary' : 'primary'}
            onClick={() => handleToggleStatus(survey.id)}
          >
            {survey.isActive ? (
              <FormattedMessage id="admin/zpd.form.deactivate" />
            ) : (
              <FormattedMessage id="admin/zpd.form.activate" />
            )}
          </Button>
          <Button
            size="small"
            variation="tertiary"
            onClick={() => handleEdit(survey.id)}
          >
            <FormattedMessage id="admin/zpd.form.edit" />
          </Button>
          <Button
            size="small"
            variation="tertiary"
            onClick={() => handleViewResponses(survey.id)}
          >
            <FormattedMessage id="admin/zpd.form.viewResponses" />
          </Button>
          <Button
            size="small"
            variation="danger-tertiary"
            disabled={survey.isActive}
            onClick={() => handleDeleteClick(survey.id)}
          >
            <FormattedMessage id="admin/zpd.form.delete" />
          </Button>
        </div>
      </div>
    )
  }

  const renderEmptyState = () => (
    <EmptyState title={<FormattedMessage id="admin/zpd.surveys.empty" />}>
      <p>
        <FormattedMessage id="admin/zpd.surveys.empty.description" />
      </p>
      <div className="pt5">
        <Button variation="primary" onClick={handleNewSurvey}>
          <FormattedMessage id="admin/zpd.surveys.new" />
        </Button>
      </div>
    </EmptyState>
  )

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin/zpd.surveys.title" />}
          subtitle={<FormattedMessage id="admin/zpd.surveys.subtitle" />}
        >
          <Button variation="primary" onClick={handleNewSurvey}>
            <FormattedMessage id="admin/zpd.surveys.new" />
          </Button>
        </PageHeader>
      }
    >
      <PageBlock variation="full">
        {surveys.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="flex flex-wrap" style={{ margin: '-8px' }}>
            {surveys.map((survey) => (
              <div key={survey.id} className="w-100 w-50-m w-third-l pa2">
                {renderSurveyCard(survey)}
              </div>
            ))}
          </div>
        )}
      </PageBlock>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        title={<FormattedMessage id="admin/zpd.form.delete" />}
        bottomBar={
          <div className="flex justify-end">
            <div className="mr3">
              <Button variation="tertiary" onClick={handleDeleteCancel}>
                <FormattedMessage id="admin/zpd.form.cancel" />
              </Button>
            </div>
            <Button variation="danger" onClick={handleDeleteConfirm}>
              <FormattedMessage id="admin/zpd.form.delete" />
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this survey?</p>
      </Modal>
    </Layout>
  )
}

export default withRuntimeContext(SurveyList)
