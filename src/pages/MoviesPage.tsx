import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./MoviesPage.css"

interface MoviesPageProps {
  onNavigateToDetail: (id: string) => void
  initialPage?: number
}

export function MoviesPage({ onNavigateToDetail, initialPage = 1 }: MoviesPageProps) {
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<"popularity" | "release_date" | "vote_average">("popularity")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  const fetchMovies = async (page: number, sort: string, order: string) => {
    try {
      console.log(`MoviesPage: Fetching movies: page=${page}, sort=${sort}, order=${order}`)
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort}.${order}&include_adult=false&include_video=false`,
      )
      if (!response.ok) throw new Error(`Failed to fetch movies: ${response.statusText}`)
      const data = await response.json()
      console.log(`MoviesPage: Movies fetched successfully: ${data.results.length} movies`)
      return { results: data.results, total_pages: data.total_pages }
    } catch (error) {
      // console.error("MoviesPage: Error fetching movies:", error)
      throw error
    }
  }

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true)
      setError(null)
      try {
        const { results, total_pages } = await fetchMovies(currentPage, sortBy, sortOrder)
        if (currentPage === 1) {
          setMovies(results)
        } else {
          setMovies((prevMovies) => [...prevMovies, ...results])
        }
        setTotalPages(total_pages)
        console.log(` MoviesPage: Movies loaded: ${results.length} movies, total pages: ${total_pages}`)
      } catch (err: any) {
        console.error("MoviesPage: Error loading movies:", err)
        setError(err.message || "Failed to load movies.")
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [currentPage, sortBy, sortOrder])

  useEffect(() => {
    setCurrentPage(1)
    setMovies([])
  }, [sortBy, sortOrder])

  const convertToContentCard = (movie: MediaItem) => {
    const cardData = {
      title: movie.title || movie.name || "Unknown Title",
      imageUrl: getImageUrl(movie.poster_path || "", "w300"),
      releaseInfo: formatDate(movie.release_date || movie.first_air_date || ""),
      type: "movie" as const,
      isNew: !!movie.vote_average && movie.vote_average > 8,
      isHot: !!movie.popularity && movie.popularity > 1000,
      id: movie.id.toString(),
      mediaType: "movie" as const,
    }

    console.log(` MoviesPage: Converting movie - ID: ${movie.id}, Title: ${movie.title}`)
    return cardData
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      console.log(` MoviesPage: Loading more movies: page ${currentPage + 1}`)
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handleSortChange = (newSortBy: "popularity" | "release_date" | "vote_average") => {
    console.log(`MoviesPage: Changing sort: ${newSortBy}`)
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("desc")
    }
  }

  if (loading && movies.length === 0) {
    return (
      <main className="movies-page">
        <div className="movies-header"></div>
        <div className="movies-grid">
          {Array.from({ length: 20 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="movies-page">
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
    <main className="movies-page">
      <div className="movies-header">
        <h1 className="movies-title">Movies</h1>
        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button
            className={`sort-button ${sortBy === "popularity" ? "active" : ""}`}
            onClick={() => handleSortChange("popularity")}
          >
            Popularity {sortBy === "popularity" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            className={`sort-button ${sortBy === "release_date" ? "active" : ""}`}
            onClick={() => handleSortChange("release_date")}
          >
            Release Date {sortBy === "release_date" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            className={`sort-button ${sortBy === "vote_average" ? "active" : ""}`}
            onClick={() => handleSortChange("vote_average")}
          >
            Rating {sortBy === "vote_average" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
        </div>
      </div>

      {movies.length > 0 ? (
        <>
          <div className="movies-grid">
            {movies.map((movie) => {
              const cardData = convertToContentCard(movie)
              const finalId = `movie-${cardData.id}` 

              console.log(` MoviesPage: Rendering card - Original ID: ${movie.id}, Final ID: ${finalId}`)

              return (
                <ContentCard
                  key={`movie-${cardData.id}`} 
                  {...cardData}
                  onClick={() => {
                    console.log(`MoviesPage: Clicked movie - Navigating to: ${finalId}`)
                    onNavigateToDetail(finalId)
                  }}
                />
              )
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
        <div className="no-results-message">No movies found.</div>
      )}
    </main>
  )
}
