// "use client"

import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./AnimationPage.css"

interface AnimationPageProps {
  onNavigateToDetail: (id: string) => void
  initialPage?: number
}

export function AnimationPage({ onNavigateToDetail, initialPage = 1 }: AnimationPageProps) {
  const [animations, setAnimations] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<"popularity" | "release_date" | "vote_average">("popularity")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [contentType, setContentType] = useState<"movie" | "tv" | "both">("both")

  const fetchAnimations = async (page: number, sort: string, order: string, type: "movie" | "tv" | "both") => {
    try {
      console.log(`Fetching animations: page=${page}, sort=${sort}, order=${order}, type=${type}`)

      let allResults: MediaItem[] = []

      if (type === "both") {
        // Fetch both movies and TV shows with animation genre (16)
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort}.${order}&with_genres=16&include_adult=false`,
          ),
          fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort === "release_date" ? "first_air_date" : sort}.${order}&with_genres=16&include_adult=false`,
          ),
        ])

        if (!movieResponse.ok || !tvResponse.ok) {
          throw new Error("Failed to fetch animations")
        }

        const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()])

        // Combine and sort results
        allResults = [...movieData.results, ...tvData.results]

        // Sort combined results
        allResults.sort((a, b) => {
          let aValue, bValue

          if (sort === "popularity") {
            aValue = a.popularity || 0
            bValue = b.popularity || 0
          } else if (sort === "vote_average") {
            aValue = a.vote_average || 0
            bValue = b.vote_average || 0
          } else if (sort === "release_date") {
            aValue = new Date(a.release_date || a.first_air_date || "1900-01-01").getTime()
            bValue = new Date(b.release_date || b.first_air_date || "1900-01-01").getTime()
          } else {
            return 0
          }

          return order === "desc" ? bValue - aValue : aValue - bValue
        })

        // Take only 20 items per page
        allResults = allResults.slice(0, 20)

        return {
          results: allResults,
          total_pages: Math.max(movieData.total_pages, tvData.total_pages),
        }
      } else {
        // Fetch only movies or TV shows
        const endpoint = type === "movie" ? "movie" : "tv"
        const sortField = type === "tv" && sort === "release_date" ? "first_air_date" : sort

        const response = await fetch(
          `https://api.themoviedb.org/3/discover/${endpoint}?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sortField}.${order}&with_genres=16&include_adult=false`,
        )

        if (!response.ok) throw new Error(`Failed to fetch ${type} animations: ${response.statusText}`)
        const data = await response.json()

        return { results: data.results, total_pages: data.total_pages }
      }
    } catch (error) {
      console.error("Error fetching animations:", error)
      throw error
    }
  }

  useEffect(() => {
    const loadAnimations = async () => {
      console.log("Loading animations...")
      setLoading(true)
      setError(null)
      try {
        const { results, total_pages } = await fetchAnimations(currentPage, sortBy, sortOrder, contentType)
        if (currentPage === 1) {
          setAnimations(results)
        } else {
          setAnimations((prevAnimations) => [...prevAnimations, ...results])
        }
        setTotalPages(total_pages)
        console.log(`Animations loaded: ${results.length} animations, total pages: ${total_pages}`)
      } catch (err: any) {
        console.error("Error loading animations:", err)
        setError(err.message || "Failed to load animations.")
      } finally {
        setLoading(false)
      }
    }

    loadAnimations()
  }, [currentPage, sortBy, sortOrder, contentType])

  // Reset to page 1 when sort or content type changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
      setAnimations([])
    }
  }, [sortBy, sortOrder, contentType])

  const convertToContentCard = (animationItem: MediaItem) => {
    const contentType: "movie" | "series" = animationItem.title ? "movie" : "series"

    return {
      title: animationItem.title || animationItem.name || "Unknown Title",
      imageUrl: getImageUrl(animationItem.poster_path || "", "w300"),
      releaseInfo: formatDate(animationItem.release_date || animationItem.first_air_date || ""),
      type: contentType,
      isNew: !!animationItem.vote_average && animationItem.vote_average > 8,
      isHot: !!animationItem.popularity && animationItem.popularity > 1000,
      id: animationItem.id.toString(),
    }
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      console.log(`Loading more animations: page ${currentPage + 1}`)
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handleSortChange = (newSortBy: "popularity" | "release_date" | "vote_average") => {
    console.log(`Changing sort: ${newSortBy}`)
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("desc")
    }
  }

  const handleContentTypeChange = (newType: "movie" | "tv" | "both") => {
    console.log(`Changing content type: ${newType}`)
    setContentType(newType)
  }

  if (loading && animations.length === 0) {
    return (
      <main className="animation-page">
        <div className="animation-header">
          <h1 className="animation-title">Loading Animations...</h1>
        </div>
        <div className="animation-grid">
          {Array.from({ length: 20 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="animation-page">
        <div className="error-container">
          <h2 className="error-title">Error Loading Animations</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="animation-page">
      <div className="animation-header">
        {/* <h1 className="animation-title">All Animations ({animations.length} results)</h1> */}

        <div className="controls-container">
          <div className="content-type-controls">
            <span className="control-label">Type:</span>
            <button
              className={`type-button ${contentType === "both" ? "active" : ""}`}
              onClick={() => handleContentTypeChange("both")}
            >
              All
            </button>
            <button
              className={`type-button ${contentType === "movie" ? "active" : ""}`}
              onClick={() => handleContentTypeChange("movie")}
            >
              Movies
            </button>
            <button
              className={`type-button ${contentType === "tv" ? "active" : ""}`}
              onClick={() => handleContentTypeChange("tv")}
            >
              Series
            </button>
          </div>

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
      </div>

      {animations.length > 0 ? (
        <>
          <div className="animation-grid">
            {animations.map((animationItem) => {
              const cardData = convertToContentCard(animationItem)
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

          {currentPage >= totalPages && (
            <div className="end-of-results">
              <p>You've reached the end! No more animations to load.</p>
            </div>
          )}
        </>
      ) : (
        <div className="no-results-message">No animations found.</div>
      )}
    </main>
  )
}
