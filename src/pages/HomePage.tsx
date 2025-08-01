import { useState, useEffect } from "react"
import { HeroSection } from "../components/HeroSection"
import { ContentCard } from "../components/ContentCard"
import { ArrowRight } from "lucide-react"
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchMovieGenres,
  getImageUrl,
  formatRuntime,
  formatDate,
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [genres, trending, popular] = await Promise.all([
          fetchMovieGenres(),
          fetchTrendingMovies(),
          fetchPopularMovies(),
        ])

        setMovieGenres(genres)
        setTrendingMovies(trending)
        setPopularMovies(popular)

        if (trending.length > 0) {
          setHeroMovies(trending.slice(0, 5)) 
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

  const renderSection = (title: string, items: MediaItem[], isLoading = false) => (
    <section className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <a href="#" className="view-all-link">
          View all
          <ArrowRight className="arrow-icon" />
        </a>
      </div>
      <div className="movies-grid">
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
          : items.slice(0, 6).map((movie) => {
              const cardData = convertToContentCard(movie)
              return <ContentCard key={cardData.id} {...cardData} onClick={() => onNavigateToDetail(cardData.id)} />
            })}
      </div>
    </section>
  )

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
          movie={heroMovies[currentHeroMovieIndex]} // Truyền phim hiện tại
          movieGenres={movieGenres}
          totalMovies={heroMovies.length} // Truyền tổng số phim
          currentMovieIndex={currentHeroMovieIndex} // Truyền chỉ mục hiện tại
          onNavigateHero={handleNavigateHero} // Truyền hàm điều hướng
        />
      )}

      {renderSection("Trending Now", trendingMovies, loading)}
      {renderSection("Popular Movies", popularMovies, loading)}
      {renderSection("Top Rated", trendingMovies, loading)}
      {renderSection("New Releases", popularMovies, loading)}
      {renderSection("Recommended", trendingMovies, loading)}
    </main>
  )
}
