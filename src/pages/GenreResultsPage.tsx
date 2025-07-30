"use client"

import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { fetchMoviesByGenres, getImageUrl, formatRuntime, formatDate, fetchMovieGenres } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./GenreResultsPage.css" 
interface GenreResultsPageProps {
  genreIds: number[] | null
  onNavigateToDetail: (id: string) => void
}

export function GenreResultsPage({ genreIds, onNavigateToDetail }: GenreResultsPageProps) {
  const [genreFilteredMovies, setGenreFilteredMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movieGenresMap, setMovieGenresMap] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const fetchedGenresMap = await fetchMovieGenres()
        setMovieGenresMap(fetchedGenresMap)
      } catch (err) {
        console.error("Error fetching movie genres for GenreResultsPage:", err)
      }
    }
    loadGenres()
  }, [])

  useEffect(() => {
    const loadGenreMovies = async () => {
      if (!genreIds || genreIds.length === 0) {
        setGenreFilteredMovies([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const movies = await fetchMoviesByGenres(genreIds)
        setGenreFilteredMovies(movies)
      } catch (err: any) {
        console.error("Error fetching genre-filtered movies:", err)
        setError(err.message || "Failed to fetch movies for selected genres.")
      } finally {
        setLoading(false)
      }
    }

    loadGenreMovies()
  }, [genreIds])

  const convertToContentCard = (movie: MediaItem) => ({
    title: movie.title || movie.name || "Unknown Title",
    imageUrl: getImageUrl(movie.poster_path || "", "w300"),
    releaseInfo: movie.runtime
      ? `${formatRuntime(movie.runtime)} | ${formatDate(movie.release_date || movie.first_air_date || "")}`
      : formatDate(movie.release_date || movie.first_air_date || ""),
    type: movie.title ? ("movie" as const) : ("series" as const),
    isNew: !!movie.vote_average && movie.vote_average > 8,
    isHot: !!movie.popularity && movie.popularity > 1000,
    id: movie.id.toString(),
  })

  const selectedGenreNames =
    genreIds && genreIds.length > 0
      ? genreIds
          .map((id) => movieGenresMap[id])
          .filter(Boolean)
          .join(", ")
      : "No genres selected"

  if (loading) {
    return (
      <main className="genre-results-page">
        <div className="genre-results-header">
          <h2 className="genre-results-title">Loading movies for "{selectedGenreNames}"...</h2>
        </div>
        <div className="genre-results-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="genre-results-page">
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

  return (
    <main className="genre-results-page">
      <div className="genre-results-header">
        <h2 className="genre-results-title">
          Movies for "{selectedGenreNames}" 
        </h2>
      </div>
      {genreFilteredMovies.length > 0 ? (
        <div className="genre-results-grid">
          {genreFilteredMovies.map((movie) => {
            const cardData = convertToContentCard(movie)
            return <ContentCard key={cardData.id} {...cardData} onClick={() => onNavigateToDetail(cardData.id)} />
          })}
        </div>
      ) : (
        <div className="no-results-message">No movies found for "{selectedGenreNames}".</div>
      )}
    </main>
  )
}
