// TMDB API configuration
const API_KEY = import.meta.env.VITE_API_KEY
console.log("VITE_API_KEY loaded:", API_KEY ? "Yes" : "No", API_KEY ? API_KEY.substring(0, 5) + "..." : "N/A")
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// API endpoints
export const API_ENDPOINTS = {
  TRENDING_MOVIES: (page = 1) => `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=${page}`,
  POPULAR_MOVIES: (page = 1) => `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`,
  TOP_RATED_MOVIES: (page = 1) => `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`, // Added
  MOVIE_GENRES: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
  TV_GENRES: `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`,
  MOVIE_DETAILS: (id: number) => `${BASE_URL}/movie/${id}?api_key=${API_KEY}`,
  TV_DETAILS: (id: number) => `${BASE_URL}/tv/${id}?api_key=${API_KEY}`,
  SEARCH_MOVIES: (query: string, page = 1) =>
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}`,
  DISCOVER_MOVIES_BY_GENRE: (genreIds: number[], page = 1) => {
    const genreString = genreIds.join(",")
    return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&page=${page}`
  },
  DISCOVER_MOVIES_BY_COUNTRY: (countryCodes: string[], page = 1) => {
    const countryString = countryCodes.join("|")
    return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${countryString}&page=${page}&sort_by=popularity.desc`
  },
}

// Utility functions
export const getImageUrl = (path: string, size = "w500") => {
  if (!path) return "/placeholder.svg?height=350&width=250&text=No+Image"
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
export const fetchTrendingMovies = async (page = 1) => {
  try {
    const response = await fetch(API_ENDPOINTS.TRENDING_MOVIES(page))
    if (!response.ok) throw new Error("Failed to fetch trending movies")
    const data = await response.json()
    return { results: data.results, total_pages: data.total_pages }
  } catch (error) {
    console.error("Error fetching trending movies:", error)
    return { results: [], total_pages: 0 }
  }
}

export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(API_ENDPOINTS.POPULAR_MOVIES(page))
    if (!response.ok) throw new Error("Failed to fetch popular movies")
    const data = await response.json()
    return { results: data.results, total_pages: data.total_pages }
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return { results: [], total_pages: 0 }
  }
}

export const fetchTopRatedMovies = async (page = 1) => {
  try {
    const response = await fetch(API_ENDPOINTS.TOP_RATED_MOVIES(page))
    if (!response.ok) throw new Error("Failed to fetch top rated movies")
    const data = await response.json()
    return { results: data.results, total_pages: data.total_pages }
  } catch (error) {
    console.error("Error fetching top rated movies:", error)
    return { results: [], total_pages: 0 }
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

interface MediaItem {
  id: number
  title?: string
  name?: string
  runtime?: number
  poster_path?: string
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
    return { results: [], total_pages: 0 }
  }
  try {
    const url = API_ENDPOINTS.DISCOVER_MOVIES_BY_GENRE(genreIds, page)
    console.log("fetchMoviesByGenres: Fetching from URL:", url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch movies by genres: ${response.statusText}`)
    const data = await response.json()
    console.log("fetchMoviesByGenres: API response results:", data.results)
    return { results: data.results, total_pages: data.total_pages }
  } catch (error) {
    console.error("Error fetching movies by genres:", error)
    return { results: [], total_pages: 0 }
  }
}

