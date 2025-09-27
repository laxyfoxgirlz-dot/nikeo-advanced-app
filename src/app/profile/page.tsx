'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Edit, Grid, Heart, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { VideoPlayer } from '@/components/video-player'
import { Sidebar } from '@/components/sidebar'
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

interface User {
  id: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  verified: boolean
  followersCount: number
  followingCount: number
  likesCount: number
}

export function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [activeTab, setActiveTab] = useState('videos')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    username: ''
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Mock user data - replace with API call
    const mockUser: User = {
      id: session.user.id,
      username: session.user.username || 'user',
      name: session.user.name || '',
      bio: 'Welcome to my profile! 🎥✨',
      avatar: session.user.avatar || '',
      verified: session.user.verified || false,
      followersCount: 0, // Start with 0 followers
      followingCount: 0, // Start with 0 following
      likesCount: 0 // Start with 0 likes
    }
    setUser(mockUser)

    // Start with empty videos array
    setVideos([])

    setEditForm({
      name: mockUser.name || '',
      bio: mockUser.bio || '',
      username: mockUser.username
    })
  }, [session, status, router])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      // Mock API call - replace with actual API
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editForm)
      // })

      setUser({
        ...user,
        name: editForm.name,
        bio: editForm.bio,
        username: editForm.username
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
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

  if (status === 'loading' || !user) {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">@{user.username}</div>
              {user.verified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Profile Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Profile Info */}
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
                  {user.verified && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm text-white">✓</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-800"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNumber(user.followersCount)}</div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNumber(user.followingCount)}</div>
                    <div className="text-sm text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNumber(user.likesCount)}</div>
                    <div className="text-sm text-gray-400">Likes</div>
                  </div>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                    />
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Username"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Bio"
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-gray-600 text-white hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-200">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === 'videos' 
                    ? 'text-white border-b-2 border-red-600' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4 inline mr-2" />
                Videos
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === 'liked' 
                    ? 'text-white border-b-2 border-red-600' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Liked
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  {videos.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No videos yet</p>
                      <p className="text-sm mb-4">Create your first video to get started!</p>
                      <button 
                        onClick={() => {
                          const createButton = document.querySelector('[data-tab="create"]')
                          if (createButton) {
                            (createButton as HTMLButtonElement).click()
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm"
                      >
                        Create Video
                      </button>
                    </div>
                  ) : (
                    videos.map((video) => (
                      <Card key={video.id} className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-2xl">🎥</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{video.title}</h3>
                              <p className="text-sm text-gray-400 mb-2">{video.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>{formatNumber(video.views)} views</span>
                                <span>•</span>
                                <span>{formatNumber(video.likesCount)} likes</span>
                                <span>•</span>
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'liked' && (
                <div className="text-center py-12 text-gray-400">
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No liked videos yet</p>
                  <p className="text-sm">Like videos to see them here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export as both default and named export for compatibility
export default Profile
export { Profile as ProfileComponent }