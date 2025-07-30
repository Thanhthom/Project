import { useState } from "react"
import { Header } from "./components/Header"
import { HomePage } from "./pages/HomePage"
import { DetailPage } from "./pages/DetailPage"
import { SearchPage } from "./pages/SearchPage"
import { GenreResultsPage } from "./pages/GenreResultsPage" 

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "detail" | "search" | "genre-results">("home") 
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(null)
  const [currentGenreIds, setCurrentGenreIds] = useState<number[] | null>(null) 

  const handleNavigate = (page: "home" | "detail" | "search" | "genre-results", param?: string | number[]) => {
    setCurrentPage(page)
    setCurrentDetailId(null)
    setCurrentSearchQuery(null)
    setCurrentGenreIds(null) 

    if (page === "detail") {
      setCurrentDetailId(param as string)
    } else if (page === "search") {
      setCurrentSearchQuery(param as string)
    } else if (page === "genre-results") {
      setCurrentGenreIds(param as number[])
    }
    console.log(`App.tsx: Navigating to ${page} with param:`, param)
    console.log(
      `App.tsx: Current Page after navigation: ${page}, Detail ID: ${currentDetailId}, Search Query: ${currentSearchQuery}, Genre IDs: ${currentGenreIds}`,
    )
  }

  console.log(
    `App.tsx: Rendering - currentPage: ${currentPage}, currentDetailId: ${currentDetailId}, currentSearchQuery: ${currentSearchQuery}, currentGenreIds: ${currentGenreIds}`,
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        onNavigate={handleNavigate} 
        onGenreChange={(genreIds) => handleNavigate("genre-results", genreIds)} 
      />
      {currentPage === "home" ? (
        <HomePage onNavigateToDetail={(id) => handleNavigate("detail", id)} /> 
      ) : currentPage === "detail" ? (
        <DetailPage id={currentDetailId} onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      ) : currentPage === "search" ? (
        <SearchPage searchQuery={currentSearchQuery} onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      ) : (
        <GenreResultsPage genreIds={currentGenreIds} onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      )}
    </div>
  )
}

export default App

