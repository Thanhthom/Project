// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import { Search, Menu, Bell, ChevronDown, Check } from "lucide-react"
// import { fetchMovieGenres, fetchSearchMovies, getImageUrl } from "../config/api"
// import type { MediaItem } from "../types/movie"
// import { LoginModal } from "./LoginModal"
// import "./Header.css"

// // Add debounce utility function
// const debounce = (func: (...args: any[]) => void, delay: number) => {
//   let timeout: NodeJS.Timeout
//   return (...args: any[]) => {
//     clearTimeout(timeout)
//     timeout = setTimeout(() => func(...args), delay)
//   }
// }

// interface HeaderProps {
//   onNavigate: (
//     page: "home" | "detail" | "search" | "genre-results" | "country-results" | "movies" | "series" | "animation",
//     idOrQueryOrGenres?: string | number[] | string[],
//   ) => void
// }

// export function Header({ onNavigate }: HeaderProps) {
//   const [scrolled, setScrolled] = useState(false)
//   const [showGenreDropdown, setShowGenreDropdown] = useState(false)
//   const [showCountryDropdown, setShowCountryDropdown] = useState(false)
//   const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
//   const [selectedGenres, setSelectedGenres] = useState<number[]>([])
//   const [selectedCountries, setSelectedCountries] = useState<string[]>([])
//   const [genreSearchQuery, setGenreSearchQuery] = useState("")
//   const [countrySearchQuery, setCountrySearchQuery] = useState("")
//   const [searchQuery, setSearchQuery] = useState("")
//   // New states for search suggestions
//   const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
//   const [searchSuggestions, setSearchSuggestions] = useState<MediaItem[]>([])
//   const [countries, setCountries] = useState<{ iso_3166_1: string; english_name: string; native_name: string }[]>([])
//   const [showLoginDropdown, setShowLoginDropdown] = useState(false)
//   const [showLoginModal, setShowLoginModal] = useState(false)
//   const [loginModalMode, setLoginModalMode] = useState<"login" | "signup">("login")

//   const genreDropdownRef = useRef<HTMLDivElement>(null)
//   const countryDropdownRef = useRef<HTMLDivElement>(null)
//   const searchInputRef = useRef<HTMLDivElement>(null)
//   const loginDropdownRef = useRef<HTMLDivElement>(null)

//   const fetchCountries = async () => {
//     try {
//       const response = await fetch(
//         `https://api.themoviedb.org/3/configuration/countries?api_key=${import.meta.env.VITE_API_KEY}`,
//       )
//       if (!response.ok) throw new Error("Failed to fetch countries")
//       const data = await response.json()
//       console.log("Countries fetched from API:", data)
//       return data
//     } catch (error) {
//       console.error("Error fetching countries:", error)
//       return []
//     }
//   }

//   // Debounced function for fetching search suggestions
//   const debouncedFetchSuggestions = useRef(
//     debounce(async (query: string) => {
//       if (query.trim() === "") {
//         setSearchSuggestions([])
//         return
//       }
//       try {
//         const results = await fetchSearchMovies(query)
//         setSearchSuggestions(results.slice(0, 5)) // Limit to top 5 suggestions
//       } catch (error) {
//         console.error("Error fetching search suggestions:", error)
//         setSearchSuggestions([])
//       }
//     }, 300), // 300ms debounce
//   ).current

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20)
//     }

//     // Check initial scroll position
//     handleScroll()

//     // Add scroll listener
//     window.addEventListener("scroll", handleScroll, { passive: true })

//     const loadGenres = async () => {
//       const fetchedGenresMap = await fetchMovieGenres()
//       const genresArray = Object.entries(fetchedGenresMap).map(([id, name]) => ({
//         id: Number.parseInt(id),
//         name: name as string,
//       }))
//       setGenres(genresArray)
//     }

//     const loadCountries = async () => {
//       const fetchedCountries = await fetchCountries()
//       setCountries(fetchedCountries)
//       // Make countries list globally accessible for CountryResultsPage
//       ;(window as any).countriesList = fetchedCountries
//     }

//     loadGenres()
//     loadCountries()

