import type React from "react"
import { useEffect, useState } from "react"
import { Heart, Star, Play, Clock, ChevronUp } from "lucide-react"
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

interface ActorDetails {
  id: number
  name: string
  biography: string
  birthday: string
  place_of_birth: string
  profile_path: string
  known_for_department: string
  filmography: MediaItem[]
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
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedActor, setSelectedActor] = useState<ActorDetails | null>(null)
  const [showActorModal, setShowActorModal] = useState(false)
  const [loadingActor, setLoadingActor] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [loadingTrailer, setLoadingTrailer] = useState(false)

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  const fetchActorDetails = async (actorId: number) => {
    try {
      setLoadingActor(true)

      const actorResponse = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${import.meta.env.VITE_API_KEY}`,
      )

      if (!actorResponse.ok) throw new Error("Failed to fetch actor details")

      const actorData = await actorResponse.json()

      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${import.meta.env.VITE_API_KEY}`,
      )

      let filmography: MediaItem[] = []
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json()
        filmography = creditsData.cast?.slice(0, 12) || []
      }

      setSelectedActor({
        ...actorData,
        filmography,
      })
      setShowActorModal(true)
    } catch (error) {
      console.error("Failed to fetch actor details:", error)
    } finally {
      setLoadingActor(false)
    }
  }

  const handleActorClick = (actorId: number) => {
    fetchActorDetails(actorId)
  }

  const closeActorModal = () => {
    setShowActorModal(false)
    setSelectedActor(null)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const fetchTrailer = async (mediaId: string, mediaType: "movie" | "tv") => {
    try {
      setLoadingTrailer(true)
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${import.meta.env.VITE_API_KEY}`,
      )

      if (response.ok) {
        const data = await response.json()
        const trailer =
          data.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || data.results?.[0]

        if (trailer) {
          setTrailerKey(trailer.key)
          setShowVideoPlayer(true)
        } else {
          alert("No trailer available for this content")
        }
      }
    } catch (error) {
      console.error("Failed to fetch trailer:", error)
      alert("Failed to load trailer")
    } finally {
      setLoadingTrailer(false)
    }
  }

  const handleWatchTrailer = () => {
    if (!id) return

    let cleanId = id
    let mediaType: "movie" | "tv" = detectedMediaType

    if (id.startsWith("tv-")) {
      cleanId = id.replace("tv-", "")
      mediaType = "tv"
    } else if (id.startsWith("movie-")) {
      cleanId = id.replace("movie-", "")
      mediaType = "movie"
    }

    fetchTrailer(cleanId, mediaType)
  }

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false)
    setTrailerKey(null)
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!id) {
      console.log("DetailPage: No ID provided")
      return
    }

    window.scrollTo(0, 0)

    console.log("DetailPage: Starting with ID:", id)

    const fetchMediaDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        let cleanId = id
        let mediaType: "movie" | "tv" = "movie"

        if (id.startsWith("tv-")) {
          cleanId = id.replace("tv-", "")
          mediaType = "tv"
          console.log("Detected TV series - Clean ID:", cleanId)
        } else if (id.startsWith("movie-")) {
          cleanId = id.replace("movie-", "")
          mediaType = "movie"
          console.log("Detected Movie - Clean ID:", cleanId)
        } else {
          console.log("No prefix found, trying auto-detection for ID:", id)
          try {
            const movieTest = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_API_KEY}`,
            )
            if (movieTest.ok) {
              mediaType = "movie"
              cleanId = id
              console.log("Auto-detected as Movie")
            } else {
              const tvTest = await fetch(
                `https://api.themoviedb.org/3/tv/${id}?api_key=${import.meta.env.VITE_API_KEY}`,
              )
              if (tvTest.ok) {
                mediaType = "tv"
                cleanId = id
                console.log("Auto-detected as TV Series")
              }
            }
          } catch (autoDetectError) {
            console.log("Auto-detection failed, defaulting to movie")
          }
        }

        setDetectedMediaType(mediaType)

        const endpoint = mediaType === "movie" ? "movie" : "tv"
        const apiUrl = `https://api.themoviedb.org/3/${endpoint}/${cleanId}?api_key=${import.meta.env.VITE_API_KEY}`
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setMedia(data)

        if (mediaType === "tv") {
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
              }
            }
          } catch (seasonsError) {}
        }

        try {
          const similarResponse = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${cleanId}/similar?api_key=${import.meta.env.VITE_API_KEY}&page=1`,
          )
          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            setSimilarContent(similarData.results?.slice(0, 6) || [])
          }
        } catch (similarError) {}

        try {
          const castResponse = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${cleanId}/credits?api_key=${import.meta.env.VITE_API_KEY}`,
          )
          if (castResponse.ok) {
            const castData = await castResponse.json()
            setCast(castData.cast?.slice(0, 10) || [])
            console.log("Cast loaded:", castData.cast?.length || 0)
          }
        } catch (castError) {
          console.log("Failed to load cast:", castError)
        }
      } catch (err: any) {
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
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 4.2,
    duration: item.title ? "2h 15m" : "45m",
  })

  const dummyComments = [
    {
      id: "hi",
      author: "MovieLover2024",
      avatarUrl: "./mau.jpg",
      timestamp: "7 hours ago",
      content:
        "Lấy bối cảnh tại Hakodate, Hokkaido, bộ phim không chỉ khiến khán giả mãn nhãn với những cảnh quay mùa đông tuyệt đẹp mà còn mở ra một vụ án với quy mô lớn,...",
      likes: 10000,
    },
  ]

  const handleWatchNow = () => {
    setShowVideoPlayer(true)
  }

  if (loading) {
    return (
      <main className="detail-page">
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading content...</p>
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
      {media.backdrop_path && (
        <section className="detail-hero">
          <img
            src={backdropUrl || "./notfilm.jpg"}
            alt={title}
            className="hero-backdrop"
            onError={(e) => {
              e.currentTarget.src = "./notfilm.jpg"
            }}
          />
        </section>
      )}

      <section className="movie-details">
        <div className="details-container">
          <div className="poster-section">
            <img
              src={posterUrl || "./notfilm.jpg?height=750&width=500"}
              alt={title}
              className="movie-poster"
              onError={(e) => {
                e.currentTarget.src = "./notfilm.jpg?height=750&width=500"
              }}
            />
          </div>

          <div className="info-section">
            <div className="title-section">
              <h1 className="movie-title">{title}</h1>
              <button
                className={`favorite-button ${isFavorite ? "favorite" : ""}`}
                onClick={handleFavoriteToggle}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                type="button"
              >
                <Heart className="heart-icon" />
              </button>
            </div>

            {media.genres && media.genres.length > 0 && (
              <div className="genres">
                {media.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className="metadata">
              <div className="rating">
                <Star className="star-icon" />
                <span>{voteAverage}</span>
              </div>
              {releaseYear && <span>• {releaseYear}</span>}
              {runtime && <span>• {runtime}</span>}
              {media.vote_count && <span className="vote-count">({media.vote_count.toLocaleString()} votes)</span>}
            </div>

            <p className="overview">{media.overview || "No description available."}</p>

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

            {cast.length > 0 && (
              <div className="cast-section">
                <h3 className="cast-title">Cast</h3>
                <div className="cast-list">
                  {cast.slice(0, 6).map((actor) => (
                    <div key={actor.id} className="cast-member clickable" onClick={() => handleActorClick(actor.id)}>
                      <img
                        src={
                          actor.profile_path
                            ? getImageUrl(actor.profile_path, "w185")
                            : "./Avatar.png?height=185&width=185"
                        }
                        alt={actor.name || "Actor"}
                        className="cast-photo"
                        onError={(e) => {
                          e.currentTarget.src = "./Avatar.png?height=185&width=185"
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

      {detectedMediaType === "tv" && seasons.length > 0 && (
        <section className="episodes-section">
          <div className="section-container">
            <EpisodeList seasons={seasons} />
          </div>
        </section>
      )}

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
                      console.log("Navigating to similar content:", `${mediaPrefix}-${cardData.id}`)
                      onNavigateToDetail(`${mediaPrefix}-${cardData.id}`)
                    }}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="comments-section">
        <div className="section-container">
          <CommentsSection comments={dummyComments} />
        </div>
      </section>

      {showActorModal && selectedActor && (
        <div className="actor-modal-overlay" onClick={closeActorModal}>
          <div className="actor-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeActorModal}>
              ×
            </button>

            <div className="actor-modal-content">
              <div className="actor-header">
                <img
                  src={
                    selectedActor.profile_path
                      ? getImageUrl(selectedActor.profile_path, "w300")
                      : "./Avatar.png?height=300&width=300"
                  }
                  alt={selectedActor.name}
                  className="actor-modal-photo"
                  onError={(e) => {
                    e.currentTarget.src = "./Avatar.png?height=300&width=300"
                  }}
                />
                <div className="actor-info">
                  <h2 className="actor-modal-name">{selectedActor.name}</h2>
                  <p className="actor-department">{selectedActor.known_for_department}</p>
                  {selectedActor.birthday && (
                    <p className="actor-birthday">Born: {formatDate(selectedActor.birthday)}</p>
                  )}
                  {selectedActor.place_of_birth && (
                    <p className="actor-birthplace">From: {selectedActor.place_of_birth}</p>
                  )}
                </div>
              </div>

              {selectedActor.biography && (
                <div className="actor-biography">
                  <h3>Biography</h3>
                  <p>{selectedActor.biography}</p>
                </div>
              )}

              {selectedActor.filmography.length > 0 && (
                <div className="actor-filmography">
                  <h3>Known For</h3>
                  <div className="filmography-grid">
                    {selectedActor.filmography.map((movie) => {
                      const cardData = convertToContentCard(movie)
                      return (
                        <ContentCard
                          key={cardData.id}
                          {...cardData}
                          onClick={() => {
                            closeActorModal()
                            onNavigateToDetail(`movie-${cardData.id}`)
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVideoPlayer && trailerKey && (
        <div className="video-modal-overlay" onClick={closeVideoPlayer}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-close" onClick={closeVideoPlayer}>
              ×
            </button>
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {loadingTrailer && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading trailer...</p>
        </div>
      )}

      {showScrollTop && (
        <button className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
          <ChevronUp className="scroll-icon" />
        </button>
      )}
    </main>
  )
}
