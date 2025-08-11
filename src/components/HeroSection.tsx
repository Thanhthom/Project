import { useState } from "react"
import { Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl, formatDate, formatRuntime } from "../config/api"
import type { MediaItem } from "../types/movie"
import "./HeroSection.css"

interface HeroSectionProps {
  movie: MediaItem
  movieGenres: { [key: number]: string }
  totalMovies: number
  currentMovieIndex: number
  onNavigateHero: (direction: "prev" | "next") => void
  onNavigateToDetail: (id: string) => void
}

export function HeroSection({ 
  movie, 
  movieGenres, 
  totalMovies, 
  currentMovieIndex, 
  onNavigateHero,
  onNavigateToDetail 
}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false)

  const genres = movie.genre_ids
    ? movie.genre_ids.map((id) => movieGenres[id]).filter(Boolean)
    : movie.genres?.map((genre) => genre.name) || []

  const releaseYear = movie.release_date
    ? formatDate(movie.release_date)
    : movie.first_air_date
      ? formatDate(movie.first_air_date)
      : ""

  const runtime = movie.runtime ? formatRuntime(movie.runtime) : ""
  const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
  const title = movie.title || movie.name || "No Title Available"

  const backgroundImage =
    movie.backdrop_path && !imageError
      ? getImageUrl(movie.backdrop_path, "w1280")
      : "./mau.jpg?height=700&width=1920"

  const handleImageError = () => {
    setImageError(true)
  }

  const handleWatchNow = () => {
    const isMovie = movie.title || !movie.name
    const mediaPrefix = isMovie ? "movie" : "tv"
    const detailId = `${mediaPrefix}-${movie.id}`
    
    console.log(" HeroSection: Watch Now clicked - Navigating to:", detailId)
    console.log(" Movie data:", { title: movie.title, name: movie.name, id: movie.id })
    onNavigateToDetail(detailId)
  }

  const handleWatchLater = () => {
    handleWatchNow()
  }

  return (
    <section className="hero-section">
      <img
        src={backgroundImage || "./mau.jpg"}
        alt={title}
        className="hero-background"
        onError={handleImageError}
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">{title}</h1>

          {genres.length > 0 && (
            <div className="hero-genres">
              {genres.slice(0, 3).map((genre, index) => (
                <button
                  key={index}
                  className={`hero-genre ${index === 0 ? "active" : ""}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          <div className="hero-metadata">
            {releaseYear && <span className="metadata-item">📅 {releaseYear}</span>}
            {runtime && (
              <span className="metadata-item">
                <Clock className="metadata-icon" />
                {runtime}
              </span>
            )}
            <span className="metadata-item">⭐ {voteAverage}</span>
            {movie.vote_count && <span className="vote-count">({movie.vote_count.toLocaleString()} votes)</span>}
          </div>

          <p className="hero-description">{movie.overview || "No description available for this movie."}</p>

          <div className="hero-buttons">
            <button className="hero-btn primary" onClick={handleWatchNow}>
              <Play className="btn-icon" />
              Watch Now
            </button>
            <button className="hero-btn secondary" onClick={handleWatchLater}>
              <Clock className="btn-icon" />
              Watch Later
            </button>
          </div>
        </div>

        <button className="hero-nav-button prev" onClick={() => onNavigateHero("prev")}>
          <ChevronLeft className="nav-icon" />
        </button>
        <button className="hero-nav-button next" onClick={() => onNavigateHero("next")}>
          <ChevronRight className="nav-icon" />
        </button>

        <div className="hero-dots">
          {Array.from({ length: totalMovies }).map((_, index) => (
            <span key={index} className={`dot ${currentMovieIndex === index ? "active" : ""}`}></span>
          ))}
        </div>
      </div>
    </section>
  )
}
