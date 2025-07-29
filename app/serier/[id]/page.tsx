import { Header } from "./components/header"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EpisodeList } from "@/components/episode-list"
import { ContentCard } from "@/components/content-card"
import { CommentsSection } from "@/components/comments-section"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function SeriesDetailPage() {
  const dummySeasons = [
    {
      id: "season-1",
      title: "Season 1",
      episodes: [
        { id: "ep1", title: "Episode 1: Freedom Day", duration: "58m" },
        { id: "ep2", title: "Episode 2: Holston's Desk", duration: "55m" },
        { id: "ep3", title: "Episode 3: Machines", duration: "50m" },
        { id: "ep4", title: "Episode 4: Truth", duration: "52m" },
        { id: "ep5", title: "Episode 5: The Flamekeepers", duration: "56m" },
        { id: "ep6", title: "Episode 6: The Relic", duration: "54m" },
        { id: "ep7", title: "Episode 7: The Flamekeepers", duration: "56m" },
        { id: "ep8", title: "Episode 8: The Relic", duration: "54m" },
      ],
    },
    {
      id: "season-2",
      title: "Season 2",
      episodes: [
        { id: "ep9", title: "Episode 1: New Beginnings", duration: "60m" },
        { id: "ep10", title: "Episode 2: Underground Secrets", duration: "57m" },
      ],
    },
  ]

  const dummyRecommended = [
    {
      title: "Black Knight",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "Season 1",
      type: "series",
      href: "/series/1",
    },
    {
      title: "Drops of God",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "Season 1",
      type: "series",
      href: "/series/1",
    },
    {
      title: "Scoop",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "2h 10m | 4/21/23",
      type: "movie",
      href: "/series/1",
    },
    {
      title: "Prank Panel",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "Season 1",
      type: "series",
      href: "/series/1",
    },
    {
      title: "From",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "Season 2",
      type: "series",
      href: "/series/1",
    },
    {
      title: "Spy/Master",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "Season 1",
      type: "series",
      href: "/series/1",
    },
    {
      title: "White Bird",
      imageUrl: "/placeholder.svg?height=350&width=250",
      releaseInfo: "1h 50m | 8/25/23",
      type: "movie",
      href: "/series/1",
    },
  ]

  const dummyComments = [
    {
      id: "c1",
      author: "Alice",
      avatarUrl: "/placeholder-user.jpg",
      timestamp: "2 hours ago",
      content: "This series is absolutely mind-blowing! The plot twists keep you on the edge of your seat.",
      likes: 12,
    },
    {
      id: "c2",
      author: "Bob",
      avatarUrl: "/placeholder-user.jpg",
      timestamp: "1 day ago",
      content: "I love the concept, but the pacing felt a bit slow in the middle. Still, a great watch!",
      likes: 8,
    },
    {
      id: "c3",
      author: "Charlie",
      avatarUrl: "/placeholder-user.jpg",
      timestamp: "3 days ago",
      content: "The acting is superb, especially the lead actress. Can't wait for the next season!",
      likes: 25,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="p-4 md:p-6 lg:p-8">
        {/* Video Player Section */}
        <section className="w-full max-w-6xl mx-auto mb-8">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video controls className="w-full h-full object-cover">
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Series Details Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          <div className="lg:col-span-1 flex justify-center lg:justify-start">
            <Image
              src="/placeholder.svg?height=600&width=400"
              alt="Silo Poster"
              width={400}
              height={600}
              className="rounded-lg object-cover shadow-lg w-full max-w-[300px] lg:max-w-full"
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold">Silo</h1>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                <Heart className="w-7 h-7 fill-red-500" />
                <span className="sr-only">Add to favorites</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-700 text-white">
                Drama
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-white">
                Sci-Fi
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-white">
                Mystery
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <span>8.1</span>
              <span>•</span>
              <span>2023</span>
              <span>•</span>
              <span>TV-MA</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              In a ruined and toxic future, a community exists in a giant underground silo that plunges hundreds of
              stories deep. There, men and women live in a society full of regulations they believe are meant to protect
              them.
            </p>
            <Separator className="bg-gray-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
              <div>
                <p>
                  <span className="font-semibold">Country:</span> USA
                </p>
                <p>
                  <span className="font-semibold">Director:</span> Morten Tyldum
                </p>
                <p>
                  <span className="font-semibold">Cast:</span> Rebecca Ferguson, Common, Harriet Walter
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Release Date:</span> May 5, 2023
                </p>
                <p>
                  <span className="font-semibold">Genre:</span> Drama, Sci-Fi, Mystery
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Episode List Section */}
        <section className="max-w-6xl mx-auto mb-12">
          <EpisodeList seasons={dummySeasons} />
        </section>

        {/* You May Also Like Section */}
        <section className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">You May Also Like</h2>
            <Link href="#" className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {dummyRecommended.map((item, index) => (
              <ContentCard key={index} {...item} />
            ))}
          </div>
        </section>

        {/* Comments Section */}
        <section className="max-w-6xl mx-auto">
          <CommentsSection comments={dummyComments} />
        </section>
      </main>
    </div>
  )
}
