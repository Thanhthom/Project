const API_KEY = import.meta.env.VITE_API_KEY
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export const API_ENDPOINTS = {
  TRENDING_MOVIES: `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`,
  POPULAR_MOVIES: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
  TOP_RATED_MOVIES: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
  MOVIE_GENRES: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
  TV_GENRES: `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`,
  MOVIE_DETAILS: (id: number) => `${BASE_URL}/movie/${id}?api_key=${API_KEY}`,
  TV_DETAILS: (id: number) => `${BASE_URL}/tv/${id}?api_key=${API_KEY}`,
  SEARCH_MOVIES: (query: string) => `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
}

export const getImageUrl = (path: string, size = "w500") => {
  if (!path) return "/placeholder.png"
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export const formatDate = (dateString: string) => {
  if (!dateString) return ""
  return new Date(dateString).getFullYear().toString()
}

export const formatRuntime = (minutes: number) => {
  if (!minutes) return ""
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export const fetchTrendingMovies = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.TRENDING_MOVIES)
    if (!response.ok) throw new Error("Failed to fetch trending movies")
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching trending movies:", error)
    return []
  }
}

export const fetchPopularMovies = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.POPULAR_MOVIES)
    if (!response.ok) throw new Error("Failed to fetch popular movies")
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return []
  }
}

export const fetchMovieGenres = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.MOVIE_GENRES)
    if (!response.ok) throw new Error("Failed to fetch movie genres")
    const data = await response.json()

    const genresMap: { [key: number]: string } = {}
    data.genres.forEach((genre: { id: number; name: string }) => {
      genresMap[genre.id] = genre.name
    })
    return genresMap
  } catch (error) {
    console.error("Error fetching movie genres:", error)
    return {}
  }
}

export const fetchMovieDetails = async (id: number) => {
  try {
    const response = await fetch(API_ENDPOINTS.MOVIE_DETAILS(id))
    if (!response.ok) throw new Error("Failed to fetch movie details")
    return await response.json()
  } catch (error) {
    console.error("Error fetching movie details:", error)
    return null
  }
}
