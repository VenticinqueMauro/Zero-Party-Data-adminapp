import React, { FC, useState, useMemo, CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Modal,
  EmptyState,
  Toggle,
  Input,
  Alert,
} from 'vtex.styleguide'
import { withRuntimeContext } from 'vtex.render-runtime'
import { useQuery, useMutation } from 'react-apollo'

import { Survey, RuntimeProps } from './types'
import { SurveyListSkeleton } from './Skeleton'
import GET_SURVEYS from './graphql/getSurveys.graphql'
import TOGGLE_SURVEY_STATUS from './graphql/toggleSurveyStatus.graphql'
import DELETE_SURVEY from './graphql/deleteSurvey.graphql'

type Props = RuntimeProps

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/* ========================================
   Styles — full-width list layout
   ======================================== */

const card: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e3e4e6',
  borderRadius: '4px',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
}

const cardInfoLeft: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
}

const cardTitle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#3f3f40',
  margin: '0 0 4px 0',
  lineHeight: '1.4',
}

const cardMeta: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '6px',
  margin: '6px 0 0 0',
}

const badge: CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 500,
  color: '#727273',
  backgroundColor: '#f2f2f2',
  borderRadius: '100px',
  padding: '2px 10px',
  lineHeight: '1.6',
  whiteSpace: 'nowrap' as const,
}

const toggleWrap: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '8px',
}

const toggleLabel: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
}

const cardActionsRight: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexShrink: 0,
}

const iconBtn: CSSProperties = {
  display: 'flex',
  cursor: 'pointer',
  outline: 'none',
  padding: '4px',
}

/* ========================================
   Component
   ======================================== */

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.707 13.293L13 10.586C13.63 9.536 14 8.311 14 7C14 3.14 10.859 0 7 0C3.141 0 0 3.14 0 7C0 10.86 3.141 14 7 14C8.312 14 9.536 13.631 10.586 13L13.293 15.707C13.488 15.902 13.744 16 14 16C14.256 16 14.512 15.902 14.707 15.707L15.707 14.707C16.098 14.316 16.098 13.684 15.707 13.293ZM7 12C4.239 12 2 9.761 2 7C2 4.239 4.239 2 7 2C9.761 2 12 4.239 12 7C12 9.761 9.761 12 7 12Z"
      fill="currentColor"
    />
  </svg>
)

