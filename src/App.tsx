import { useState } from "react"
import { Header } from "./components/Header"
import { HomePage } from "./pages/HomePage"
import { DetailPage } from "./pages/DetailPage"
import { SearchPage } from "./pages/SearchPage"
import { GenreResultsPage } from "./pages/GenreResultsPage"
import { CountryResultsPage } from "./pages/CountryResultsPage"
import { ActorResultsPage } from "./pages/ActorResultsPage"
import { ActorsPage } from "./pages/ActorsPage"
import { MoviesPage } from "./pages/MoviesPage"
import { SeriesPage } from "./pages/SeriesPage"
import { AnimationPage } from "./pages/AnimationPage"

function App() {
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "detail"
    | "search"
    | "genre-results"
    | "country-results"
    | "actor-results"
    | "actors"
    | "movies"
    | "series"
    | "animation"
  >("home")
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(null)
  const [currentGenreIds, setCurrentGenreIds] = useState<number[] | null>(null)
  const [currentCountryCodes, setCurrentCountryCodes] = useState<string[] | null>(null)
  const [currentActorIds, setCurrentActorIds] = useState<number[] | null>(null)

  const handleNavigate = (
    page:
      | "home"
      | "detail"
      | "search"
      | "genre-results"
      | "country-results"
      | "actor-results"
      | "actors"
      | "movies"
      | "series"
      | "animation",
    param?: string | number[] | string[],
  ) => {
    console.log("App: Navigating to", page, "with param:", param)

    setCurrentPage(page)
    if (page !== "detail") setCurrentDetailId(null)
    if (page !== "search") setCurrentSearchQuery(null)
    if (page !== "genre-results") setCurrentGenreIds(null)
    if (page !== "country-results") setCurrentCountryCodes(null)
    if (page !== "actor-results") setCurrentActorIds(null)


    if (page === "detail") {
      console.log("App: Setting detail ID to:", param as string)
      setCurrentDetailId(param as string)
    } else if (page === "search") {
      setCurrentSearchQuery(param as string)
    } else if (page === "genre-results") {
      setCurrentGenreIds(param as number[])
    } else if (page === "country-results") {
      setCurrentCountryCodes(param as string[])
    } else if (page === "actor-results") {
      setCurrentActorIds(param as number[])
    }
  }

  const handleNavigateToActorResults = (actorIds: number[]) => {
    handleNavigate("actor-results", actorIds)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={handleNavigate} />

      {currentPage === "home" && <HomePage onNavigateToDetail={(id) => handleNavigate("detail", id)} />}

      {currentPage === "detail" && currentDetailId && (
        <DetailPage
          key={currentDetailId} 
          id={currentDetailId}
          onNavigateToDetail={(id) => handleNavigate("detail", id)}
        />
      )}

      {currentPage === "search" && (
        <SearchPage searchQuery={currentSearchQuery} onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      )}

      {currentPage === "genre-results" && (
        <GenreResultsPage genreIds={currentGenreIds} onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      )}

      {currentPage === "country-results" && (
        <CountryResultsPage
          countryCodes={currentCountryCodes}
          onNavigateToDetail={(id) => handleNavigate("detail", id)}
        />
      )}

      {currentPage === "actor-results" && (
        <ActorResultsPage actorIds={currentActorIds} onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      )}

      {currentPage === "actors" && (
        <ActorsPage
          onNavigateToActorResults={handleNavigateToActorResults}
          onNavigateToDetail={(id) => handleNavigate("detail", id)}
        />
      )}

      {currentPage === "movies" && <MoviesPage onNavigateToDetail={(id) => handleNavigate("detail", id)} />}

      {currentPage === "series" && <SeriesPage onNavigateToDetail={(id) => handleNavigate("detail", id)} />}

      {currentPage === "animation" && <AnimationPage onNavigateToDetail={(id) => handleNavigate("detail", id)} />}
    </div>
  )
}

export default App



