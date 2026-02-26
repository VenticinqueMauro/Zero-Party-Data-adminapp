import React, { FC, useState, CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Table,
  Pagination,
  Input,
  Tag,
  Alert,
} from 'vtex.styleguide'
import { withRuntimeContext } from 'vtex.render-runtime'
import { useQuery } from 'react-apollo'

import { RuntimeProps, RouteParams, SurveyResponse, OptionCount } from './types'
import { DashboardSkeleton, ResponsesTableSkeleton } from './Skeleton'
import GET_SURVEY_DASHBOARD from './graphql/getSurveyDashboard.graphql'
import GET_RESPONSES from './graphql/getResponses.graphql'

type Props = RuntimeProps & RouteParams

const PAGE_SIZE = 5

const cardStyle: CSSProperties = {
  border: '1px solid #e3e4e6',
  borderRadius: '4px',
  padding: '24px',
  backgroundColor: '#ffffff',
}

const barRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
}

const barLabelStyle: CSSProperties = {
  width: '120px',
  minWidth: '120px',
  fontSize: '13px',
  color: '#3f3f40',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  paddingRight: '12px',
}

const barTrackStyle: CSSProperties = {
  flex: 1,
  height: '28px',
  backgroundColor: '#f2f4f5',
  borderRadius: '4px',
  overflow: 'hidden',
}

const barCountStyle: CSSProperties = {
  width: '40px',
  minWidth: '40px',
  textAlign: 'right' as const,
  fontSize: '13px',
  fontWeight: 600,
  color: '#3f3f40',
  paddingLeft: '12px',
}