const SurveyList: FC<Props> = ({ runtime }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { data, loading, error, refetch } = useQuery<{ getSurveys: Survey[] }>(
    GET_SURVEYS
  )

  const [toggleStatus] = useMutation(TOGGLE_SURVEY_STATUS, {
    onCompleted: () => refetch(),
    onError: (err: { message: string }) => setMutationError(err.message),
  })

  const [deleteSurvey] = useMutation(DELETE_SURVEY, {
    onCompleted: () => {
      setIsDeleteModalOpen(false)
      setSurveyToDelete(null)
      refetch()
    },
    onError: (err: { message: string }) => {
      setIsDeleteModalOpen(false)
      setMutationError(err.message)
    },
  })

  const surveys: Survey[] = data?.getSurveys ?? []

  const filteredSurveys = useMemo(() => {
    if (!searchTerm.trim()) return surveys
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[¿?]/g, '')
        .trim()
    const term = normalize(searchTerm)
    return surveys.filter((s: Survey) => normalize(s.question).includes(term))
  }, [surveys, searchTerm])

  const handleNewSurvey = () => {
    runtime.navigate({ page: 'admin.app.zpd-surveys-new' })
  }

  const handleEdit = (id: string) => {
    runtime.navigate({ page: 'admin.app.zpd-surveys-edit', params: { id } })
  }

  const handleViewResponses = (id: string) => {
    runtime.navigate({
      page: 'admin.app.zpd-surveys-responses',
      params: { id },
    })
  }

  const handleToggleStatus = (survey: Survey) => {
    setMutationError(null)
    toggleStatus({ variables: { id: survey.id, isActive: !survey.isActive } })
  }

  const handleDeleteClick = (id: string) => {
    setSurveyToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (surveyToDelete) {
      setMutationError(null)
      deleteSurvey({ variables: { id: surveyToDelete } })
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setSurveyToDelete(null)
  }

  const renderCard = (survey: Survey) => {
    const optionsSummary = `${survey.options.length} opciones`

    return (
      <div style={card}>
        {/* ---- Left: Info ---- */}
        <div style={cardInfoLeft}>
          <p style={cardTitle}>{survey.question}</p>
          <div style={cardMeta}>
            <span style={badge}>{optionsSummary}</span>
            {survey.allowOther && (
              <span style={badge}>Permite &quot;Otro&quot;</span>
            )}
            <span style={badge}>
              <strong>{survey.responseCount}</strong> respuestas
            </span>
            <span style={badge}>Creada: {formatDate(survey.createdAt)}</span>
          </div>
          <div style={toggleWrap}>
            <Toggle
              semantic
              checked={survey.isActive}
              onChange={() => handleToggleStatus(survey)}
            />
            <span
              style={{
                ...toggleLabel,
                color: survey.isActive ? '#3f9a38' : '#979899',
              }}
            >
              {survey.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        {/* ---- Right: Icon Actions ---- */}
        <div style={cardActionsRight}>
          <div
            role="button"
            tabIndex={0}
            style={iconBtn}
            title="Ver Respuestas"
            onClick={() => handleViewResponses(survey.id)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleViewResponses(survey.id)
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 12H2V1C2 0.4 1.6 0 1 0C0.4 0 0 0.4 0 1V13C0 13.6 0.4 14 1 14H15C15.6 14 16 13.6 16 13C16 12.4 15.6 12 15 12Z"
                fill="silver"
              />
              <path
                d="M4.7 9.7C5.1 10.1 5.7 10.1 6.1 9.7L8 7.8L10.3 10.1C10.7 10.5 11.3 10.5 11.7 10.1L15.7 6.1C16.1 5.7 16.1 5.1 15.7 4.7C15.3 4.3 14.7 4.3 14.3 4.7L11 8L8.7 5.7C8.3 5.3 7.7 5.3 7.3 5.7L4.7 8.3C4.3 8.7 4.3 9.3 4.7 9.7Z"
                fill="silver"
              />
            </svg>
          </div>
          <div
            role="button"
            tabIndex={0}
            style={iconBtn}
            title="Editar"
            onClick={() => handleEdit(survey.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit(survey.id)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7 0.3C11.3 -0.1 10.7 -0.1 10.3 0.3L0.3 10.3C0.1 10.5 0 10.7 0 11V15C0 15.6 0.4 16 1 16H5C5.3 16 5.5 15.9 5.7 15.7L15.7 5.7C16.1 5.3 16.1 4.7 15.7 4.3L11.7 0.3ZM4.6 14H2V11.4L8 5.4L10.6 8L4.6 14ZM12 6.6L9.4 4L11 2.4L13.6 5L12 6.6Z"
                fill="silver"
              />
            </svg>
          </div>
          <div
            role="button"
            tabIndex={survey.isActive ? -1 : 0}
            style={{
              ...iconBtn,
              opacity: survey.isActive ? 0.3 : 1,
              cursor: survey.isActive ? 'not-allowed' : 'pointer',
            }}
            title="Eliminar"
            onClick={() => !survey.isActive && handleDeleteClick(survey.id)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !survey.isActive &&
              handleDeleteClick(survey.id)
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 3H10V2C10 0.9 9.1 0 8 0C6.9 0 6 0.9 6 2V3H3C2.4 3 2 3.4 2 4C2 4.6 2.4 5 3 5H3.1L3.9 14.1C4 15.2 4.9 16 6 16H10C11.1 16 12 15.2 12.1 14.1L12.9 5H13C13.6 5 14 4.6 14 4C14 3.4 13.6 3 13 3ZM8 2C8.6 2 8 2.4 8 3H8C8 2.4 7.4 2 8 2ZM10.1 14H5.9L5.1 5H10.9L10.1 14Z"
                fill="#ff4c4c"
              />
            </svg>
          </div>
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
        {mutationError && (
          <div className="mb4">
            <Alert type="error" onClose={() => setMutationError(null)}>
              {mutationError}
            </Alert>
          </div>
        )}

        {loading && <SurveyListSkeleton />}

        {error && !loading && (
          <Alert type="error">
            Error al cargar las encuestas. Por favor, recargá la página.
          </Alert>
        )}

        {!loading && !error && surveys.length === 0 && renderEmptyState()}

        {!loading && !error && surveys.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '16px',
            }}
          >
            {/* Search input */}
            <div>
              <Input
                placeholder="Buscar por nombre de encuesta"
                type="search"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                suffix={
                  <span className="pointer c-link flex items-center">
                    <SearchIcon />
                  </span>
                }
              />
            </div>

            {/* Survey list */}
            {filteredSurveys.length === 0 ? (
              <div
                style={{
                  textAlign: 'center' as const,
                  padding: '32px 0',
                  color: '#979899',
                  fontSize: '14px',
                }}
              >
                No se encontraron encuestas que coincidan con &quot;{searchTerm}
                &quot;
              </div>
            ) : (
              filteredSurveys.map((survey: Survey) => (
                <div key={survey.id}>{renderCard(survey)}</div>
              ))
            )}
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
        <p>
          ¿Estás seguro de que querés eliminar esta encuesta? Se eliminarán
          también todas las respuestas asociadas.
        </p>
      </Modal>
    </Layout>
  )
}

export default withRuntimeContext(SurveyList)
