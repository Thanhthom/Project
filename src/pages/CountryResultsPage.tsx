import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./CountryResultsPage.css"

interface CountryResultsPageProps {
  countryCodes: string[] | null
  onNavigateToDetail: (id: string) => void
  initialPage?: number
}

export function CountryResultsPage({ countryCodes, onNavigateToDetail, initialPage = 1 }: CountryResultsPageProps) {
  const [countryFilteredMovies, setCountryFilteredMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)

  const getCountryNameFromCode = (code: string) => {
    const countriesList = (window as any).countriesList || []
    const country = countriesList.find((c: any) => c.iso_3166_1 === code)
    return country ? country.english_name : code
  }

  useEffect(() => {
    const loadCountryMovies = async () => {
      if (!countryCodes || countryCodes.length === 0) {
        setCountryFilteredMovies([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Loading movies for countries:", countryCodes)

        // Fetch movies by country using TMDB API
        const countryString = countryCodes.join("|")
        const apiKey = import.meta.env.VITE_API_KEY

        if (!apiKey) {
          throw new Error("API key is not configured")
        }

        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_origin_country=${countryString}&page=${currentPage}&sort_by=popularity.desc`
        console.log("Fetching from URL:", url)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        setTotalPages(data.total_pages || 1)

        if (currentPage === 1) {
          setCountryFilteredMovies(data.results || [])
        } else {
          setCountryFilteredMovies((prev) => [...prev, ...(data.results || [])])
        }
      } catch (err: any) {
        console.error("Error fetching country-filtered movies:", err)
        setError(err.message || "Failed to fetch movies for selected countries.")
      } finally {
        setLoading(false)
      }
    }

    loadCountryMovies()
  }, [countryCodes, currentPage])

  const convertToContentCard = (movie: MediaItem) => ({
    title: movie.title || movie.name || "Unknown Title",
    imageUrl: getImageUrl(movie.poster_path || "", "w300"),
    releaseInfo: formatDate(movie.release_date || movie.first_air_date || ""),
    type: movie.title ? ("movie" as const) : ("series" as const),
    isNew: !!movie.vote_average && movie.vote_average > 8,
    isHot: !!movie.popularity && movie.popularity > 1000,
    id: movie.id.toString(),
  })

  const selectedCountryNames =
    countryCodes && countryCodes.length > 0
      ? countryCodes
          .map((code) => getCountryNameFromCode(code))
          .filter(Boolean)
          .join(", ")
      : "No countries selected"

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  if (loading && countryFilteredMovies.length === 0) {
    return (
      <main className="country-results-page">
        <div className="country-results-header">
          <h2 className="country-results-title">Loading movies for "{selectedCountryNames}"...</h2>
        </div>
        <div className="country-results-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="country-results-page">
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <div className="error-details">
            <p>
              <strong>Selected Countries:</strong> {selectedCountryNames}
            </p>
            <p>
              <strong>Country Codes:</strong> {countryCodes?.join(", ") || "None"}
            </p>
            <p>
              <strong>API Key:</strong> {import.meta.env.VITE_API_KEY ? "✓ Available" : "✗ Missing"}
            </p>
          </div>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="country-results-page">
      <div className="country-results-header">
        <h2 className="country-results-title">Movies from "{selectedCountryNames}"</h2>
        <p className="results-count">Found {countryFilteredMovies.length} movies</p>
      </div>
      {countryFilteredMovies.length > 0 ? (
        <>
          <div className="country-results-grid">
            {countryFilteredMovies.map((movie) => {
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
        <div className="no-results-container">
          <h3>No movies found for "{selectedCountryNames}"</h3>
          <p>Try selecting different countries or check back later.</p>
        </div>
      )}
    </main>
  )
}

