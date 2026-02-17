import React, { FC, useState, useMemo } from 'react'
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
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
    <div className="pv3">
      {distribution.map((item) => (
        <div key={item.option} className="flex items-center mb3">
          <div className="w4 truncate f6 gray" title={item.option}>
            {item.option}
          </div>
          <div
            className="flex-auto mh3 bg-light-gray br2"
            style={{ height: '24px' }}
          >
            <div
              className="h-100 br2"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: '#134cd8',
                minWidth: item.count > 0 ? '4px' : '0',
              }}
            />
          </div>
          <div className="w3 tr f6 fw6">{item.count}</div>
          <div className="w3 tr f7 gray">({item.percentage}%)</div>
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
          const displayText =
            cellData === 'Otro' && rowData.otherText
              ? `Otro: ${rowData.otherText}`
              : cellData

          return (
            <Tag bgColor="#e0e0e0" color="#333">
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
            title="Survey not found"
            linkLabel={<FormattedMessage id="admin/zpd.form.cancel" />}
            onLinkClick={handleBack}
          />
        }
      >
        <PageBlock variation="full">
          <p>The requested survey could not be found.</p>
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
      <PageBlock
        title={<FormattedMessage id="admin/zpd.dashboard.title" />}
        variation="full"
      >
        <div className="flex items-center mb4">
          <div className="f3 fw6 mr2">{survey.responseCount}</div>
          <div className="gray">
            <FormattedMessage id="admin/zpd.dashboard.total" />
          </div>
        </div>

        <div className="mb3 fw6">
          <FormattedMessage id="admin/zpd.dashboard.distribution" />
        </div>
        <BarChart distribution={MOCK_DASHBOARD_DISTRIBUTION} />
      </PageBlock>

      <PageBlock
        title={<FormattedMessage id="admin/zpd.responses.title" />}
        variation="full"
      >
        <div className="flex mb4" style={{ gap: '16px' }}>
          <div style={{ width: '200px' }}>
            <span className="db f7 gray mb1">
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
            <span className="db f7 gray mb1">
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
          emptyStateLabel="No responses found"
        />

        {totalPages > 1 && (
          <div className="flex justify-center mt4">
            <Pagination
              currentItemFrom={(currentPage - 1) * PAGE_SIZE + 1}
              currentItemTo={Math.min(
                currentPage * PAGE_SIZE,
                filteredResponses.length
              )}
              totalItems={filteredResponses.length}
              onNextClick={() => handlePageChange(currentPage + 1)}
              onPrevClick={() => handlePageChange(currentPage - 1)}
            />
          </div>
        )}
      </PageBlock>
    </Layout>
  )
}

export default withRuntimeContext(SurveyResponses)
