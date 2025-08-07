// import { Play } from "lucide-react"
// import "./ContentCard.css"

// interface ContentCardProps {
//   title: string
//   imageUrl: string
//   releaseInfo: string 
//   type: "movie" | "series"
//   isNew?: boolean
//   isHot?: boolean
//   onClick: () => void
//   mediaType?: "movie" | "tv" 
// }

// export function ContentCard({
//   title,
//   imageUrl,
//   releaseInfo,
//   type,
//   isNew,
//   isHot,
//   onClick,
//   mediaType,
// }: ContentCardProps) {
//   return (
//     <div onClick={onClick} className="content-card">
//       <div className="card-image-container">
//         <img
//           src={imageUrl || "/placeholder.png"}
//           alt={title}
//           className="card-image"
//           onError={(e) => {
//             e.currentTarget.src = "/placeholder.png"
//           }}
//         />
//         <div className="card-overlay">
//           <button className="play-button">
//             <Play className="play-icon" />
//           </button>
//         </div>
//       </div>

//       <div className="card-badges">
//         {isNew && <span className="badge new">NEW</span>}
//         {isHot && <span className="badge hot">HOT</span>}
//         <span className="badge type">{type === "movie" ? "Movie" : "Series"}</span>
//       </div>

//       <div className="card-content">
//         <h3 className="card-title">{title}</h3>
//         <p className="card-info">{releaseInfo}</p> 
//       </div>
//     </div>
//   )
// }



import { Play, Heart } from 'lucide-react'
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
  mediaType?: "movie" | "tv" // Add media type for proper navigation
  id: string // Add ID to pass to onClick
}

export function ContentCard({
  title,
  imageUrl,
  releaseInfo,
  type,
  isNew,
  isHot,
  onClick,
  mediaType,
  id,
}: ContentCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleClick = () => {
    // Pass both ID and media type information
    onClick()
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking heart
    setIsFavorite(!isFavorite)
    console.log(`${isFavorite ? '💔' : '❤️'} ${title} ${isFavorite ? 'removed from' : 'added to'} favorites`)
  }

  return (
    <div onClick={handleClick} className="content-card">
      <div className="card-image-container">
        <img
          src={imageUrl || "/placeholder.png"}
          alt={title}
          className="card-image"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png"
          }}
        />
        <div className="card-overlay">
          <button className="play-button">
            <Play className="play-icon" />
          </button>
        </div>
        
        {/* Favorite Heart Button */}
        <button 
          className={`favorite-heart ${isFavorite ? 'favorite' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className="heart-icon" />
        </button>
      </div>

      <div className="card-badges">
        {isNew && <span className="badge new">NEW</span>}
        {isHot && <span className="badge hot">HOT</span>}
        <span className="badge type">{type === "movie" ? "Movie" : "Series"}</span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-info">{releaseInfo}</p> {/* releaseInfo chỉ hiển thị năm */}
      </div>
    </div>
  )
}
