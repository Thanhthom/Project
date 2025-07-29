export interface Genre {
  id: number
  name: string
}

export interface MediaItem {
  id: number
  title?: string
  name?: string
  overview?: string
  backdrop_path?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  popularity?: number
  runtime?: number
  genre_ids?: number[]
  genres?: Genre[]
  adult?: boolean
  original_language?: string
  original_title?: string
  video?: boolean
}

export interface MovieResponse {
  page: number
  results: MediaItem[]
  total_pages: number
  total_results: number
}

export interface GenreResponse {
  genres: Genre[]
}
