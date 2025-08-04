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
// }

// export function ContentCard({ title, imageUrl, releaseInfo, type, isNew, isHot, onClick }: ContentCardProps) {
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


import { Play } from "lucide-react"
import "./ContentCard.css"

interface ContentCardProps {
  title: string
  imageUrl: string
  releaseInfo: string
  type: "movie" | "series"
  isNew?: boolean
  isHot?: boolean
  onClick: () => void
}

export function ContentCard({ title, imageUrl, releaseInfo, type, isNew, isHot, onClick }: ContentCardProps) {
  return (
    <div onClick={onClick} className="content-card">
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
      </div>

      <div className="card-badges">
        {isNew && <span className="badge new">NEW</span>}
        {isHot && <span className="badge hot">HOT</span>}
        <span className="badge type">{type === "movie" ? "Movie" : "Series"}</span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-info">{releaseInfo}</p>
      </div>
    </div>
  )
}
