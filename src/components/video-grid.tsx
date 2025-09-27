'use client'

import { useState } from 'react'
import { Play, Heart, MessageCircle, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Video {
  id: string
  title: string
  videoUrl: string
  thumbnail?: string
  views: number
  likesCount: number
  createdAt: string
  author?: {
    id: string
    username: string
    name?: string
    avatar?: string
    verified: boolean
  }
}

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="group bg-gray-900 border-gray-800 overflow-hidden cursor-pointer hover:border-gray-600 transition-all duration-200"
          onMouseEnter={() => setHoveredVideo(video.id)}
          onMouseLeave={() => setHoveredVideo(null)}
          onClick={() => {
            // Navigate to video player or open in modal
            window.location.href = `/?video=${video.id}`
          }}
        >
          <CardContent className="p-0">
            {/* Video Thumbnail */}
            <div className="relative aspect-[9/16] bg-gray-800 overflow-hidden">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-4xl">♪</span>
                </div>
              )}
              
              {/* Play Overlay */}
              {hoveredVideo === video.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Video Stats Overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div className="flex items-center gap-2 text-white text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatNumber(video.views)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{formatNumber(video.likesCount)}</span>
                  </div>
                </div>
                <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                  {formatTimeAgo(video.createdAt)}
                </span>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-white">
                {video.title}
              </h3>
              
              {video.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={video.author.avatar} alt={video.author.username} />
                    <AvatarFallback className="text-xs">
                      {video.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-300">
                      @{video.author.username}
                    </span>
                    {video.author.verified && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}