import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
import { ContentCardSkeleton } from "../components/LoadingSkeleton"
import "./SeriesPage.css"

interface SeriesPageProps {
  onNavigateToDetail: (id: string) => void
  initialPage?: number
}

export function SeriesPage({ onNavigateToDetail, initialPage = 1 }: SeriesPageProps) {
  const [series, setSeries] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<"popularity" | "first_air_date" | "vote_average">("popularity")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  const fetchSeries = async (page: number, sort: string, order: string) => {
    try {
      console.log(`Fetching series: page=${page}, sort=${sort}, order=${order}`)
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort}.${order}&include_adult=false`,
      )
      if (!response.ok) throw new Error(`Failed to fetch series: ${response.statusText}`)
      const data = await response.json()
      console.log(`Series fetched successfully: ${data.results.length} series`)
      return { results: data.results, total_pages: data.total_pages }
    } catch (error) {
      console.error("Error fetching series:", error)
      throw error
    }
  }

  useEffect(() => {
    const loadSeries = async () => {
      console.log("Loading series...")
      setLoading(true)
      setError(null)
      try {
        const { results, total_pages } = await fetchSeries(currentPage, sortBy, sortOrder)
        if (currentPage === 1) {
          setSeries(results)
        } else {
          setSeries((prevSeries) => [...prevSeries, ...results])
        }
        setTotalPages(total_pages)
        console.log(`Series loaded: ${results.length} series, total pages: ${total_pages}`)
      } catch (err: any) {
        console.error("Error loading series:", err)
        setError(err.message || "Failed to load series.")
      } finally {
        setLoading(false)
      }
    }

    loadSeries()
  }, [currentPage, sortBy, sortOrder])
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
      setSeries([])
    }
  }, [sortBy, sortOrder])

  const convertToContentCard = (seriesItem: MediaItem) => ({
    title: seriesItem.name || seriesItem.title || "Unknown Title",
    imageUrl: getImageUrl(seriesItem.poster_path || "", "w300"),
    releaseInfo: formatDate(seriesItem.first_air_date || seriesItem.release_date || ""),
    type: "series" as const,
    isNew: !!seriesItem.vote_average && seriesItem.vote_average > 8,
    isHot: !!seriesItem.popularity && seriesItem.popularity > 1000,
    id: seriesItem.id.toString(),
  })

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      console.log(`Loading more series: page ${currentPage + 1}`)
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handleSortChange = (newSortBy: "popularity" | "first_air_date" | "vote_average") => {
    console.log(`Changing sort: ${newSortBy}`)
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("desc")
    }
  }

  if (loading && series.length === 0) {
    return (
      <main className="series-page">
        <div className="series-header">
          <h1 className="series-title">Loading Series...</h1>
        </div>
        <div className="series-grid">
          {Array.from({ length: 20 }).map((_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="series-page">
        <div className="error-container">
          <h2 className="error-title">Error Loading Series</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="series-page">
      <div className="series-header">
        <h1 className="series-title"></h1>
        {/* <h1 className="series-title">All TV Series ({series.length} results)</h1> */}

        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button
            className={`sort-button ${sortBy === "popularity" ? "active" : ""}`}
            onClick={() => handleSortChange("popularity")}
          >
            Popularity {sortBy === "popularity" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            className={`sort-button ${sortBy === "first_air_date" ? "active" : ""}`}
            onClick={() => handleSortChange("first_air_date")}
          >
            Air Date {sortBy === "first_air_date" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            className={`sort-button ${sortBy === "vote_average" ? "active" : ""}`}
            onClick={() => handleSortChange("vote_average")}
          >
            Rating {sortBy === "vote_average" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
        </div>
      </div>

      {series.length > 0 ? (
        <>
          <div className="series-grid">
            {series.map((seriesItem) => {
              const cardData = convertToContentCard(seriesItem)
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
              <p>You've reached the end! No more series to load.</p>
            </div>
          )}
        </>
      ) : (
        <div className="no-results-message">No series found.</div>
      )}
    </main>
  )
}
