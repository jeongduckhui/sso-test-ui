export default function PageContainer({
  title,
  description,
  actions,
  children,
}) {
  return (
    <div className="page-container">
      <div className="page-container-header">
        <div>
          <h2 className="page-title">{title}</h2>
          {description && <p className="page-description">{description}</p>}
        </div>

        <div className="page-actions">{actions}</div>
      </div>

      <div className="page-card">{children}</div>
    </div>
  );
}
