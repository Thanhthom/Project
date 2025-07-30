import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { fetchSearchMovies, getImageUrl, formatRuntime, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./SearchPage.css" 

interface SearchPageProps {
  searchQuery: string | null
  onNavigateToDetail: (id: string) => void
}

export function SearchPage({ searchQuery, onNavigateToDetail }: SearchPageProps) {
  const [searchResults, setSearchResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setSearchResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      setSearchResults([]) 
      setError(null)
      try {
        const results = await fetchSearchMovies(searchQuery)
        setSearchResults(results)
      } catch (err: any) {
        console.error("Error fetching search results:", err)
        setError(err.message || "Failed to fetch search results.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchQuery])

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

  if (loading) {
    return (
      <main className="search-page">
        <div className="search-results-header">
          <h2 className="search-results-title">Searching for "{searchQuery}"...</h2>
        </div>
        <div className="search-results-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="search-page">
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
    <main className="search-page">
      <div className="search-results-header">
        <h2 className="search-results-title">
          Search results for "{searchQuery}"
        </h2>
      </div>
      {searchResults.length > 0 ? (
        <div className="search-results-grid">
          {searchResults.map((movie) => {
            const cardData = convertToContentCard(movie)
            return <ContentCard key={cardData.id} {...cardData} onClick={() => onNavigateToDetail(cardData.id)} />
          })}
        </div>
      ) : (
        <div className="no-results-message">No movies found for "{searchQuery}".</div>
      )}
    </main>
  )
}
