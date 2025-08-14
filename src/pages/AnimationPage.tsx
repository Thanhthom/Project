import { useState, useEffect } from "react"
import { ContentCard } from "../components/ContentCard"
import { getImageUrl, formatDate } from "../config/api"
import type { MediaItem } from "../types/movie"
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
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all")

  const fetchAnimations = async (page: number, sort: string, order: string, type: string) => {
    try {
      let url = ""
      const animationGenreId = 16 // Animation genre ID

      if (type === "movie") {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort}.${order}&with_genres=${animationGenreId}&include_adult=false`
      } else if (type === "tv") {
        const sortField = sort === "release_date" ? "first_air_date" : sort
        url = `https://api.themoviedb.org/3/discover/tv?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sortField}.${order}&with_genres=${animationGenreId}&include_adult=false`
      } else {
        // For "all", we'll fetch both movies and TV shows and combine them
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort}.${order}&with_genres=${animationGenreId}&include_adult=false`,
          ),
          fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${import.meta.env.VITE_API_KEY}&page=${page}&sort_by=${sort === "release_date" ? "first_air_date" : sort}.${order}&with_genres=${animationGenreId}&include_adult=false`,
          ),
        ])

        if (!movieResponse.ok || !tvResponse.ok) {
          throw new Error("Failed to fetch animations")
        }

        const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()])

        // Add media type identifier to each item
        const moviesWithType = movieData.results.map((item: any) => ({ ...item, media_type: "movie" }))
        const tvWithType = tvData.results.map((item: any) => ({ ...item, media_type: "tv" }))

        // Combine and sort results
        const combined = [...moviesWithType, ...tvWithType]
        const sortedResults = combined.sort((a, b) => {
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

        console.log(`✅ AnimationPage: Combined results: ${sortedResults.length} items`)
        return {
          results: sortedResults.slice(0, 20), // Limit to 20 items per page
          total_pages: Math.max(movieData.total_pages, tvData.total_pages),
        }
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch animations: ${response.statusText}`)
      const data = await response.json()

      // Add media type identifier for single type requests
      const resultsWithType = data.results.map((item: any) => ({
        ...item,
        media_type: type === "tv" ? "tv" : "movie",
      }))

      console.log(`✅ AnimationPage: Fetched ${resultsWithType.length} animations`)
      return { results: resultsWithType, total_pages: data.total_pages }
    } catch (error) {
      console.error("❌ AnimationPage: Error fetching animations:", error)
      throw error
    }
  }

  useEffect(() => {
    const loadAnimations = async () => {
      setLoading(true)
      setError(null)
      try {
        const { results, total_pages } = await fetchAnimations(currentPage, sortBy, sortOrder, mediaType)
        if (currentPage === 1) {
          setAnimations(results)
        } else {
          setAnimations((prevAnimations) => [...prevAnimations, ...results])
        }
        setTotalPages(total_pages)
        console.log(`✅ AnimationPage: Animations loaded: ${results.length} items`)
      } catch (err: any) {
        console.error("❌ AnimationPage: Error loading animations:", err)
        setError(err.message || "Failed to load animations.")
      } finally {
        setLoading(false)
      }
    }

    loadAnimations()
  }, [currentPage, sortBy, sortOrder, mediaType])

  // Reset to page 1 when sort or media type changes
  useEffect(() => {
    setCurrentPage(1)
    setAnimations([])
  }, [sortBy, sortOrder, mediaType])

  const convertToContentCard = (animation: MediaItem) => {
    // Determine if it's a movie or TV show
    const isMovie = animation.title || (animation as any).media_type === "movie"
    const isTv = animation.name || (animation as any).media_type === "tv"

    const cardData = {
      title: animation.title || animation.name || "Unknown Title",
      imageUrl: getImageUrl(animation.poster_path || "", "w300"),
      releaseInfo: formatDate(animation.release_date || animation.first_air_date || ""),
      type: isMovie ? ("movie" as const) : ("series" as const),
      isNew: !!animation.vote_average && animation.vote_average > 8,
      isHot: !!animation.popularity && animation.popularity > 1000,
      id: animation.id.toString(),
      mediaType: isMovie ? ("movie" as const) : ("tv" as const),
    }

    console.log(
      `🎬 AnimationPage: Converting animation - ID: ${animation.id}, Title: ${cardData.title}, Type: ${cardData.mediaType}`,
    )
    return cardData
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      console.log(`📄 AnimationPage: Loading more animations: page ${currentPage + 1}`)
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handleSortChange = (newSortBy: "popularity" | "release_date" | "vote_average") => {
    console.log(`🔄 AnimationPage: Changing sort: ${newSortBy}`)
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("desc")
    }
  }

  const handleMediaTypeChange = (newMediaType: "all" | "movie" | "tv") => {
    setMediaType(newMediaType)
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
        {/* <h1 className="animation-title">Animation Movies & Series</h1> */}
        <div className="controls-container">
          <div className="media-type-controls">
            <span className="control-label">Type:</span>
            <button
              className={`type-button ${mediaType === "all" ? "active" : ""}`}
              onClick={() => handleMediaTypeChange("all")}
            >
              All
            </button>
            <button
              className={`type-button ${mediaType === "movie" ? "active" : ""}`}
              onClick={() => handleMediaTypeChange("movie")}
            >
              Movies
            </button>
            <button
              className={`type-button ${mediaType === "tv" ? "active" : ""}`}
              onClick={() => handleMediaTypeChange("tv")}
            >
              TV Shows
            </button>
          </div>
          <div className="sort-controls">
            <span className="control-label">Sort by:</span>
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
            {animations.map((animation, index) => {
              const cardData = convertToContentCard(animation)
              const mediaPrefix = cardData.mediaType === "tv" ? "tv" : "movie"
              const finalId = `${mediaPrefix}-${cardData.id}`

              console.log(
                `🔗 AnimationPage: Rendering card - Original ID: ${animation.id}, Final ID: ${finalId}, Type: ${cardData.mediaType}`,
              )

              return (
                <ContentCard
                  key={`animation-${cardData.id}-${index}`} // Unique key with index
                  {...cardData}
                  onClick={() => {
                    console.log(`🎯 AnimationPage: Clicked animation - Navigating to: ${finalId}`)
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
        <div className="no-results-message">No animations found.</div>
      )}
    </main>
  )
}
