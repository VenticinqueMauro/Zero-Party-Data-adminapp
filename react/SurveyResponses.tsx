import React, { FC, useState, useMemo, CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Table,
  Pagination,
  Input,
  Tag,
} from 'vtex.styleguide'
import { withRuntimeContext } from 'vtex.render-runtime'

import { RuntimeProps, RouteParams, SurveyResponse, OptionCount } from './types'
import {
  findSurveyById,
  getResponsesBySurveyId,
  MOCK_DASHBOARD_DISTRIBUTION,
} from './mocks/data'

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
                width: `${(item.count / maxCount) * 100}%`,
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

const SurveyResponses: FC<Props> = ({ runtime, params }) => {
  const surveyId = params?.id ?? ''
  const survey = findSurveyById(surveyId)
  const allResponses = getResponsesBySurveyId(surveyId)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredResponses = useMemo(() => {
    let filtered = [...allResponses]
    if (dateFrom) {
      const from = new Date(dateFrom)
      filtered = filtered.filter((r) => new Date(r.respondedAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter((r) => new Date(r.respondedAt) <= to)
    }
    return filtered
  }, [allResponses, dateFrom, dateTo])

  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredResponses.slice(start, start + PAGE_SIZE)
  }, [filteredResponses, currentPage])

  const totalPages = Math.ceil(filteredResponses.length / PAGE_SIZE)

  const handleBack = () => {
    runtime.navigate({ page: 'admin.app.zpd-surveys' })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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

  if (!survey) {
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
          <div style={{ ...cardStyle, textAlign: 'center' as const, padding: '48px 24px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f2f4f5',
                borderRadius: '50%',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#979899" strokeWidth="1.5" />
                <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="#979899" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="10" r="1" fill="#979899" />
                <circle cx="15" cy="10" r="1" fill="#979899" />
              </svg>
            </div>
            <p style={{ color: '#727273' }}>La encuesta solicitada no fue encontrada.</p>
          </div>
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin/zpd.responses.title" />}
          subtitle={survey.question}
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#3f3f40', lineHeight: 1 }}>
              {survey.responseCount}
            </span>
            <span style={{ fontSize: '14px', color: '#727273' }}>
              <FormattedMessage id="admin/zpd.dashboard.total" />
            </span>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #e3e4e6' }}>
            <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
              <FormattedMessage id="admin/zpd.dashboard.distribution" />
            </div>
            <BarChart distribution={MOCK_DASHBOARD_DISTRIBUTION} />
          </div>
        </div>
      </PageBlock>

      {/* Responses Table */}
      <PageBlock
        title={<FormattedMessage id="admin/zpd.responses.title" />}
        variation="full"
      >
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '200px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#727273', fontWeight: 600, marginBottom: '8px' }}>
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
              <span style={{ display: 'block', fontSize: '12px', color: '#727273', fontWeight: 600, marginBottom: '8px' }}>
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

          <Table
            fullWidth
            items={paginatedResponses}
            schema={tableSchema}
            emptyStateLabel="No se encontraron respuestas"
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt4">
              <Pagination
                currentItemFrom={(currentPage - 1) * PAGE_SIZE + 1}
                currentItemTo={Math.min(currentPage * PAGE_SIZE, filteredResponses.length)}
                totalItems={filteredResponses.length}
                onNextClick={() => handlePageChange(currentPage + 1)}
                onPrevClick={() => handlePageChange(currentPage - 1)}
              />
            </div>
          )}
        </div>
      </PageBlock>
    </Layout>
  )
}

export default withRuntimeContext(SurveyResponses)
