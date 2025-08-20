import type React from "react"
import { Play, Star, Heart } from "lucide-react"
import { useState } from "react"
import "./ContentCard.css"

interface ContentCardProps {
  title: string
  imageUrl: string
  releaseInfo: string
  type: "movie" | "series"
  isNew?: boolean
  isHot?: boolean
  onClick: () => void
  mediaType?: "movie" | "tv"
  id: string
  rating?: number    
  duration?: string
}

export function ContentCard({
  title,
  imageUrl,
  releaseInfo,
  type,
  isNew,
  isHot,
  onClick,
  rating,                  
  duration,
}: ContentCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest(".favorite-heart")) {
      onClick()
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  return (
    <div onClick={handleCardClick} className="content-card">
      <div className="card-image-container">
        <img
          src={imageUrl || "./notfilm.jpg"}
          alt={title}
          className="card-image"
          onError={(e) => {
            e.currentTarget.src = "./notfilm.jpg"
          }}
        />
        <div className="card-overlay">
          <button className="play-button">
            <Play className="play-icon" />
          </button>
        </div>

        <button
          className={`favorite-heart ${isFavorite ? "favorite" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className="heart-icon" />
        </button>
      </div>

      <div className="card-badges">
        {isNew && <span className="badge new">NEW</span>}
        {isHot && <span className="badge hot">HOT</span>}
        <span className="badge type">{type === "movie" ? "MOVIE" : "SERIES"}</span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="card-info-row">
          <span className="card-year">{releaseInfo}</span>
          <div className="card-rating">
            <Star className="star-icon" size={12} />
            <span className="rating-number">{rating}</span>
          </div>
          <span className="card-duration">{duration}</span>
        </div>
      </div>
    </div>
  )
}