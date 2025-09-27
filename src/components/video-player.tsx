'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, MessageCircle, Heart, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/use-socket'
import { FollowButton } from '@/components/follow-button'

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

interface VideoPlayerProps {
  video: Video
  isActive: boolean
}

export function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [viewCounted, setViewCounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeout = useRef<NodeJS.Timeout>()
  const { data: session } = useSession()
  const { joinVideoRoom, leaveVideoRoom, sendTypingIndicator } = useSocket()

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      joinVideoRoom(video.id)
      
      // Count view when video becomes active
      if (!viewCounted) {
        // Simulate view count - in real app, this would call an API
        setViewCounted(true)
      }
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      leaveVideoRoom(video.id)
    }
  }, [isActive, video.id, joinVideoRoom, leaveVideoRoom, viewCounted])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100)
    }

    video.addEventListener('timeupdate', updateProgress)
    return () => video.removeEventListener('timeupdate', updateProgress)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoClick = () => {
    togglePlay()
    resetControlsTimeout()
  }

  const resetControlsTimeout = () => {
    setShowControls(true)
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        onClick={handleVideoClick}
        onMouseMove={resetControlsTimeout}
        loop
        muted={isMuted}
        playsInline
      />

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={video.author.avatar} alt={video.author.username} />
            <AvatarFallback>{video.author.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">@{video.author.username}</span>
              {video.author.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
              {/* Online status indicator - only show if user exists */}
              {video.author && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-300">{video.author.name}</p>
          </div>
          <FollowButton userId={video.author.id} username={video.author.username} />
        </div>

        <div className="mb-3">
          <h3 className="font-semibold mb-1">{video.title}</h3>
          {video.description && (
            <p className="text-sm text-gray-300">{video.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span>{formatViews(video.views)} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
        <div 
          className="h-full bg-red-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Live Viewers Count */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-white">Live</span>
        <span className="text-xs text-white">1.2K watching</span>
      </div>
    </div>
  )
}