import { useState, useEffect } from "react"
import { HeroSection } from "../components/HeroSection"
import { ContentCard } from "../components/ContentCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchMovieGenres,
  getImageUrl,
  formatRuntime,
  formatDate,
  fetchTopRatedMovies,
} from "../config/api"
import type { MediaItem } from "../types/movie"
import "./HomePage.css"

interface HomePageProps {
  onNavigateToDetail: (id: string) => void
}

export function HomePage({ onNavigateToDetail }: HomePageProps) {
  const [heroMovies, setHeroMovies] = useState<MediaItem[]>([])
  const [currentHeroMovieIndex, setCurrentHeroMovieIndex] = useState(0)
  const [movieGenres, setMovieGenres] = useState<{ [key: number]: string }>({})
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([])
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionPages, setSectionPages] = useState<{ [key: string]: number }>({
    trending: 1,
    popular: 1,
    topRated: 1,
    newReleases: 1,
    recommended: 1,
  })
  const [loadingMore, setLoadingMore] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [genres, trending, popular, topRated] = await Promise.all([
          fetchMovieGenres(),
          fetchTrendingMovies(),
          fetchPopularMovies(),
          fetchTopRatedMovies(),
        ])

        setMovieGenres(genres)
        setTrendingMovies(trending.results)
        setPopularMovies(popular.results)
        setTopRatedMovies(topRated.results)

        if (trending.results.length > 0) {
          setHeroMovies(trending.results.slice(0, 5))
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load movie data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNavigateHero = (direction: "prev" | "next") => {
    if (heroMovies.length === 0) return
    setCurrentHeroMovieIndex((prevIndex) => {
      if (direction === "next") {
        return (prevIndex + 1) % heroMovies.length
      } else {
        return (prevIndex - 1 + heroMovies.length) % heroMovies.length
      }
    })
  }

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

  const handleLoadMore = async (sectionKey: string) => {
    if (loadingMore[sectionKey]) return

    setLoadingMore((prev) => ({ ...prev, [sectionKey]: true }))

    try {
      const nextPage = sectionPages[sectionKey] + 1

      switch (sectionKey) {
        case "trending":
          const trendingData = await fetchTrendingMovies(nextPage)
          setTrendingMovies((prev) => [...prev, ...trendingData.results])
          break
        case "popular":
          const popularData = await fetchPopularMovies(nextPage)
          setPopularMovies((prev) => [...prev, ...popularData.results])
          break
        case "topRated":
          const topRatedData = await fetchTopRatedMovies(nextPage)
          setTopRatedMovies((prev) => [...prev, ...topRatedData.results])
          break
        case "newReleases":
          const newReleasesData = await fetchPopularMovies(nextPage)
          setPopularMovies((prev) => [...prev, ...newReleasesData.results])
          break
        case "recommended":
          const recommendedData = await fetchTrendingMovies(nextPage)
          setTrendingMovies((prev) => [...prev, ...recommendedData.results])
          break
      }

      setSectionPages((prev) => ({ ...prev, [sectionKey]: nextPage }))
    } catch (error) {
      console.error(`Error loading more movies for ${sectionKey}:`, error)
    } finally {
      setLoadingMore((prev) => ({ ...prev, [sectionKey]: false }))
    }
  }

  const scrollCarousel = (sectionKey: string, direction: "left" | "right") => {
    const carousel = document.getElementById(`carousel-${sectionKey}`)
    if (carousel) {
      const scrollAmount = 320 
      const currentScroll = carousel.scrollLeft
      const maxScroll = carousel.scrollWidth - carousel.clientWidth

      if (direction === "right") {
        const newScroll = currentScroll + scrollAmount * 3
        carousel.scrollTo({ left: newScroll, behavior: "smooth" })
        if (newScroll >= maxScroll - scrollAmount * 2) {
          handleLoadMore(sectionKey)
        }
      } else {
        carousel.scrollTo({ left: currentScroll - scrollAmount * 3, behavior: "smooth" })
      }
    }
  }

  const renderSection = (title: string, items: MediaItem[], sectionKey: string, isLoading = false) => {
    return (
      <section className="movie-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <div className="carousel-controls">
            <button
              className="carousel-btn"
              onClick={() => scrollCarousel(sectionKey, "left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="carousel-icon" />
            </button>
            <button
              className="carousel-btn"
              onClick={() => scrollCarousel(sectionKey, "right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="carousel-icon" />
            </button>
          </div>
        </div>

        <div className="carousel-container">
          <div id={`carousel-${sectionKey}`} className="movies-carousel">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="loading-card">
                    <div className="loading-image"></div>
                    <div className="loading-content">
                      <div className="loading-title"></div>
                      <div className="loading-info"></div>
                    </div>
                  </div>
                ))
              : items.map((movie) => {
                  const cardData = convertToContentCard(movie)
                  return (
                    <div key={cardData.id} className="carousel-item">
                      <ContentCard {...cardData} onClick={() => onNavigateToDetail(cardData.id)} />
                    </div>
                  )
                })}

            {loadingMore[sectionKey] && (
              <div className="loading-more-cards">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`loading-${index}`} className="loading-card">
                    <div className="loading-image"></div>
                    <div className="loading-content">
                      <div className="loading-title"></div>
                      <div className="loading-info"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <main className="error-container">
        <div className="error-content">
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="home-page">
      {loading || heroMovies.length === 0 ? (
        <div className="hero-loading">
          <div className="loading-hero"></div>
        </div>
      ) : (
        <HeroSection
          movie={heroMovies[currentHeroMovieIndex]}
          movieGenres={movieGenres}
          totalMovies={heroMovies.length}
          currentMovieIndex={currentHeroMovieIndex}
          onNavigateHero={handleNavigateHero}
        />
      )}

      {renderSection("Trending Now", trendingMovies, "trending", loading)}
      {renderSection("Popular Movies", popularMovies, "popular", loading)}
      {renderSection("Top Rated", topRatedMovies, "topRated", loading)}
      {renderSection("New Releases", popularMovies, "newReleases", loading)}
      {renderSection("Recommended", trendingMovies, "recommended", loading)}
    </main>
  )
}