//     const handleClickOutside = (event: MouseEvent) => {
//       if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
//         setShowGenreDropdown(false)
//         setGenreSearchQuery("")
//       }
//       if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
//         setShowCountryDropdown(false)
//         setCountrySearchQuery("")
//       }
//       // New: Handle click outside for search suggestions
//       if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
//         setShowSearchSuggestions(false)
//         setSearchSuggestions([]) // Clear suggestions when closing
//       }
//       if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
//         setShowLoginDropdown(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)

//     const handleGlobalKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "Enter") {
//         // Kiểm tra nếu đang focus vào search input thì không xử lý global enter
//         const activeElement = document.activeElement
//         if (activeElement && activeElement.classList.contains("search-input")) {
//           return // Let search input handle its own enter
//         }

//         if (showGenreDropdown && selectedGenres.length > 0) {
//           event.preventDefault()
//           console.log("Header: Global Enter pressed for genres, navigating to genre results with:", selectedGenres)
//           onNavigate("genre-results", selectedGenres)
//           setSelectedGenres([])
//           setShowGenreDropdown(false)
//           setGenreSearchQuery("")
//         } else if (showCountryDropdown && selectedCountries.length > 0) {
//           event.preventDefault()
//           console.log(
//             "Header: Global Enter pressed for countries, navigating to country results with:",
//             selectedCountries,
//           )
//           onNavigate("country-results", selectedCountries)
//           setSelectedCountries([])
//           setShowCountryDropdown(false)
//           setCountrySearchQuery("")
//         }
//       }
//     }

//     document.addEventListener("keydown", handleGlobalKeyDown)

//     return () => {
//       window.removeEventListener("scroll", handleScroll)
//       document.removeEventListener("mousedown", handleClickOutside)
//       document.removeEventListener("keydown", handleGlobalKeyDown)
//     }
//   }, [showGenreDropdown, showCountryDropdown, selectedGenres, selectedCountries, onNavigate])

//   const handleGenreClick = (genreId: number) => {
//     setSelectedGenres((prevSelected) => {
//       const newSelected = prevSelected.includes(genreId)
//         ? prevSelected.filter((id) => id !== genreId)
//         : [...prevSelected, genreId]

//       console.log("Genre selection updated:", newSelected)
//       return newSelected
//     })
//   }

//   const handleGenreSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === "Enter") {
//       event.preventDefault()
//       if (selectedGenres.length > 0) {
//         console.log("Header: Enter pressed in genre search, navigating with:", selectedGenres)
//         onNavigate("genre-results", selectedGenres)
//         setSelectedGenres([])
//         setShowGenreDropdown(false)
//         setGenreSearchQuery("")
//       }
//     }
//   }

//   const handleCountryClick = (countryCode: string, countryName: string) => {
//     setSelectedCountries((prevSelected) => {
//       const newSelected = prevSelected.includes(countryCode)
//         ? prevSelected.filter((code) => code !== countryCode)
//         : [...prevSelected, countryCode]

//       console.log(`Header: Country selection updated: ${countryName} (${countryCode})`, newSelected)
//       return newSelected
//     })
//   }

//   const handleCountrySearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === "Enter") {
//       event.preventDefault()
//       if (selectedCountries.length > 0) {
//         console.log("Header: Enter pressed in country search, navigating with:", selectedCountries)
//         onNavigate("country-results", selectedCountries)
//         setSelectedCountries([])
//         setShowCountryDropdown(false)
//         setCountrySearchQuery("")
//       }
//     }
//   }

//   const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const query = event.target.value
//     setSearchQuery(query)
//     if (query.trim().length > 0) {
//       setShowSearchSuggestions(true)
//       debouncedFetchSuggestions(query)
//     } else {
//       setShowSearchSuggestions(false)
//       setSearchSuggestions([])
//     }
//   }

//   const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === "Enter" && searchQuery.trim() !== "") {
//       onNavigate("search", searchQuery.trim())
//       setSearchQuery("")
//       setSearchSuggestions([]) // Clear suggestions after full search
//       setShowSearchSuggestions(false) // Hide dropdown
//     }
//   }

