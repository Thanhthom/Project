"use client"

import { useEffect, useState } from "react"
import { Heart, Star, Play, Clock } from "lucide-react"
import { getImageUrl, formatDate, formatRuntime } from "../config/api"
import type { MediaItem } from "../types/movie"
import "./DetailPage.css"

interface DetailPageProps {
  id: string | null
  onNavigateToDetail: (id: string) => void
}

export function DetailPage({ id }: DetailPageProps) {
  const [movie, setMovie] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchMovie = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_API_KEY}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }

        const data = await res.json()

        if (!data.title || !data.poster_path) {
          console.warn("Movie data missing title or poster_path:", data) 
        }

        setMovie(data)
      } catch (err: any) {
        console.error("Error fetching movie detail:", err)
        setError(err.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  if (loading) {
    return (
      <main className="detail-page">
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="detail-page">
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  if (!movie) {
    return (
      <main className="detail-page">
        <div className="error-container">
          <p>Movie not found</p>
        </div>
      </main>
    )
  }

  const releaseYear = formatDate(movie.release_date || "")
  const runtime = formatRuntime(movie.runtime || 0)
  const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
  const posterUrl = getImageUrl(movie.poster_path!, "w500") 
  console.log("Generated poster URL:", posterUrl)

  return (
    <main className="detail-page">
      {movie.backdrop_path && (
        <section className="detail-hero">
          <img
            src={getImageUrl(movie.backdrop_path, "w1280") || "/placeholder.svg"}
            alt={movie.title}
            className="hero-backdrop"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png"
              console.error("Error loading backdrop image:", e.currentTarget.src)
            }}
          />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-actions">
              <button className="watch-button">
                <Play className="button-icon" />
                Watch Now
              </button>
              <button className="trailer-button">
                <Clock className="button-icon" />
                Watch Trailer
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="movie-details">
        <div className="details-container">
          <div className="poster-section">
            <img
              src={posterUrl || "/placeholder.svg"} 
              alt={movie.title}
              className="movie-poster"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png" 
                console.error(
                  "Error loading poster image. Attempted URL:",
                  posterUrl,
                  "Fallback to:",
                  e.currentTarget.src,
                )
              }}
            />
          </div>

          <div className="info-section">
            <div className="title-section">
              <h1 className="movie-title">{movie.title}</h1>
              <button className="favorite-button">
                <Heart className="heart-icon" />
              </button>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="genres">
                {movie.genres.map((genre) => (
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
              {movie.vote_count && <span className="vote-count">({movie.vote_count.toLocaleString()} votes)</span>}
            </div>

            <p className="overview">{movie.overview || "No description available."}</p>

            <div className="additional-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Release Date:</span>
                  <span className="info-value">{movie.release_date || "Unknown"}</span>
                </div>
                {movie.original_language && (
                  <div className="info-item">
                    <span className="info-label">Language:</span>
                    <span className="info-value">{movie.original_language.toUpperCase()}</span>
                  </div>
                )}
                {movie.popularity && (
                  <div className="info-item">
                    <span className="info-label">Popularity:</span>
                    <span className="info-value">{movie.popularity.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
