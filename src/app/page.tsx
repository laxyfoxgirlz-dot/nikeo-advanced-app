'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { VideoPlayer } from '@/components/video-player'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { ProfileComponent } from '@/app/profile/page'

interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnail?: string
  duration: number
  views: number
  likesCount: number
  commentsCount: number
  sharesCount: number
  createdAt: string
  author: {
    id: string
    username: string
    name?: string
    avatar?: string
    verified: boolean
  }
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('home')
  const videoRefs = useRef<(HTMLDivElement | null)[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Start with empty videos array - no content yet
    setVideos([])
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = videoRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setCurrentVideoIndex(index)
            }
          }
        })
      },
      { threshold: 0.7 }
    )

    videoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      videoRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [videos])

  // Handle tab changes
  useEffect(() => {
    if (activeTab === 'profile' && session) {
      router.push('/profile')
    }
  }, [activeTab, session, router])

  // If we're on profile tab, show the profile page
  if (activeTab === 'profile') {
    return <ProfileComponent />
  }

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex">
        <div className="flex-1 relative overflow-hidden">
          <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
            {videos.length === 0 ? (
              <div className="h-screen snap-start flex items-center justify-center relative">
                <div className="text-center space-y-6">
                  <div className="text-6xl">🎥</div>
                  <h1 className="text-2xl font-bold text-white">Welcome to NIKEO Advanced</h1>
                  <p className="text-gray-400 max-w-md mx-auto">
                    No videos yet. Be the first to create and share amazing content with the world!
                  </p>
                  <button 
                    onClick={() => {
                      const createButton = document.querySelector('[data-tab="create"]')
                      if (createButton) {
                        (createButton as HTMLButtonElement).click()
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    Create Your First Video
                  </button>
                </div>
              </div>
            ) : (
              videos.map((video, index) => (
                <div
                  key={video.id}
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="h-screen snap-start flex items-center justify-center relative"
                >
                  <VideoPlayer
                    video={video}
                    isActive={index === currentVideoIndex}
                  />
                </div>
              ))
            )}
          </div>
        </div>
        
        <Sidebar video={videos[currentVideoIndex]} />
      </div>
    </div>
  )
}