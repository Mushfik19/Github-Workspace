export function PageHeader({ badge, title, description, actions }) {
  return (
    <div className="page-header">
      <div className="space-between">
        <div>
          {badge ? <span className="badge">{badge}</span> : null}
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className="inline-actions">{actions}</div> : null}
      </div>
    </div>
  )
}
