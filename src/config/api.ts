// const API_KEY = import.meta.env.VITE_API_KEY
// const BASE_URL = "https://api.themoviedb.org/3"
// const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// export const API_ENDPOINTS = {
//   TRENDING_MOVIES: `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`,
//   POPULAR_MOVIES: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
//   TOP_RATED_MOVIES: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
//   MOVIE_GENRES: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
//   TV_GENRES: `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`,
//   MOVIE_DETAILS: (id: number) => `${BASE_URL}/movie/${id}?api_key=${API_KEY}`,
//   TV_DETAILS: (id: number) => `${BASE_URL}/tv/${id}?api_key=${API_KEY}`,
//   SEARCH_MOVIES: (query: string) => `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
// }

// export const getImageUrl = (path: string, size = "w500") => {
//   if (!path) return "/placeholder.png"
//   return `${IMAGE_BASE_URL}/${size}${path}`
// }

// export const formatDate = (dateString: string) => {
//   if (!dateString) return ""
//   return new Date(dateString).getFullYear().toString()
// }

// export const formatRuntime = (minutes: number) => {
//   if (!minutes) return ""
//   const hours = Math.floor(minutes / 60)
//   const mins = minutes % 60
//   return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
// }

// export const fetchTrendingMovies = async () => {
//   try {
//     const response = await fetch(API_ENDPOINTS.TRENDING_MOVIES)
//     if (!response.ok) throw new Error("Failed to fetch trending movies")
//     const data = await response.json()
//     return data.results
//   } catch (error) {
//     console.error("Error fetching trending movies:", error)
//     return []
//   }
// }

// export const fetchPopularMovies = async () => {
//   try {
//     const response = await fetch(API_ENDPOINTS.POPULAR_MOVIES)
//     if (!response.ok) throw new Error("Failed to fetch popular movies")
//     const data = await response.json()
//     return data.results
//   } catch (error) {
//     console.error("Error fetching popular movies:", error)
//     return []
//   }
// }

// export const fetchMovieGenres = async () => {
//   try {
//     const response = await fetch(API_ENDPOINTS.MOVIE_GENRES)
//     if (!response.ok) throw new Error("Failed to fetch movie genres")
//     const data = await response.json()

//     const genresMap: { [key: number]: string } = {}
//     data.genres.forEach((genre: { id: number; name: string }) => {
//       genresMap[genre.id] = genre.name
//     })
//     return genresMap
//   } catch (error) {
//     console.error("Error fetching movie genres:", error)
//     return {}
//   }
// }

// export const fetchMovieDetails = async (id: number) => {
//   try {
//     const response = await fetch(API_ENDPOINTS.MOVIE_DETAILS(id))
//     if (!response.ok) throw new Error("Failed to fetch movie details")
//     return await response.json()
//   } catch (error) {
//     console.error("Error fetching movie details:", error)
//     return null
//   }
// }
// TMDB API configuration
// TMDB API configuration


// TMDB API configuration
const API_KEY = import.meta.env.VITE_API_KEY
console.log("VITE_API_KEY loaded:", API_KEY ? "Yes" : "No", API_KEY ? API_KEY.substring(0, 5) + "..." : "N/A")
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// API endpoints
export const API_ENDPOINTS = {
  TRENDING_MOVIES: `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`,
  POPULAR_MOVIES: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
  TOP_RATED_MOVIES: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
  MOVIE_GENRES: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
  TV_GENRES: `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`,
  MOVIE_DETAILS: (id: number) => `${BASE_URL}/movie/${id}?api_key=${API_KEY}`, // Endpoint này trả về runtime
  TV_DETAILS: (id: number) => `${BASE_URL}/tv/${id}?api_key=${API_KEY}`,
  SEARCH_MOVIES: (query: string) => `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
  DISCOVER_MOVIES_BY_GENRE: (genreIds: number[], page = 1) => {
    const genreString = genreIds.join(",")
    return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&page=${page}`
  },
  DISCOVER_MOVIES_BY_COUNTRY: (countryCodes: string[], page = 1) => {
    // Endpoint mới cho quốc gia
    const countryString = countryCodes.join("|") // TMDB sử dụng | cho logic OR giữa các quốc gia
    return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${countryString}&page=${page}`
  },
}

// Utility functions
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

// API fetch functions
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

// Hàm fetch mới để lấy chi tiết phim bao gồm runtime
interface MediaItem {
  // Define the properties of MediaItem here
  id: number
  title?: string
  name?: string
  runtime?: number
  // Add other properties as needed
}

export const fetchMovieWithRuntime = async (id: number): Promise<MediaItem | null> => {
  try {
    const response = await fetch(API_ENDPOINTS.MOVIE_DETAILS(id))
    if (!response.ok) throw new Error(`Failed to fetch movie details for runtime: ${response.statusText}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching runtime for movie ${id}:`, error)
    return null
  }
}

export const fetchMoviesByGenres = async (genreIds: number[], page = 1) => {
  if (genreIds.length === 0) {
    console.log("fetchMoviesByGenres: No genre IDs provided, returning empty array.")
    return []
  }
  try {
    const url = API_ENDPOINTS.DISCOVER_MOVIES_BY_GENRE(genreIds, page) // Truyền tham số page
    console.log("fetchMoviesByGenres: Fetching from URL:", url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch movies by genres: ${response.statusText}`)
    const data = await response.json()
    console.log("fetchMoviesByGenres: API response results:", data.results)
    return data.results
  } catch (error) {
    console.error("Error fetching movies by genres:", error)
    return []
  }
}

// Hàm fetch mới để tìm kiếm phim
export const fetchSearchMovies = async (query: string) => {
  if (!query) {
    console.log("fetchSearchMovies: No query provided, returning empty array.")
    return []
  }
  try {
    const url = API_ENDPOINTS.SEARCH_MOVIES(query)
    console.log("fetchSearchMovies: Fetching from URL:", url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch search results: ${response.statusText}`)
    const data = await response.json()
    console.log("fetchSearchMovies: API response results:", data.results)
    return data.results
  } catch (error) {
    console.error("Error fetching search results:", error)
    return []
  }
}

export const fetchMoviesByCountries = async (countryCodes: string[], page = 1) => {
  // Hàm fetch mới cho quốc gia
  if (countryCodes.length === 0) {
    console.log("fetchMoviesByCountries: No country codes provided, returning empty array.")
    return []
  }
  try {
    const url = API_ENDPOINTS.DISCOVER_MOVIES_BY_COUNTRY(countryCodes, page)
    console.log("fetchMoviesByCountries: Fetching from URL:", url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch movies by countries: ${response.statusText}`)
    const data = await response.json()
    console.log("fetchMoviesByCountries: API response results:", data.results)
    return data.results
  } catch (error) {
    console.error("Error fetching movies by countries:", error)
    return []
  }
}
