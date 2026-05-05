import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
    <div>
      <h1 className="text-3xl font-bold text-text-primary m-0 tracking-[-0.5px]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-text-secondary mt-1.5 mb-0">{subtitle}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
)

export default PageHeader