export const fetchSearchMovies = async (query: string, page = 1) => {
  if (!query || query.trim() === "") {
    console.log("fetchSearchMovies: No query provided, returning empty array.")
    return []
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim())
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`
    console.log("fetchSearchMovies: Fetching from URL:", url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("fetchSearchMovies: API response:", data)

    // Filter out movies without poster_path for better UX
    const filteredResults = data.results.filter((movie: MediaItem) => movie.poster_path && (movie.title || movie.name))

    return filteredResults || []
  } catch (error) {
    console.error("Error fetching search results:", error)
    throw new Error(`Failed to search movies: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const fetchMoviesByCountries = async (countryCodes: string[], page = 1) => {
  if (countryCodes.length === 0) {
    console.log("fetchMoviesByCountries: No country codes provided, returning empty array.")
    return { results: [], total_pages: 0 }
  }
  try {
    const url = API_ENDPOINTS.DISCOVER_MOVIES_BY_COUNTRY(countryCodes, page)
    console.log("fetchMoviesByCountries: Fetching from URL:", url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch movies by countries: ${response.statusText}`)
    const data = await response.json()
    console.log("fetchMoviesByCountries: API response results:", data.results)
    return { results: data.results, total_pages: data.total_pages }
  } catch (error) {
    console.error("Error fetching movies by countries:", error)
    return { results: [], total_pages: 0 }
  }
}

// const API_KEY = import.meta.env.VITE_API_KEY
// console.log("VITE_API_KEY loaded:", API_KEY ? "Yes" : "No", API_KEY ? API_KEY.substring(0, 5) + "..." : "N/A")
// const BASE_URL = "https://api.themoviedb.org/3"
// const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// // API endpoints
// export const API_ENDPOINTS = {
//   TRENDING_MOVIES: (page = 1) => `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=${page}`,
//   POPULAR_MOVIES: (page = 1) => `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`,
//   TOP_RATED_MOVIES: (page = 1) => `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`, // Added
//   MOVIE_GENRES: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
//   TV_GENRES: `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`,
//   MOVIE_DETAILS: (id: number) => `${BASE_URL}/movie/${id}?api_key=${API_KEY}`,
//   TV_DETAILS: (id: number) => `${BASE_URL}/tv/${id}?api_key=${API_KEY}`,
//   SEARCH_MOVIES: (query: string, page = 1) =>
//     `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}`,
//   DISCOVER_MOVIES_BY_GENRE: (genreIds: number[], page = 1) => {
//     const genreString = genreIds.join(",")
//     return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&page=${page}`
//   },
//   DISCOVER_MOVIES_BY_COUNTRY: (countryCodes: string[], page = 1) => {
//     const countryString = countryCodes.join("|")
//     return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${countryString}&page=${page}`
//   },
// }

// // Utility functions
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

// export const fetchTrendingMovies = async (page = 1) => {
//   try {
//     const response = await fetch(API_ENDPOINTS.TRENDING_MOVIES(page))
//     if (!response.ok) throw new Error("Failed to fetch trending movies")
//     const data = await response.json()
//     return { results: data.results, total_pages: data.total_pages }
//   } catch (error) {
//     console.error("Error fetching trending movies:", error)
//     return { results: [], total_pages: 0 }
//   }
// }

// export const fetchPopularMovies = async (page = 1) => {
//   try {
//     const response = await fetch(API_ENDPOINTS.POPULAR_MOVIES(page))
//     if (!response.ok) throw new Error("Failed to fetch popular movies")
//     const data = await response.json()
//     return { results: data.results, total_pages: data.total_pages }
//   } catch (error) {
//     console.error("Error fetching popular movies:", error)
//     return { results: [], total_pages: 0 }
//   }
// }

// export const fetchTopRatedMovies = async (page = 1) => {
//   try {
//     const response = await fetch(API_ENDPOINTS.TOP_RATED_MOVIES(page))
//     if (!response.ok) throw new Error("Failed to fetch top rated movies")
//     const data = await response.json()
//     return { results: data.results, total_pages: data.total_pages }
//   } catch (error) {
//     console.error("Error fetching top rated movies:", error)
//     return { results: [], total_pages: 0 }
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

// interface MediaItem {
//   id: number
//   title?: string
//   name?: string
//   runtime?: number
//   poster_path?: string
// }

// export const fetchMovieWithRuntime = async (id: number): Promise<MediaItem | null> => {
//   try {
//     const response = await fetch(API_ENDPOINTS.MOVIE_DETAILS(id))
//     if (!response.ok) throw new Error(`Failed to fetch movie details for runtime: ${response.statusText}`)
//     const data = await response.json()
//     return data
//   } catch (error) {
//     console.error(`Error fetching runtime for movie ${id}:`, error)
//     return null
//   }
// }

// export const fetchMoviesByGenres = async (genreIds: number[], page = 1) => {
//   if (genreIds.length === 0) {
//     console.log("fetchMoviesByGenres: No genre IDs provided, returning empty array.")
//     return { results: [], total_pages: 0 }
//   }
//   try {
//     const url = API_ENDPOINTS.DISCOVER_MOVIES_BY_GENRE(genreIds, page)
//     console.log("fetchMoviesByGenres: Fetching from URL:", url)
//     const response = await fetch(url)
//     if (!response.ok) throw new Error(`Failed to fetch movies by genres: ${response.statusText}`)
//     const data = await response.json()
//     console.log("fetchMoviesByGenres: API response results:", data.results)
//     return { results: data.results, total_pages: data.total_pages }
//   } catch (error) {
//     console.error("Error fetching movies by genres:", error)
//     return { results: [], total_pages: 0 }
//   }
// }

// export const fetchSearchMovies = async (query: string, page = 1) => {
//   if (!query || query.trim() === "") {
//     console.log("fetchSearchMovies: No query provided, returning empty array.")
//     return []
//   }

//   try {
//     const encodedQuery = encodeURIComponent(query.trim())
//     const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`
//     console.log("fetchSearchMovies: Fetching from URL:", url)

//     const response = await fetch(url)
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }

//     const data = await response.json()
//     console.log("fetchSearchMovies: API response:", data)
//     const filteredResults = data.results.filter((movie: MediaItem) => movie.poster_path && (movie.title || movie.name))

//     return filteredResults || []
//   } catch (error) {
//     console.error("Error fetching search results:", error)
//     throw new Error(`Failed to search movies: ${error instanceof Error ? error.message : "Unknown error"}`)
//   }
// }

// export const fetchMoviesByCountries = async (countryCodes: string[], page = 1) => {
//   if (countryCodes.length === 0) {
//     console.log("fetchMoviesByCountries: No country codes provided, returning empty array.")
//     return { results: [], total_pages: 0 }
//   }
//   try {
//     const url = API_ENDPOINTS.DISCOVER_MOVIES_BY_COUNTRY(countryCodes, page)
//     console.log("fetchMoviesByCountries: Fetching from URL:", url)
//     const response = await fetch(url)
//     if (!response.ok) throw new Error(`Failed to fetch movies by countries: ${response.statusText}`)
//     const data = await response.json()
//     console.log("fetchMoviesByCountries: API response results:", data.results)
//     return { results: data.results, total_pages: data.total_pages }
//   } catch (error) {
//     console.error("Error fetching movies by countries:", error)
//     return { results: [], total_pages: 0 }
//   }
// }
