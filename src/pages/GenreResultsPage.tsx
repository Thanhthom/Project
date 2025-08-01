import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate, fetchMovieGenres } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./GenreResultsPage.css"

interface GenreResultsPageProps {
  genreIds: number[] | null
  onNavigateToDetail: (id: string) => void
  initialPage?: number
}

export function GenreResultsPage({ genreIds, onNavigateToDetail, initialPage = 1 }: GenreResultsPageProps) {
  const [genreFilteredMovies, setGenreFilteredMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movieGenresMap, setMovieGenresMap] = useState<{ [key: number]: string }>({})
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)

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
      if (currentPage === 1) {
        setGenreFilteredMovies([])
      }
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_API_KEY}&with_genres=${genreIds.join(",")}&page=${currentPage}`,
        )
        if (!response.ok) throw new Error(`Failed to fetch movies: ${response.statusText}`)
        const data = await response.json()
        setTotalPages(data.total_pages)
        setGenreFilteredMovies((prevMovies) => [...prevMovies, ...data.results])
      } catch (err: any) {
        console.error("Error fetching genre-filtered movies:", err)
        setError(err.message || "Failed to fetch movies for selected genres.")
      } finally {
        setLoading(false)
      }
    }

    loadGenreMovies()
  }, [genreIds, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [genreIds])

  const convertToContentCard = (movie: MediaItem) => ({
    title: movie.title || movie.name || "Unknown Title",
    imageUrl: getImageUrl(movie.poster_path || "", "w300"),
    releaseInfo: formatDate(movie.release_date || movie.first_air_date || ""),
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

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  if (loading && genreFilteredMovies.length === 0) {
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
        <>
          <div className="genre-results-grid">
            {genreFilteredMovies.map((movie) => {
              const cardData = convertToContentCard(movie)
              return <ContentCard key={cardData.id} {...cardData} onClick={() => onNavigateToDetail(cardData.id)} />
            })}
          </div>
          {currentPage < totalPages && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={handleLoadMore} disabled={loading}>
                {loading ? "Loading More..." : "Load More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-results-message">No movies found for "{selectedGenreNames}".</div>
      )}
    </main>
  )
}
