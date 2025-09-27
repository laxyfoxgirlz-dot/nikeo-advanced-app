'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSocket } from '@/hooks/use-socket'

interface FollowButtonProps {
  userId: string
  username: string
  className?: string
}

export function FollowButton({ userId, username, className = '' }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const { data: session } = useSession()
  const { toast } = useToast()
  const { sendFollowNotification } = useSocket()

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users.",
        variant: "destructive"
      })
      return
    }

    // Don't allow following yourself
    if (session.user.id === userId) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own profile.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.following)
        setFollowersCount(data.followersCount)

        // Send real-time follow notification
        if (data.following) {
          sendFollowNotification({ targetUserId: userId })
        }

        toast({
          title: data.following ? `Following @${username}` : `Unfollowed @${username}`,
          description: data.following 
            ? `You will now see their content in your feed.` 
            : `You will no longer see their content in your feed.`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to follow user. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if following on mount
  useState(() => {
    // In a real app, you would fetch the follow status here
    // For now, we'll default to not following
    setIsFollowing(false)
  })

  return (
    <Button
      variant={isFollowing ? "outline" : "secondary"}
      size="sm"
      className={`${isFollowing ? 'border-gray-600 text-white hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700 text-white'} ${className}`}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}