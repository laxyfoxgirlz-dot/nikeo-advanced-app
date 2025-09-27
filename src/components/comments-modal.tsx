'use client'

import { useState, useEffect } from 'react'
import { X, Send, Reply, Heart, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    name?: string
    avatar?: string
    verified: boolean
  }
  replies?: Comment[]
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  commentsCount: number
}

export function CommentsModal({ isOpen, onClose, videoId, commentsCount }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments()
    }
  }, [isOpen, videoId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment.",
        variant: "destructive"
      })
      return
    }

    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [comment, ...prev])
        setNewComment('')
        toast({
          title: "Comment added",
          description: "Your comment has been posted.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Failed to add comment",
          description: error.message || "Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReply = async (commentId: string) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply.",
        variant: "destructive"
      })
      return
    }

    if (!replyContent.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: replyContent, 
          parentId: commentId 
        })
      })

      if (response.ok) {
        const reply = await response.json()
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        ))
        setReplyContent('')
        setReplyingTo(null)
        toast({
          title: "Reply added",
          description: "Your reply has been posted.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Failed to add reply",
          description: error.message || "Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Comments ({commentsCount})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Comment */}
          {session && (
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={session.user.avatar || ''} alt={session.user.name || 'User'} />
                <AvatarFallback>{(session.user.name || session.user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <CommentItem 
                    comment={comment} 
                    onReply={() => setReplyingTo(comment.id)}
                    isReplying={replyingTo === comment.id}
                    replyContent={replyContent}
                    onReplyChange={setReplyContent}
                    onReplySubmit={() => handleAddReply(comment.id)}
                    isLoading={isLoading}
                  />
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-12 space-y-3">
                      {comment.replies.map((reply) => (
                        <CommentItem 
                          key={reply.id} 
                          comment={reply} 
                          isReply={true}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="ml-12 flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={session?.user.avatar || ''} alt={session?.user.name || 'User'} />
                        <AvatarFallback>{(session?.user.name || session?.user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyContent.trim() || isLoading}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Reply
                          </Button>
                          <Button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent('')
                            }}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-white hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CommentItemProps {
  comment: Comment
  onReply?: () => void
  isReplying?: boolean
  replyContent?: string
  onReplyChange?: (value: string) => void
  onReplySubmit?: () => void
  isLoading?: boolean
  isReply?: boolean
}

function CommentItem({ 
  comment, 
  onReply, 
  isReplying, 
  replyContent, 
  onReplyChange, 
  onReplySubmit, 
  isLoading,
  isReply = false 
}: CommentItemProps) {
  const { data: session } = useSession()

  return (
    <div className="flex gap-3">
      <Avatar className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
        <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{comment.user.username}</span>
          {comment.user.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">✓</span>
            </div>
          )}
          <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        
        <p className="text-sm text-gray-200 mb-2">{comment.content}</p>
        
        {!isReply && (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white text-xs p-0 h-auto"
              onClick={onReply}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white text-xs p-0 h-auto"
            >
              <Heart className="w-3 h-3 mr-1" />
              Like
            </Button>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white p-1"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  )
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}