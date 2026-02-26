import React, { FC } from 'react'

/* ─── CSS injection (shimmer keyframe) ─── */

const STYLE_ID = 'zpd-skeleton-styles'

const SkeletonStyles: FC = () => {
  if (typeof document !== 'undefined' && document.getElementById(STYLE_ID)) {
    return null
  }

  return (
    <style id={STYLE_ID}>{`
      @keyframes zpd-shimmer {
        0%   { background-position: -600px 0; }
        100% { background-position: 600px 0; }
      }
      .zpd-sk {
        background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
        background-size: 600px 100%;
        animation: zpd-shimmer 1.4s ease-in-out infinite;
        border-radius: 4px;
      }
    `}</style>
  )
}

/* ─── Primitives ─── */

const Line: FC<{ width?: string; height?: number; mb?: number }> = ({
  width = '100%',
  height = 14,
  mb = 0,
}) => (
  <div
    className="zpd-sk"
    style={{ width, height: `${height}px`, marginBottom: `${mb}px` }}
  />
)

const Block: FC<{ width?: string | number; height?: number }> = ({
  width = '100%',
  height = 36,
}) => (
  <div
    className="zpd-sk"
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: `${height}px`,
      borderRadius: '4px',
    }}
  />
)

/* ─── SurveyList: 3 card skeletons ─── */

const SurveyCard: FC = () => (
  <div
    style={{
      border: '1px solid #e3e4e6',
      borderRadius: '4px',
      padding: '24px',
      backgroundColor: '#fff',
      marginBottom: '16px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flex: 1, marginRight: '24px' }}>
        <Line width="65%" height={16} mb={12} />
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <Block width={72} height={22} />
          <Block width={90} height={22} />
        </div>
        <Line width="35%" height={12} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Block width={32} height={32} />
        <Block width={32} height={32} />
        <Block width={32} height={32} />
        <Block width={32} height={32} />
      </div>
    </div>
  </div>
)

export const SurveyListSkeleton: FC = () => (
  <>
    <SkeletonStyles />
    <SurveyCard />
    <SurveyCard />
    <SurveyCard />
  </>
)

/* ─── SurveyForm: form skeleton ─── */

const FormField: FC<{ labelWidth?: string }> = ({ labelWidth = '30%' }) => (
  <div style={{ marginBottom: '24px' }}>
    <Line width={labelWidth} height={12} mb={8} />
    <Block height={36} />
  </div>
)

export const SurveyFormSkeleton: FC = () => (
  <>
    <SkeletonStyles />
    <FormField labelWidth="25%" />
    <div style={{ marginBottom: '8px' }}>
      <Line width="20%" height={12} mb={12} />
      <FormField labelWidth="15%" />
      <FormField labelWidth="15%" />
      <FormField labelWidth="15%" />
    </div>
    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
      <Block width={80} height={20} />
      <Block width={160} height={20} />
    </div>
  </>
)

/* ─── SurveyResponses: dashboard + table skeletons ─── */

const BarRow: FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      gap: '12px',
    }}
  >
    <Block width={100} height={14} />
    <div style={{ flex: 1 }}>
      <Block height={28} />
    </div>
    <Block width={32} height={14} />
  </div>
)

const TableRow: FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '2fr 2fr 1fr 1.5fr',
      gap: '16px',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
    }}
  >
    <Block height={14} />
    <Block height={14} />
    <Block height={14} />
    <Block height={14} />
  </div>
)

export const DashboardSkeleton: FC = () => (
  <>
    <SkeletonStyles />
    <Line width="40%" height={14} mb={20} />
    <BarRow />
    <BarRow />
    <BarRow />
  </>
)

export const ResponsesTableSkeleton: FC = () => (
  <>
    <SkeletonStyles />
    <TableRow />
    <TableRow />
    <TableRow />
    <TableRow />
    <TableRow />
  </>
)