//   const handleSuggestionClick = (id: string) => {
//     onNavigate("detail", id)
//     setSearchQuery("") // Clear search query
//     setSearchSuggestions([]) // Clear suggestions
//     setShowSearchSuggestions(false) // Hide dropdown
//   }

//   const filteredGenres = genres.filter((genre) => genre.name.toLowerCase().includes(genreSearchQuery.toLowerCase()))

//   const filteredCountries = countries.filter((country) =>
//     country.english_name.toLowerCase().includes(countrySearchQuery.toLowerCase()),
//   )

//   const openLoginModal = (mode: "login" | "signup") => {
//     setLoginModalMode(mode)
//     setShowLoginModal(true)
//     setShowLoginDropdown(false)
//   }

//   return (
//     <>
//       <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
//         <div className="left">
//           <nav className="nav-bar">
//             <button onClick={() => onNavigate("home")} className="nav-link">
//               Home
//             </button>
//             <div className="nav-link-dropdown" ref={genreDropdownRef}>
//               <button
//                 className="nav-link dropdown-trigger"
//                 onClick={() => {
//                   setShowGenreDropdown(!showGenreDropdown)
//                   setShowCountryDropdown(false)
//                   setCountrySearchQuery("") // Close country dropdown
//                   setGenreSearchQuery("")
//                   setShowSearchSuggestions(false) // Close search suggestions
//                 }}
//                 aria-expanded={showGenreDropdown}
//               >
//                 Genre <ChevronDown className={`chevron-icon ${showGenreDropdown ? "open" : ""}`} />
//               </button>
//               {showGenreDropdown && (
//                 <div className="dropdown-content">
//                   <input
//                     type="text"
//                     placeholder="Search genres..."
//                     className="dropdown-search-input"
//                     value={genreSearchQuery}
//                     onChange={(e) => setGenreSearchQuery(e.target.value)}
//                     onKeyDown={handleGenreSearchSubmit}
//                     onClick={(e) => e.stopPropagation()}
//                   />
//                   {filteredGenres.length > 0 ? (
//                     filteredGenres.map((genre) => (
//                       <button
//                         key={genre.id}
//                         className={`dropdown-item ${selectedGenres.includes(genre.id) ? "selected" : ""}`}
//                         onClick={() => handleGenreClick(genre.id)}
//                       >
//                         {genre.name}
//                         {selectedGenres.includes(genre.id) && <Check className="check-icon" />}
//                       </button>
//                     ))
//                   ) : (
//                     <div className="no-results">No genres found.</div>
//                   )}
//                 </div>
//               )}
//             </div>
//             <div className="nav-link-dropdown" ref={countryDropdownRef}>
//               <button
//                 className="nav-link dropdown-trigger"
//                 onClick={() => {
//                   setShowCountryDropdown(!showCountryDropdown)
//                   setShowGenreDropdown(false)
//                   setGenreSearchQuery("") // Close genre dropdown
//                   setCountrySearchQuery("")
//                   setShowSearchSuggestions(false) // Close search suggestions
//                 }}
//                 aria-expanded={showCountryDropdown}
//               >
//                 Country <ChevronDown className={`chevron-icon ${showCountryDropdown ? "open" : ""}`} />
//               </button>
//               {showCountryDropdown && (
//                 <div className="dropdown-content">
//                   <input
//                     type="text"
//                     placeholder="Search countries..."
//                     className="dropdown-search-input"
//                     value={countrySearchQuery}
//                     onChange={(e) => setCountrySearchQuery(e.target.value)}
//                     onKeyDown={handleCountrySearchSubmit}
//                     onClick={(e) => e.stopPropagation()}
//                   />
//                   {filteredCountries.length > 0 ? (
//                     filteredCountries.map((country) => (
//                       <button
//                         key={country.iso_3166_1}
//                         className={`dropdown-item ${selectedCountries.includes(country.iso_3166_1) ? "selected" : ""}`}
//                         onClick={() => handleCountryClick(country.iso_3166_1, country.english_name)}
//                       >
//                         {country.english_name}
//                         {selectedCountries.includes(country.iso_3166_1) && <Check className="check-icon" />}
//                       </button>
//                     ))
//                   ) : (
//                     <div className="no-results">No countries found.</div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </nav>
//         </div>
//         <div className="right">
//           <div className="search-wrapper" ref={searchInputRef}>
//             <Search className="search-icon" />
//             <input
//               type="search"
//               placeholder="Search movies..."
//               className="search-input"
//               value={searchQuery}
//               onChange={handleSearchInputChange}
//               onKeyDown={handleSearchSubmit}
//             />
//             {showSearchSuggestions && (searchSuggestions.length > 0 || searchQuery.trim().length > 0) && (
//               <div className="search-suggestions-dropdown">
//                 {searchSuggestions.length > 0 ? (
//                   searchSuggestions.map((movie) => (
//                     <button
//                       key={movie.id}
//                       className="suggestion-item"
//                       onClick={() => handleSuggestionClick(movie.id.toString())}
//                     >
//                       {movie.poster_path && (
//                         <img
//                           src={getImageUrl(movie.poster_path, "w92") || "/placeholder.svg"} // Use w92 for small poster
//                           alt={movie.title || movie.name}
//                           className="suggestion-image"
//                           onError={(e) => {
//                             e.currentTarget.src = "/placeholder.png" // Fallback image
//                           }}
//                         />
//                       )}
//                       <span className="suggestion-title">{movie.title || movie.name}</span>
//                     </button>
//                   ))
//                 ) : (
//                   <div className="no-results">No suggestions found.</div>
//                 )}
//               </div>
//             )}
//           </div>
//           <nav className="nav-bar">
//             <button
//               onClick={() => {
//                 console.log("Movies button clicked!") // Debug log
//                 onNavigate("movies")
//               }}
//               className="nav-link"
//             >
//               Movies
//             </button>
//             <button
//               onClick={() => {
//                 console.log("Series button clicked!") // Debug log
//                 onNavigate("series")
//               }}
//               className="nav-link"
//             >
//               Series
//             </button>
//             <button
//               onClick={() => {
//                 console.log("Animation button clicked!") // Debug log
//                 onNavigate("animation")
//               }}
//               className="nav-link"
//             >
//               Animation
//             </button>
//             <div className="nav-link-dropdown" ref={loginDropdownRef}>
//               <button
//                 className="nav-link dropdown-trigger"
//                 onClick={() => {
//                   setShowLoginDropdown(!showLoginDropdown)
//                   setShowGenreDropdown(false)
//                   setShowCountryDropdown(false)
//                   setShowSearchSuggestions(false)
//                 }}
//                 aria-expanded={showLoginDropdown}
//               >
//                 Login/Signup <ChevronDown className={`chevron-icon ${showLoginDropdown ? "open" : ""}`} />
//               </button>
//               {showLoginDropdown && (
//                 <div className="dropdown-content login-dropdown">
//                   <button className="dropdown-item login-item" onClick={() => openLoginModal("login")}>
//                     🔑 Login
//                   </button>
//                   <button className="dropdown-item signup-item" onClick={() => openLoginModal("signup")}>
//                     ✨ Sign Up
//                   </button>
//                 </div>
//               )}
//             </div>
//             <Bell className="notification-icon" />
//           </nav>
//           <button className="menu-button">
//             <Menu className="menu-icon" />
//           </button>
//         </div>
//       </header>

