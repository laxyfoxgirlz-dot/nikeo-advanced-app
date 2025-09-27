'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { CommentsModal } from '@/components/comments-modal'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

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

interface SidebarProps {
  video?: Video
}

export function Sidebar({ video }: SidebarProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video?.likesCount || 0)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like videos.",
        variant: "destructive"
      })
      return
    }

    setIsLiking(true)
    try {
      const response = await fetch(`/api/videos/${video?.id}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        toast({
          title: "Failed to like video",
          description: "Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like video. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title,
          text: video?.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Video link has been copied to clipboard.",
        })
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Video link has been copied to clipboard.",
      })
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  if (!video) {
    return (
      <div className="w-20 md:w-24 flex flex-col items-center gap-6 py-8">
        {/* Empty state - no video */}
      </div>
    )
  }

  return (
    <>
      <div className="w-20 md:w-24 flex flex-col items-center gap-6 py-8">
        {/* Author Avatar */}
        <div className="relative group">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={video.author.avatar} alt={video.author.username} />
            <AvatarFallback>{video.author.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-black">
            <span className="text-xs text-white">+</span>
          </div>
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="lg"
            className={`w-12 h-12 rounded-full ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-white hover:text-gray-300'}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-xs text-white">{formatNumber(likesCount)}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="lg"
            className="w-12 h-12 rounded-full text-white hover:text-gray-300"
            onClick={() => setIsCommentsModalOpen(true)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <span className="text-xs text-white">{formatNumber(video.commentsCount)}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="lg"
            className="w-12 h-12 rounded-full text-white hover:text-gray-300"
            onClick={handleShare}
          >
            <Share className="w-6 h-6" />
          </Button>
          <span className="text-xs text-white">{formatNumber(video.sharesCount)}</span>
        </div>

        {/* More Options */}
        <Button
          variant="ghost"
          size="lg"
          className="w-12 h-12 rounded-full text-white hover:text-gray-300"
        >
          <MoreHorizontal className="w-6 h-6" />
        </Button>

        {/* Music/Album Art */}
        <Card className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white animate-spin-slow">
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-xs text-white font-bold">♪</span>
          </div>
        </Card>
      </div>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        videoId={video.id}
        commentsCount={video.commentsCount}
      />
    </>
  )
}