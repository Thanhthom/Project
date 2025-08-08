import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./ActorResultsPage.css"

interface ActorResultsPageProps {
  actorIds: number[] | null
  onNavigateToDetail: (id: string) => void
  initialPage?: number
}

export function ActorResultsPage({ actorIds, onNavigateToDetail, initialPage = 1 }: ActorResultsPageProps) {
  const [actorFilteredMovies, setActorFilteredMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [actorNames, setActorNames] = useState<{ [key: number]: string }>({})

  const getActorNameFromId = (id: number) => {
    return actorNames[id] || `Actor ${id}`
  }

  const fetchActorDetails = async (actorId: number) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${import.meta.env.VITE_API_KEY}`,
      )
      if (!response.ok) throw new Error("Failed to fetch actor details")
      const data = await response.json()
      return data.name
    } catch (error) {
      console.error(`Error fetching actor ${actorId} details:`, error)
      return `Actor ${actorId}`
    }
  }

  useEffect(() => {
    const loadActorNames = async () => {
      if (!actorIds || actorIds.length === 0) return

      const names: { [key: number]: string } = {}
      await Promise.all(
        actorIds.map(async (id) => {
          const name = await fetchActorDetails(id)
          names[id] = name
        }),
      )
      setActorNames(names)
    }

    loadActorNames()
  }, [actorIds])

  useEffect(() => {
    const loadActorMovies = async () => {
      if (!actorIds || actorIds.length === 0) {
        setActorFilteredMovies([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Loading movies for actors:", actorIds)
        const allMovies: MediaItem[] = []
        const movieIds = new Set<number>()

        for (const actorId of actorIds) {
          const apiKey = import.meta.env.VITE_API_KEY

          if (!apiKey) {
            throw new Error("API key is not configured")
          }

          const url = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`
          console.log("Fetching from URL:", url)

          const response = await fetch(url)

          if (!response.ok) {
            throw new Error(`Failed to fetch movies for actor ${actorId}: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          console.log(`API response for actor ${actorId}:`, data)

          if (data.cast) {
            data.cast.forEach((movie: MediaItem) => {
              if (!movieIds.has(movie.id)) {
                movieIds.add(movie.id)
                allMovies.push(movie)
              }
            })
          }
        }

        const sortedMovies = allMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

        const itemsPerPage = 20
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedMovies = sortedMovies.slice(startIndex, endIndex)

        setTotalPages(Math.ceil(sortedMovies.length / itemsPerPage))

        if (currentPage === 1) {
          setActorFilteredMovies(paginatedMovies)
        } else {
          setActorFilteredMovies((prev) => [...prev, ...paginatedMovies])
        }
      } catch (err: any) {
        console.error("Error fetching actor-filtered movies:", err)
        setError(err.message || "Failed to fetch movies for selected actors.")
      } finally {
        setLoading(false)
      }
    }

    loadActorMovies()
  }, [actorIds, currentPage])

  const convertToContentCard = (movie: MediaItem) => ({
    title: movie.title || movie.name || "Unknown Title",
    imageUrl: getImageUrl(movie.poster_path || "", "w300"),
    releaseInfo: formatDate(movie.release_date || movie.first_air_date || ""),
    type: movie.title ? ("movie" as const) : ("series" as const),
    isNew: !!movie.vote_average && movie.vote_average > 8,
    isHot: !!movie.popularity && movie.popularity > 1000,
    id: movie.id.toString(),
  })

  const selectedActorNames =
    actorIds && actorIds.length > 0
      ? actorIds
          .map((id) => getActorNameFromId(id))
          .filter(Boolean)
          .join(", ")
      : "No actors selected"

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  if (loading && actorFilteredMovies.length === 0) {
    return (
      <main className="actor-results-page">
        <div className="actor-results-header">
          <h2 className="actor-results-title">Loading movies for "{selectedActorNames}"...</h2>
        </div>
        <div className="actor-results-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="actor-results-page">
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <div className="error-details">
            <p>
              <strong>Selected Actors:</strong> {selectedActorNames}
            </p>
            <p>
              <strong>Actor IDs:</strong> {actorIds?.join(", ") || "None"}
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
    <main className="actor-results-page">
      <div className="actor-results-header">
        <h2 className="actor-results-title">Movies with "{selectedActorNames}"</h2>
        <p className="results-count">Found {actorFilteredMovies.length} movies</p>
      </div>
      {actorFilteredMovies.length > 0 ? (
        <>
          <div className="actor-results-grid">
            {actorFilteredMovies.map((movie) => {
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
          <h3>No movies found for "{selectedActorNames}"</h3>
          <p>Try selecting different actors or check back later.</p>
        </div>
      )}
    </main>
  )
}