//       <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} initialMode={loginModalMode} />
//     </>
//   )
// }


import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Menu, Bell, ChevronDown, Check, X } from "lucide-react" // Import X icon for close button
import { fetchMovieGenres, fetchSearchMovies, getImageUrl } from "../config/api"
import type { MediaItem } from "../types/movie"
import { LoginModal } from "./LoginModal"
import "./Header.css"

// Add debounce utility function
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

interface HeaderProps {
  onNavigate: (
    page: "home" | "detail" | "search" | "genre-results" | "country-results" | "movies" | "series" | "animation",
    idOrQueryOrGenres?: string | number[] | string[],
  ) => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [genreSearchQuery, setGenreSearchQuery] = useState("")
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<MediaItem[]>([])
  const [countries, setCountries] = useState<{ iso_3166_1: string; english_name: string; native_name: string }[]>([])
  const [showLoginDropdown, setShowLoginDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMode, setLoginModalMode] = useState<"login" | "signup">("login")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // New state for mobile menu

  const headerRef = useRef<HTMLElement>(null) // Ref for the header itself
  const genreDropdownRef = useRef<HTMLDivElement>(null)
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLDivElement>(null)
  const loginDropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null) // Ref for the mobile menu

  const fetchCountries = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/configuration/countries?api_key=${import.meta.env.VITE_API_KEY}`,
      )
      if (!response.ok) throw new Error("Failed to fetch countries")
      const data = await response.json()
      console.log("Countries fetched from API:", data)
      return data
    } catch (error) {
      console.error("Error fetching countries:", error)
      return []
    }
  }

  const debouncedFetchSuggestions = useRef(
    debounce(async (query: string) => {
      if (query.trim() === "") {
        setSearchSuggestions([])
        return
      }
      try {
        const results = await fetchSearchMovies(query)
        setSearchSuggestions(results.slice(0, 5))
      } catch (error) {
        console.error("Error fetching search suggestions:", error)
        setSearchSuggestions([])
      }
    }, 300),
  ).current

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    const loadGenres = async () => {
      const fetchedGenresMap = await fetchMovieGenres()
      const genresArray = Object.entries(fetchedGenresMap).map(([id, name]) => ({
        id: Number.parseInt(id),
        name: name as string,
      }))
      setGenres(genresArray)
    }

    const loadCountries = async () => {
      const fetchedCountries = await fetchCountries()
      setCountries(fetchedCountries)
      ;(window as any).countriesList = fetchedCountries
    }

    loadGenres()
    loadCountries()

    const handleClickOutside = (event: MouseEvent) => {
      // Close desktop dropdowns
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setShowGenreDropdown(false)
        setGenreSearchQuery("")
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
        setCountrySearchQuery("")
      }
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
        setSearchSuggestions([])
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setShowLoginDropdown(false)
      }

      // Close mobile menu if click outside and not on the menu button
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".menu-button")
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false)
          return
        }
        if (showGenreDropdown) {
          setShowGenreDropdown(false)
          setGenreSearchQuery("")
          return
        }
        if (showCountryDropdown) {
          setShowCountryDropdown(false)
          setCountrySearchQuery("")
          return
        }
        if (showSearchSuggestions) {
          setShowSearchSuggestions(false)
          setSearchSuggestions([])
          return
        }
        if (showLoginDropdown) {
          setShowLoginDropdown(false)
          return
        }
      }

      if (event.key === "Enter") {
        const activeElement = document.activeElement
        if (
          activeElement &&
          (activeElement.classList.contains("search-input") ||
            activeElement.classList.contains("dropdown-search-input"))
        ) {
          return
        }

        if (showGenreDropdown && selectedGenres.length > 0) {
          event.preventDefault()
          console.log("Header: Global Enter pressed for genres, navigating to genre results with:", selectedGenres)
          onNavigate("genre-results", selectedGenres)
          setSelectedGenres([])
          setShowGenreDropdown(false)
          setGenreSearchQuery("")
        } else if (showCountryDropdown && selectedCountries.length > 0) {
          event.preventDefault()
          console.log(
            "Header: Global Enter pressed for countries, navigating to country results with:",
            selectedCountries,
          )
          onNavigate("country-results", selectedCountries)
          setSelectedCountries([])
          setShowCountryDropdown(false)
          setCountrySearchQuery("")
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleGlobalKeyDown)
    }
  }, [
    isMobileMenuOpen,
    showGenreDropdown,
    showCountryDropdown,
    showSearchSuggestions,
    showLoginDropdown,
    selectedGenres,
    selectedCountries,
    onNavigate,
  ])

  const handleGenreClick = (genreId: number) => {
    setSelectedGenres((prevSelected) => {
      const newSelected = prevSelected.includes(genreId)
        ? prevSelected.filter((id) => id !== genreId)
        : [...prevSelected, genreId]

      console.log("Genre selection updated:", newSelected)
      return newSelected
    })
  }

  const handleGenreSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      if (selectedGenres.length > 0) {
        console.log("Header: Enter pressed in genre search, navigating with:", selectedGenres)
        onNavigate("genre-results", selectedGenres)
        setSelectedGenres([])
        setShowGenreDropdown(false)
        setGenreSearchQuery("")
        setIsMobileMenuOpen(false) // Close mobile menu after navigation
      }
    }
  }

  const handleCountryClick = (countryCode: string, countryName: string) => {
    setSelectedCountries((prevSelected) => {
      const newSelected = prevSelected.includes(countryCode)
        ? prevSelected.filter((code) => code !== countryCode)
        : [...prevSelected, countryCode]

      console.log(`Header: Country selection updated: ${countryName} (${countryCode})`, newSelected)
      return newSelected
    })
  }

  const handleCountrySearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      if (selectedCountries.length > 0) {
        console.log("Header: Enter pressed in country search, navigating with:", selectedCountries)
        onNavigate("country-results", selectedCountries)
        setSelectedCountries([])
        setShowCountryDropdown(false)
        setCountrySearchQuery("")
        setIsMobileMenuOpen(false) // Close mobile menu after navigation
      }
    }
  }

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    if (query.trim().length > 0) {
      setShowSearchSuggestions(true)
      debouncedFetchSuggestions(query)
    } else {
      setShowSearchSuggestions(false)
      setSearchSuggestions([])
    }
  }

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchQuery.trim() !== "") {
      onNavigate("search", searchQuery.trim())
      setSearchQuery("")
      setSearchSuggestions([])
      setShowSearchSuggestions(false)
      setIsMobileMenuOpen(false) // Close mobile menu after navigation
    }
  }

  const handleSuggestionClick = (id: string) => {
    onNavigate("detail", id)
    setSearchQuery("")
    setSearchSuggestions([])
    setShowSearchSuggestions(false)
    setIsMobileMenuOpen(false) // Close mobile menu after navigation
  }

  const filteredGenres = genres.filter((genre) => genre.name.toLowerCase().includes(genreSearchQuery.toLowerCase()))

  const filteredCountries = countries.filter((country) =>
    country.english_name.toLowerCase().includes(countrySearchQuery.toLowerCase()),
  )

  const openLoginModal = (mode: "login" | "signup") => {
    setLoginModalMode(mode)
    setShowLoginModal(true)
    setShowLoginDropdown(false)
    setIsMobileMenuOpen(false) 
  }

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setShowGenreDropdown(false)
    setShowCountryDropdown(false)
    setShowSearchSuggestions(false)
    setShowLoginDropdown(false)
    setGenreSearchQuery("")
    setCountrySearchQuery("")
    setSearchQuery("")
    setSearchSuggestions([])
  }

  const handleNavigateAndClose = (
    page: "home" | "movies" | "series" | "animation",
    param?: string | number[] | string[],
  ) => {
    onNavigate(page, param)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header ref={headerRef} className={`header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="left">
          <nav className="nav-bar desktop-nav">
            <button onClick={() => onNavigate("home")} className="nav-link">
              Home
            </button>
            <div className="nav-link-dropdown" ref={genreDropdownRef}>
              <button
                className="nav-link dropdown-trigger"
                onClick={() => {
                  setShowGenreDropdown(!showGenreDropdown)
                  setShowCountryDropdown(false)
                  setCountrySearchQuery("")
                  setGenreSearchQuery("")
                  setShowSearchSuggestions(false)
                }}
                aria-expanded={showGenreDropdown}
              >
                Genre <ChevronDown className={`chevron-icon ${showGenreDropdown ? "open" : ""}`} />
              </button>
              {showGenreDropdown && (
                <div className="dropdown-content">
                  <input
                    type="text"
                    placeholder="Search genres..."
                    className="dropdown-search-input"
                    value={genreSearchQuery}
                    onChange={(e) => setGenreSearchQuery(e.target.value)}
                    onKeyDown={handleGenreSearchSubmit}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {filteredGenres.length > 0 ? (
                    filteredGenres.map((genre) => (
                      <button
                        key={genre.id}
                        className={`dropdown-item ${selectedGenres.includes(genre.id) ? "selected" : ""}`}
                        onClick={() => handleGenreClick(genre.id)}
                      >
                        {genre.name}
                        {selectedGenres.includes(genre.id) && <Check className="check-icon" />}
                      </button>
                    ))
                  ) : (
                    <div className="no-results">No genres found.</div>
                  )}
                </div>
              )}
            </div>
            <div className="nav-link-dropdown" ref={countryDropdownRef}>
              <button
                className="nav-link dropdown-trigger"
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown)
                  setShowGenreDropdown(false)
                  setGenreSearchQuery("")
                  setCountrySearchQuery("")
                  setShowSearchSuggestions(false)
                }}
                aria-expanded={showCountryDropdown}
              >
                Country <ChevronDown className={`chevron-icon ${showCountryDropdown ? "open" : ""}`} />
              </button>
              {showCountryDropdown && (
                <div className="dropdown-content">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    className="dropdown-search-input"
                    value={countrySearchQuery}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    onKeyDown={handleCountrySearchSubmit}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.iso_3166_1}
                        className={`dropdown-item ${selectedCountries.includes(country.iso_3166_1) ? "selected" : ""}`}
                        onClick={() => handleCountryClick(country.iso_3166_1, country.english_name)}
                      >
                        {country.english_name}
                        {selectedCountries.includes(country.iso_3166_1) && <Check className="check-icon" />}
                      </button>
                    ))
                  ) : (
                    <div className="no-results">No countries found.</div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="right">
          <div className="search-wrapper desktop-search" ref={searchInputRef}>
            <Search className="search-icon" />
            <input
              type="search"
              placeholder="Search movies..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchSubmit}
            />
            {showSearchSuggestions && (searchSuggestions.length > 0 || searchQuery.trim().length > 0) && (
              <div className="search-suggestions-dropdown">
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((movie) => (
                    <button
                      key={movie.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(movie.id.toString())}
                    >
                      {movie.poster_path && (
                        <img
                          src={getImageUrl(movie.poster_path, "w92") || "/placeholder.svg"}
                          alt={movie.title || movie.name}
                          className="suggestion-image"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png"
                          }}
                        />
                      )}
                      <span className="suggestion-title">{movie.title || movie.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="no-results">No suggestions found.</div>
                )}
              </div>
            )}
          </div>
          <nav className="nav-bar desktop-nav">
            <button onClick={() => onNavigate("movies")} className="nav-link">
              Movies
            </button>
            <button onClick={() => onNavigate("series")} className="nav-link">
              Series
            </button>
            <button onClick={() => onNavigate("animation")} className="nav-link">
              Animation
            </button>
            <div className="nav-link-dropdown" ref={loginDropdownRef}>
              <button
                className="nav-link dropdown-trigger"
                onClick={() => {
                  setShowLoginDropdown(!showLoginDropdown)
                  setShowGenreDropdown(false)
                  setShowCountryDropdown(false)
                  setShowSearchSuggestions(false)
                }}
                aria-expanded={showLoginDropdown}
              >
                Login/Signup <ChevronDown className={`chevron-icon ${showLoginDropdown ? "open" : ""}`} />
              </button>
              {showLoginDropdown && (
                <div className="dropdown-content login-dropdown">
                  <button className="dropdown-item login-item" onClick={() => openLoginModal("login")}>
                    🔑 Login
                  </button>
                  <button className="dropdown-item signup-item" onClick={() => openLoginModal("signup")}>
                    ✨ Sign Up
                  </button>
                </div>
              )}
            </div>
            <Bell className="notification-icon" />
          </nav>
          <button className="menu-button mobile-menu-toggle" onClick={handleToggleMobileMenu}>
            <Menu className="menu-icon" />
          </button>
        </div>
      </header>

      <div ref={mobileMenuRef} className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-menu-close" onClick={handleToggleMobileMenu}>
          <X className="close-icon" />
        </button>
        <nav className="mobile-nav-bar">
          <button onClick={() => handleNavigateAndClose("home")} className="mobile-nav-link">
            Home
          </button>

          {/* Genre Section for Mobile */}
          <div className="mobile-nav-dropdown">
            <button
              className="mobile-nav-link dropdown-trigger"
              onClick={() => {
                setShowGenreDropdown(!showGenreDropdown)
                setShowCountryDropdown(false) // Close other dropdowns
                setShowLoginDropdown(false)
                setShowSearchSuggestions(false)
              }}
              aria-expanded={showGenreDropdown}
            >
              Genre <ChevronDown className={`chevron-icon ${showGenreDropdown ? "open" : ""}`} />
            </button>
            {showGenreDropdown && (
              <div className="dropdown-content mobile-dropdown-override">
                <button className="mobile-dropdown-back-button" onClick={() => setShowGenreDropdown(false)}>
                  <ChevronDown className="chevron-icon open" /> Back
                </button>
                <input
                  type="text"
                  placeholder="Search genres..."
                  className="dropdown-search-input"
                  value={genreSearchQuery}
                  onChange={(e) => setGenreSearchQuery(e.target.value)}
                  onKeyDown={handleGenreSearchSubmit}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="mobile-dropdown-items-grid">
                  {filteredGenres.length > 0 ? (
                    filteredGenres.map((genre) => (
                      <button
                        key={genre.id}
                        className={`dropdown-item ${selectedGenres.includes(genre.id) ? "selected" : ""}`}
                        onClick={() => handleGenreClick(genre.id)}
                      >
                        {genre.name}
                        {selectedGenres.includes(genre.id) && <Check className="check-icon" />}
                      </button>
                    ))
                  ) : (
                    <div className="no-results">No genres found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mobile-nav-dropdown">
            <button
              className="mobile-nav-link dropdown-trigger"
              onClick={() => {
                setShowCountryDropdown(!showCountryDropdown)
                setShowGenreDropdown(false)
                setShowLoginDropdown(false)
                setShowSearchSuggestions(false)
              }}
              aria-expanded={showCountryDropdown}
            >
              Country <ChevronDown className={`chevron-icon ${showCountryDropdown ? "open" : ""}`} />
            </button>
            {showCountryDropdown && (
              <div className="dropdown-content mobile-dropdown-override">
                <button className="mobile-dropdown-back-button" onClick={() => setShowCountryDropdown(false)}>
                  <ChevronDown className="chevron-icon open" /> Back
                </button>
                <input
                  type="text"
                  placeholder="Search countries..."
                  className="dropdown-search-input"
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  onKeyDown={handleCountrySearchSubmit}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="mobile-dropdown-items-grid">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.iso_3166_1}
                        className={`dropdown-item ${selectedCountries.includes(country.iso_3166_1) ? "selected" : ""}`}
                        onClick={() => handleCountryClick(country.iso_3166_1, country.english_name)}
                      >
                        {country.english_name}
                        {selectedCountries.includes(country.iso_3166_1) && <Check className="check-icon" />}
                      </button>
                    ))
                  ) : (
                    <div className="no-results">No countries found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => handleNavigateAndClose("movies")} className="mobile-nav-link">
            Movies
          </button>
          <button onClick={() => handleNavigateAndClose("series")} className="mobile-nav-link">
            Series
          </button>
          <button onClick={() => handleNavigateAndClose("animation")} className="mobile-nav-link">
            Animation
          </button>

          <div className="mobile-nav-dropdown">
            <button
              className="mobile-nav-link dropdown-trigger"
              onClick={() => {
                setShowLoginDropdown(!showLoginDropdown)
                setShowGenreDropdown(false) 
                setShowCountryDropdown(false)
                setShowSearchSuggestions(false)
              }}
              aria-expanded={showLoginDropdown}
            >
              Login/Signup <ChevronDown className={`chevron-icon ${showLoginDropdown ? "open" : ""}`} />
            </button>
            {showLoginDropdown && (
              <div className="dropdown-content login-dropdown mobile-dropdown-override">
                <button className="mobile-dropdown-back-button" onClick={() => setShowLoginDropdown(false)}>
                  <ChevronDown className="chevron-icon open" /> Back
                </button>
                <button className="dropdown-item login-item" onClick={() => openLoginModal("login")}>
                  🔑 Login
                </button>
                <button className="dropdown-item signup-item" onClick={() => openLoginModal("signup")}>
                  ✨ Sign Up
                </button>
              </div>
            )}
          </div>
          <Bell className="notification-icon mobile-notification-icon" />
        </nav>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} initialMode={loginModalMode} />
    </>
  )
}
