import { useState } from "react"
import { Header } from "./components/Header"
import { HomePage } from "./pages/HomePage"
import { DetailPage } from "./pages/DetailPage"
import "./App.css"
function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "detail">("home")
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null)

  const handleNavigate = (page: "home" | "detail", id?: string) => {
    setCurrentPage(page)
    setCurrentDetailId(id || null)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={handleNavigate} />
      {currentPage === "home" ? (
        <HomePage onNavigateToDetail={(id) => handleNavigate("detail", id)} />
      ) : (
        <DetailPage
            id={currentDetailId}
            onNavigateToDetail={(id) => handleNavigate("detail", id)}
          />
      )}
    </div>
  )
}

export default App