const barPercentStyle: CSSProperties = {
  width: '52px',
  minWidth: '52px',
  textAlign: 'right' as const,
  fontSize: '12px',
  color: '#727273',
  paddingLeft: '4px',
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const BarChart: FC<{ distribution: OptionCount[] }> = ({ distribution }) => {
  if (!distribution.length) return null
  const maxCount = Math.max(...distribution.map((d) => d.count))

  return (
    <div style={{ paddingTop: '12px', paddingBottom: '4px' }}>
      {distribution.map((item) => (
        <div key={item.option} style={barRowStyle}>
          <div style={barLabelStyle} title={item.option}>
            {item.option}
          </div>
          <div style={barTrackStyle}>
            <div
              style={{
                height: '100%',
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #134cd8 0%, #3d6de5 100%)',
                width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                minWidth: item.count > 0 ? '4px' : '0',
                transition: 'width 0.5s ease-in-out',
              }}
            />
          </div>
          <div style={barCountStyle}>{item.count}</div>
          <div style={barPercentStyle}>({item.percentage}%)</div>
        </div>
      ))}
    </div>
  )
}

interface DashboardData {
  getSurveyDashboard: {
    surveyId: string
    question: string
    totalResponses: number
    distribution: OptionCount[]
  }
}

interface ResponsesData {
  getResponses: {
    data: SurveyResponse[]
    total: number
    page: number
    pageSize: number
  }
}

const SurveyResponses: FC<Props> = ({ runtime, params }) => {
  const surveyId = params?.id ?? ''

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useQuery<DashboardData>(GET_SURVEY_DASHBOARD, {
    variables: { surveyId },
    skip: !surveyId,
  })

  const {
    data: responsesData,
    loading: responsesLoading,
    error: responsesError,
  } = useQuery<ResponsesData>(GET_RESPONSES, {
    variables: {
      surveyId,
      page: currentPage,
      pageSize: PAGE_SIZE,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    skip: !surveyId,
  })

  const handleBack = () => {
    runtime.navigate({ page: 'admin.app.zpd-surveys' })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const dashboard = dashboardData?.getSurveyDashboard
  const responseList = responsesData?.getResponses
  const responses = responseList?.data ?? []
  const totalResponses = responseList?.total ?? 0
  const totalPages = Math.ceil(totalResponses / PAGE_SIZE)

  const tableSchema = {
    properties: {
      clientEmail: {
        title: <FormattedMessage id="admin/zpd.responses.email" />,
        width: 250,
      },
      selectedOption: {
        title: <FormattedMessage id="admin/zpd.responses.option" />,
        // eslint-disable-next-line react/display-name
        cellRenderer: ({
          cellData,
          rowData,
        }: {
          cellData: string
          rowData: SurveyResponse
        }) => {
          const isOther = cellData === 'Otro' && rowData.otherText
          const displayText = isOther ? `Otro: ${rowData.otherText}` : cellData

          return (
            <Tag
              bgColor={isOther ? '#e7eaf4' : '#f2f4f5'}
              color={isOther ? '#134cd8' : '#3f3f40'}
            >
              {displayText}
            </Tag>
          )
        },
      },
      orderId: {
        title: <FormattedMessage id="admin/zpd.responses.orderId" />,
        width: 150,
      },
      respondedAt: {
        title: <FormattedMessage id="admin/zpd.responses.date" />,
        width: 180,
        cellRenderer: ({ cellData }: { cellData: string }) =>
          formatDate(cellData),
      },
    },
  }

  if (!surveyId) {
    return (
      <Layout
        pageHeader={
          <PageHeader
            title="Encuesta no encontrada"
            linkLabel={<FormattedMessage id="admin/zpd.form.cancel" />}
            onLinkClick={handleBack}
          />
        }
      >
        <PageBlock variation="full">
          <Alert type="error">
            No se encontró el ID de la encuesta. Volvé a la lista.
          </Alert>
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin/zpd.responses.title" />}
          subtitle={dashboard?.question ?? ''}
          linkLabel={<FormattedMessage id="admin/zpd.form.cancel" />}
          onLinkClick={handleBack}
        />
      }
    >
      {/* Dashboard */}
      <PageBlock
        title={<FormattedMessage id="admin/zpd.dashboard.title" />}
        variation="full"
      >
        <div style={cardStyle}>
          {dashboardError && (
            <Alert type="error">
              Error al cargar el dashboard. Intentá recargar la página.
            </Alert>
          )}

          {dashboardLoading && <DashboardSkeleton />}

          {!dashboardLoading && dashboard && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#3f3f40',
                    lineHeight: 1,
                  }}
                >
                  {dashboard.totalResponses}
                </span>
                <span style={{ fontSize: '14px', color: '#727273' }}>
                  <FormattedMessage id="admin/zpd.dashboard.total" />
                </span>
              </div>

              <div
                style={{ paddingTop: '16px', borderTop: '1px solid #e3e4e6' }}
              >
                <div
                  style={{
                    marginBottom: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  <FormattedMessage id="admin/zpd.dashboard.distribution" />
                </div>
                {dashboard.distribution.length > 0 ? (
                  <BarChart distribution={dashboard.distribution} />
                ) : (
                  <p style={{ color: '#979899', fontSize: '14px' }}>
                    Todavía no hay respuestas para mostrar.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </PageBlock>

      {/* Responses Table */}
      <PageBlock
        title={<FormattedMessage id="admin/zpd.responses.title" />}
        variation="full"
      >
        <div style={cardStyle}>
          {responsesError && (
            <div className="mb4">
              <Alert type="error">Error al cargar las respuestas.</Alert>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '200px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#727273',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                <FormattedMessage id="admin/zpd.responses.filter.dateFrom" />
              </span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setDateFrom(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div style={{ width: '200px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#727273',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                <FormattedMessage id="admin/zpd.responses.filter.dateTo" />
              </span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setDateTo(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          {responsesLoading ? (
            <ResponsesTableSkeleton />
          ) : (
            <>
              <Table
                fullWidth
                items={responses}
                schema={tableSchema}
                emptyStateLabel="No se encontraron respuestas"
              />

              {totalPages > 1 && (
                <div className="flex justify-center mt4">
                  <Pagination
                    currentItemFrom={(currentPage - 1) * PAGE_SIZE + 1}
                    currentItemTo={Math.min(
                      currentPage * PAGE_SIZE,
                      totalResponses
                    )}
                    totalItems={totalResponses}
                    onNextClick={() => handlePageChange(currentPage + 1)}
                    onPrevClick={() => handlePageChange(currentPage - 1)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </PageBlock>
    </Layout>
  )
}

export default withRuntimeContext(SurveyResponses)
