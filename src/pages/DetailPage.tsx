import { useEffect, useState } from "react"
import { Heart, Star, Play, Clock, Calendar, Users } from 'lucide-react'
import { getImageUrl, formatDate, formatRuntime } from "../config/api"
import type { MediaItem } from "../types/movie"
import { EpisodeList } from "../components/EpisodeList"
import { CommentsSection } from "../components/CommentsSection"
import { ContentCard } from "../components/ContentCard"
import "./DetailPage.css"

interface Season {
  id: string
  title: string
  episodes: Array<{
    id: string
    title: string
    duration: string
  }>
}

interface DetailPageProps {
  id: string | null
  onNavigateToDetail: (id: string) => void
}

export function DetailPage({ id, onNavigateToDetail }: DetailPageProps) {
  const [media, setMedia] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detectedMediaType, setDetectedMediaType] = useState<"movie" | "tv">("movie")
  const [seasons, setSeasons] = useState<Season[]>([])
  const [similarContent, setSimilarContent] = useState<MediaItem[]>([])
  const [cast, setCast] = useState<any[]>([])
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  useEffect(() => {
    if (!id) {
      console.log(" DetailPage: No ID provided")
      return
    }

    console.log(" DetailPage: Starting with ID:", id)

    const fetchMediaDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        let cleanId = id
        let mediaType: "movie" | "tv" = "movie"

        // Parse ID with prefix
        if (id.startsWith("tv-")) {
          cleanId = id.replace("tv-", "")
          mediaType = "tv"
          console.log("📺 Detected TV series - Clean ID:", cleanId)
        } else if (id.startsWith("movie-")) {
          cleanId = id.replace("movie-", "")
          mediaType = "movie"
          console.log("🎬 Detected Movie - Clean ID:", cleanId)
        } else {
          console.log("🤔 No prefix found, trying auto-detection for ID:", id)

          // Try both endpoints to detect
          try {
            const movieTest = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_API_KEY}`,
            )
            if (movieTest.ok) {
              mediaType = "movie"
              cleanId = id
              console.log("✅ Auto-detected as Movie")
            } else {
              const tvTest = await fetch(
                `https://api.themoviedb.org/3/tv/${id}?api_key=${import.meta.env.VITE_API_KEY}`,
              )
              if (tvTest.ok) {
                mediaType = "tv"
                cleanId = id
                console.log("✅ Auto-detected as TV Series")
              }
            }
          } catch (autoDetectError) {
            console.log("⚠️ Auto-detection failed, defaulting to movie")
          }
        }

        setDetectedMediaType(mediaType)
        console.log(`🎯 Final decision: ${mediaType.toUpperCase()} with ID: ${cleanId}`)

        // Fetch main content
        const endpoint = mediaType === "movie" ? "movie" : "tv"
        const apiUrl = `https://api.themoviedb.org/3/${endpoint}/${cleanId}?api_key=${import.meta.env.VITE_API_KEY}`

        console.log("🌐 Fetching from:", apiUrl)

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`❌ API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("✅ Successfully fetched:", data.title || data.name)

        setMedia(data)

        // Fetch additional data
        if (mediaType === "tv") {
          console.log("📺 Fetching TV seasons...")
          try {
            const seasonsResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${cleanId}?api_key=${import.meta.env.VITE_API_KEY}`,
            )
            if (seasonsResponse.ok) {
              const seasonsData = await seasonsResponse.json()
              if (seasonsData.seasons) {
                const seasonsWithEpisodes = seasonsData.seasons.map((season: any) => ({
                  id: `season-${season.season_number}`,
                  title: `Season ${season.season_number}`,
                  episodes: Array.from({ length: season.episode_count || 10 }, (_, episodeIndex) => ({
                    id: `ep-${season.season_number}-${episodeIndex + 1}`,
                    title: `Episode ${episodeIndex + 1}: Episode Title`,
                    duration: "45m",
                  })),
                }))
                setSeasons(seasonsWithEpisodes)
                console.log("✅ Seasons loaded:", seasonsWithEpisodes.length)
              }
            }
          } catch (seasonsError) {
            console.log("⚠️ Failed to load seasons:", seasonsError)
          }
        }

        // Fetch similar content
        try {
          const similarResponse = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${cleanId}/similar?api_key=${import.meta.env.VITE_API_KEY}&page=1`,
          )
          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            setSimilarContent(similarData.results?.slice(0, 6) || [])
            console.log("✅ Similar content loaded:", similarData.results?.length || 0)
          }
        } catch (similarError) {
          console.log("⚠️ Failed to load similar content:", similarError)
        }

        // Fetch cast
        try {
          const castResponse = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${cleanId}/credits?api_key=${import.meta.env.VITE_API_KEY}`,
          )
          if (castResponse.ok) {
            const castData = await castResponse.json()
            setCast(castData.cast?.slice(0, 10) || [])
            console.log("✅ Cast loaded:", castData.cast?.length || 0)
          }
        } catch (castError) {
          console.log("⚠️ Failed to load cast:", castError)
        }
      } catch (err: any) {
        console.error("💥 DetailPage Error:", err)
        setError(err.message || "Failed to load content details")
      } finally {
        setLoading(false)
      }
    }

    fetchMediaDetails()
  }, [id])

  const convertToContentCard = (item: MediaItem) => ({
    title: item.title || item.name || "Unknown Title",
    imageUrl: getImageUrl(item.poster_path || "", "w300"),
    releaseInfo: formatDate(item.release_date || item.first_air_date || ""),
    type: item.title ? ("movie" as const) : ("series" as const),
    isNew: !!item.vote_average && item.vote_average > 8,
    isHot: !!item.popularity && item.popularity > 1000,
    id: item.id.toString(),
  })

  const dummyComments = [
    {
      id: "hi",
      author: "MovieLover2024",
      avatarUrl: "./mau.jpg",
      timestamp: "7 hours ago",
      content: "Lấy bối cảnh tại Hakodate, Hokkaido, bộ phim không chỉ khiến khán giả mãn nhãn với những cảnh quay mùa đông tuyệt đẹp mà còn mở ra một vụ án với quy mô lớn,...",
      likes: 10000,
    }
  ]

  const handleWatchNow = () => {
    setShowVideoPlayer(true)
  }

  const handleWatchTrailer = () => {
    setShowVideoPlayer(true)
  }

  if (loading) {
    return (
      <main className="detail-page">
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading content details...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="detail-page">
        <div className="error-container">
          <h2 className="error-title">Unable to Load Content Details</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button className="retry-button" onClick={() => window.location.reload()}>
              Try Again
            </button>
            <button className="back-button" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!media) {
    return (
      <main className="detail-page">
        <div className="error-container">
          <h2 className="error-title">Content Not Found</h2>
          <p className="error-message">The requested content could not be found in our database.</p>
          <button className="back-button" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </main>
    )
  }

  const title = media.title || media.name || "Unknown Title"
  const releaseDate = media.release_date || media.first_air_date || ""
  const releaseYear = formatDate(releaseDate)
  const runtime = detectedMediaType === "movie" ? formatRuntime(media.runtime || 0) : null
  const voteAverage = media.vote_average ? media.vote_average.toFixed(1) : "N/A"
  const posterUrl = getImageUrl(media.poster_path || "", "w500")
  const backdropUrl = getImageUrl(media.backdrop_path || "", "w1280")

  return (
    <main className="detail-page">
      {/* Hero Section with Backdrop */}
      {media.backdrop_path && (
        <section className="detail-hero">
          <img
            src={backdropUrl || "./mau.jpg"}
            alt={title}
            className="hero-backdrop"
            onError={(e) => {
              e.currentTarget.src = "./mau.jpg"
            }}
          />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-info">
              <h1 className="hero-title">{title}</h1>
              <div className="hero-meta">
                {releaseYear && (
                  <span className="meta-item">
                    <Calendar className="meta-icon" />
                    {releaseYear}
                  </span>
                )}
                {runtime && (
                  <span className="meta-item">
                    <Clock className="meta-icon" />
                    {runtime}
                  </span>
                )}
                <span className="meta-item">
                  <Star className="meta-icon" />
                  {voteAverage}
                </span>
                {detectedMediaType === "tv" && (
                  <span className="meta-item">
                    <Users className="meta-icon" />
                    TV Series
                  </span>
                )}
              </div>
              <p className="hero-description">{media.overview || "No description available for this content."}</p>
            </div>
            <div className="hero-actions">
              <button className="watch-button" onClick={handleWatchNow}>
                <Play className="button-icon" />
                Watch Now
              </button>
              <button className="trailer-button" onClick={handleWatchTrailer}>
                <Clock className="button-icon" />
                Watch Trailer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Content Details */}
      <section className="movie-details">
        <div className="details-container">
          <div className="poster-section">
            <img
              src={posterUrl || "./mau.jpg?height=750&width=500"}
              alt={title}
              className="movie-poster"
              onError={(e) => {
                e.currentTarget.src = "./mau.jpg?height=750&width=500"
              }}
            />
          </div>

          <div className="info-section">
            <div className="title-section">
              <h1 className="movie-title">{title}</h1>
              <button className="favorite-button">
                <Heart className="heart-icon" />
              </button>
            </div>

            {/* Genres */}
            {media.genres && media.genres.length > 0 && (
              <div className="genres">
                {media.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="metadata">
              <div className="rating">
                <Star className="star-icon" />
                <span>{voteAverage}</span>
              </div>
              {releaseYear && <span>• {releaseYear}</span>}
              {runtime && <span>• {runtime}</span>}
              {media.vote_count && <span className="vote-count">({media.vote_count.toLocaleString()} votes)</span>}
            </div>

            {/* Overview */}
            <p className="overview">{media.overview || "No description available."}</p>

            {/* Watch Buttons */}
            <div className="watch-buttons">
              <button className="watch-now-btn" onClick={handleWatchNow}>
                <Play className="btn-icon" />
                Watch Now
              </button>
              <button className="trailer-btn" onClick={handleWatchTrailer}>
                <Clock className="btn-icon" />
                Watch Trailer
              </button>
            </div>

            {/* Cast Section */}
            {cast.length > 0 && (
              <div className="cast-section">
                <h3 className="cast-title">Cast</h3>
                <div className="cast-list">
                  {cast.slice(0, 6).map((actor) => (
                    <div key={actor.id} className="cast-member">
                      <img
                        src={
                          actor.profile_path
                            ? getImageUrl(actor.profile_path, "w185")
                            : "./mau.jpg?height=185&width=185"
                        }
                        alt={actor.name || "Actor"}
                        className="cast-photo"
                        onError={(e) => {
                          e.currentTarget.src = "./mau.jpg?height=185&width=185"
                        }}
                      />
                      <div className="cast-info">
                        <p className="cast-name">{actor.name || "Unknown Actor"}</p>
                        <p className="cast-character">{actor.character || "Unknown Character"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">{detectedMediaType === "tv" ? "First Air Date:" : "Release Date:"}</span>
                  <span className="info-value">{releaseDate || "Unknown"}</span>
                </div>
                {media.original_language && (
                  <div className="info-item">
                    <span className="info-label">Language:</span>
                    <span className="info-value">{media.original_language.toUpperCase()}</span>
                  </div>
                )}
                {media.popularity && (
                  <div className="info-item">
                    <span className="info-label">Popularity:</span>
                    <span className="info-value">{media.popularity.toFixed(0)}</span>
                  </div>
                )}
                {detectedMediaType === "tv" && (media as any).number_of_seasons && (
                  <div className="info-item">
                    <span className="info-label">Seasons:</span>
                    <span className="info-value">{(media as any).number_of_seasons}</span>
                  </div>
                )}
                {detectedMediaType === "tv" && (media as any).number_of_episodes && (
                  <div className="info-item">
                    <span className="info-label">Episodes:</span>
                    <span className="info-value">{(media as any).number_of_episodes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section (TV Series only) */}
      {detectedMediaType === "tv" && seasons.length > 0 && (
        <section className="episodes-section">
          <div className="section-container">
            <EpisodeList seasons={seasons} />
          </div>
        </section>
      )}

      {/* Similar Content Section */}
      {similarContent.length > 0 && (
        <section className="similar-section">
          <div className="section-container">
            <h2 className="section-title">Suggest</h2>
            <div className="similar-grid">
              {similarContent.map((item) => {
                const cardData = convertToContentCard(item)
                const mediaPrefix = item.title ? "movie" : "tv"
                return (
                  <ContentCard
                    key={cardData.id}
                    {...cardData}
                    onClick={() => {
                      console.log("🔗 Navigating to similar content:", `${mediaPrefix}-${cardData.id}`)
                      onNavigateToDetail(`${mediaPrefix}-${cardData.id}`)
                    }}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="comments-section">
        <div className="section-container">
          <CommentsSection comments={dummyComments} />
        </div>
      </section>
    </main>
  )
}
