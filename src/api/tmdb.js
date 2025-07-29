const API_KEY = import.meta.env.VITE_API_KEY
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/"

const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
}

export const getGenreNames = (genreIds) => {
  if (!genreIds || !Array.isArray(genreIds)) return []
  return genreIds.map((id) => genreMap[id]).filter(Boolean)
}

export const fetchFromTmdb = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.append("api_key", API_KEY)
  for (const key in params) {
    url.searchParams.append(key, params[key])
  }

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching from TMDB:", error)
    return null
  }
}

export const getImageUrl = (path, size = "w500") => {
  if (!path) return "/placeholder.svg" 
  return `${IMAGE_BASE_URL}${size}${path}`
}

export const fetchPopularMovies = async () => {
  return fetchFromTmdb("/movie/popular")
}

export const fetchTrendingMovies = async () => {
  return fetchFromTmdb("/trending/movie/week")
}

export const fetchNowPlayingMovies = async () => {
  return fetchFromTmdb("/movie/now_playing")
}

export const fetchPopularSeries = async () => {
  return fetchFromTmdb("/tv/popular")
}

export const fetchMovieDetails = async (id) => {
  return fetchFromTmdb(`/movie/${id}`)
}

export const fetchMovieRecommendations = async (id) => {
  return fetchFromTmdb(`/movie/${id}/recommendations`)
}

export const fetchTvDetails = async (id) => {
  return fetchFromTmdb(`/tv/${id}`)
}

export const fetchTvRecommendations = async (id) => {
  return fetchFromTmdb(`/tv/${id}/recommendations`)
}

export const fetchTvSeasonDetails = async (tvId, seasonNumber) => {
  return fetchFromTmdb(`/tv/${tvId}/season/${seasonNumber}`)
}
