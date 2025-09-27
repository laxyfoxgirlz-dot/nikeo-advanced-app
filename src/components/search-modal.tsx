'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Users, Video, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  users: Array<{
    id: string
    username: string
    name?: string
    avatar?: string
    verified: boolean
    followersCount: number
    followingCount: number
    bio?: string
  }>
  videos: Array<{
    id: string
    title: string
    description?: string
    thumbnail?: string
    duration: number
    views: number
    likesCount: number
    createdAt: string
    author: {
      id: string
      username: string
      name?: string
      avatar?: string
      verified: boolean
    }
  }>
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'users' | 'videos'>('all')
  const [results, setResults] = useState<SearchResult>({ users: [], videos: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Mock trending searches
      setTrendingSearches([
        'dance',
        'comedy',
        'cooking',
        'fitness',
        'music',
        'gaming',
        'travel',
        'art'
      ])
      
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      } else {
        setResults({ users: [], videos: [] })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchType])

  const performSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type: searchType
      })
      
      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTrendingClick = (trendingQuery: string) => {
    setQuery(trendingQuery)
    setSearchType('videos')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, videos, and more..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                onClick={() => setQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Type Filters */}
          <div className="flex gap-2">
            <Button
              variant={searchType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('all')}
              className={searchType === 'all' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600 text-white hover:bg-gray-800'}
            >
              All
            </Button>
            <Button
              variant={searchType === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('users')}
              className={searchType === 'users' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600 text-white hover:bg-gray-800'}
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
            <Button
              variant={searchType === 'videos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('videos')}
              className={searchType === 'videos' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600 text-white hover:bg-gray-800'}
            >
              <Video className="w-4 h-4 mr-2" />
              Videos
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query.trim().length >= 2 && (
            <div className="space-y-6">
              {/* Users Results */}
              {(searchType === 'all' || searchType === 'users') && results.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Users
                  </h3>
                  <div className="space-y-3">
                    {results.users.map((user) => (
                      <Card key={user.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">@{user.username}</span>
                                {user.verified && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white">✓</span>
                                  </div>
                                )}
                              </div>
                              {user.name && (
                                <p className="text-sm text-gray-300">{user.name}</p>
                              )}
                              {user.bio && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{user.bio}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                <span>{formatNumber(user.followersCount)} followers</span>
                                <span>•</span>
                                <span>{formatNumber(user.followingCount)} following</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Results */}
              {(searchType === 'all' || searchType === 'videos') && results.videos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Videos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.videos.map((video) => (
                      <Card key={video.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="w-24 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-lg">🎥</span>
                              </div>
                              <div className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-xs">
                                {formatTime(video.duration)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                              <div className="flex items-center gap-1 mb-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={video.author.avatar} alt={video.author.username} />
                                  <AvatarFallback className="text-xs">{video.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-300 truncate">@{video.author.username}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{formatNumber(video.views)} views</span>
                                <span>•</span>
                                <span>{formatNumber(video.likesCount)} likes</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!isLoading && results.users.length === 0 && results.videos.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm">Try different keywords or check your spelling</p>
                </div>
              )}
            </div>
          )}

          {/* Trending Searches */}
          {!query && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trending, index) => (
                  <Badge
                    key={trending}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleTrendingClick(trending)}
                  >
                    #{index + 1} {trending}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}