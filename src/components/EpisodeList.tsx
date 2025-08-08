import { useState } from "react"
import { Play, ChevronDown } from "lucide-react"
import "./EpisodeList.css"

interface Episode {
  id: string
  title: string
  duration: string
}

interface Season {
  id: string
  title: string
  episodes: Episode[]
}

interface EpisodeListProps {
  seasons: Season[]
}

export function EpisodeList({ seasons }: EpisodeListProps) {
  const [openSeason, setOpenSeason] = useState<string | null>(null)

  const toggleSeason = (seasonId: string) => {
    setOpenSeason(openSeason === seasonId ? null : seasonId)
  }

  return (
    <div className="episodes-section">
      <h2 className="episodes-title">Episodes</h2>
      <div className="accordion-container">
        {seasons.map((season) => (
          <div key={season.id} className="season-item">
            <div className="season-header">
              <button
                className={`season-toggle ${openSeason === season.id ? "open" : ""}`}
                onClick={() => toggleSeason(season.id)}
              >
                <span className="season-title">{season.title}</span>
                <ChevronDown className="chevron-icon" />
              </button>
            </div>
            <div className={`season-content ${openSeason === season.id ? "open" : ""}`}>
              <div className="episodes-list">
                {season.episodes.map((episode, index) => (
                  <div key={episode.id} className="episode-item">
                    <div className="episode-info">
                      <span className="episode-number">{index + 1}.</span>
                      <span className="episode-title">{episode.title}</span>
                    </div>
                    <div className="episode-actions">
                      <span className="episode-duration">{episode.duration}</span>
                      <button className="play-episode-button">
                        <Play className="play-episode-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
