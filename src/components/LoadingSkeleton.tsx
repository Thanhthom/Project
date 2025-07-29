import "./LoadingSkeleton.css"

export function HeroSkeleton() {
  return (
    <section className="hero-skeleton">
      <div className="hero-skeleton-overlay" />
      <div className="hero-skeleton-content">
        <div className="hero-skeleton-info">
          <div className="skeleton-title" />

          <div className="skeleton-genres">
            <div className="skeleton-genre" />
            <div className="skeleton-genre" />
            <div className="skeleton-genre" />
          </div>

          <div className="skeleton-metadata">
            <div className="skeleton-meta-item" />
            <div className="skeleton-meta-item" />
            <div className="skeleton-meta-item" />
          </div>

          <div className="skeleton-description">
            <div className="skeleton-line full" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line small" />
          </div>

          <div className="skeleton-buttons">
            <div className="skeleton-button" />
            <div className="skeleton-button" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function ContentCardSkeleton() {
  return (
    <div className="content-card-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-card-content">
        <div className="skeleton-card-title" />
        <div className="skeleton-card-info" />
      </div>
    </div>
  )
}
