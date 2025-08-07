import type React from "react"
import { useState, useEffect } from "react"
import { getImageUrl } from "../config/api"
import "./ActorsPage.css"

interface Actor {
  id: number
  name: string
  profile_path?: string
  popularity: number
  known_for_department: string
  known_for: Array<{
    id: number
    title?: string
    name?: string
    poster_path?: string
    media_type: string
  }>
}

interface ActorsPageProps {
  onNavigateToActorResults: (actorIds: number[]) => void
  onNavigateToDetail: (id: string) => void
}

export function ActorsPage({ onNavigateToActorResults, onNavigateToDetail }: ActorsPageProps) {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedActors, setSelectedActors] = useState<number[]>([])

  const fetchActors = async (page: number, query = "") => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY
      let url = ""

      if (query.trim()) {
        url = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
      } else {
        url = `https://api.themoviedb.org/3/person/popular?api_key=${apiKey}&page=${page}`
      }

      console.log("Fetching actors from URL:", url)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch actors: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Actors fetched successfully:", data)
      return { results: data.results, total_pages: data.total_pages }
    } catch (error) {
      console.error("Error fetching actors:", error)
      throw error
    }
  }

  useEffect(() => {
    const loadActors = async () => {
      setLoading(true)
      setError(null)
      try {
        const { results, total_pages } = await fetchActors(currentPage, searchQuery)
        if (currentPage === 1) {
          setActors(results)
        } else {
          setActors((prevActors) => [...prevActors, ...results])
        }
        setTotalPages(total_pages)
        console.log(`Actors loaded: ${results.length} actors, total pages: ${total_pages}`)
      } catch (err: any) {
        console.error("Error loading actors:", err)
        setError(err.message || "Failed to load actors.")
      } finally {
        setLoading(false)
      }
    }

    loadActors()
  }, [currentPage, searchQuery])

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
      setActors([])
    }
  }, [searchQuery])

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      console.log(`Loading more actors: page ${currentPage + 1}`)
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search will be triggered by useEffect when searchQuery changes
  }

  const handleActorClick = (actor: Actor) => {
    // Navigate to actor results with single actor
    onNavigateToActorResults([actor.id])
  }

  const handleActorSelect = (actorId: number) => {
    setSelectedActors((prev) => {
      if (prev.includes(actorId)) {
        return prev.filter((id) => id !== actorId)
      } else {
        return [...prev, actorId]
      }
    })
  }

  const handleViewSelectedActors = () => {
    if (selectedActors.length > 0) {
      onNavigateToActorResults(selectedActors)
    }
  }

  const handleKnownForClick = (movie: any) => {
    onNavigateToDetail(movie.id.toString())
  }

  if (loading && actors.length === 0) {
    return (
      <main className="actors-page">
        <div className="actors-header">
          <h1 className="actors-title">Popular Actors</h1>
        </div>
        <div className="actors-grid">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="actor-card-skeleton">
              <div className="actor-image-skeleton"></div>
              <div className="actor-info-skeleton">
                <div className="actor-name-skeleton"></div>
                <div className="actor-department-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="actors-page">
        <div className="error-container">
          <h2 className="error-title">Error Loading Actors</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="actors-page">
      <div className="actors-header">
        <h1 className="actors-title">Actors</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search actors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {selectedActors.length > 0 && (
        <div className="selected-actors-bar">
          <span className="selected-count">{selectedActors.length} actors selected</span>
          <button className="view-movies-button" onClick={handleViewSelectedActors}>
            View Movies
          </button>
          <button className="clear-selection-button" onClick={() => setSelectedActors([])}>
            Clear
          </button>
        </div>
      )}

      {actors.length > 0 ? (
        <>
          <div className="actors-grid">
            {actors.map((actor) => (
              <div key={actor.id} className="actor-card">
                <div className="actor-image-container" onClick={() => handleActorClick(actor)}>
                  <img
                    src={
                      actor.profile_path
                        ? getImageUrl(actor.profile_path, "w300")
                        : "/placeholder.svg?height=450&width=300"
                    }
                    alt={actor.name}
                    className="actor-image"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=450&width=300"
                    }}
                  />
                  <div className="actor-overlay">
                    <span className="view-movies-text">View Movies</span>
                  </div>
                </div>

                <div className="actor-info">
                  <div className="actor-main-info">
                    <h3 className="actor-name">{actor.name}</h3>
                    <p className="actor-department">{actor.known_for_department}</p>
                    <p className="actor-popularity">Popularity: {actor.popularity.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}
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
        <div className="no-results-message">No actors found.</div>
      )}
    </main>
  )
}
