'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface Notification {
  type: 'like' | 'comment' | 'follow'
  videoId?: string
  videoTitle?: string
  userId: string
  username: string
  avatar?: string
  comment?: string
  timestamp: string
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  notifications: Notification[]
  onlineUsers: Map<string, any>
  sendLikeNotification: (data: {
    videoId: string
    videoTitle: string
    targetUserId: string
  }) => void
  sendCommentNotification: (data: {
    videoId: string
    videoTitle: string
    targetUserId: string
    comment: string
  }) => void
  sendFollowNotification: (data: { targetUserId: string }) => void
  joinVideoRoom: (videoId: string) => void
  leaveVideoRoom: (videoId: string) => void
  sendTypingIndicator: (videoId: string, isTyping: boolean) => void
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map())
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (session?.user) {
      // Initialize socket connection
      const socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
        transports: ['websocket', 'polling']
      })

      socketRef.current = socketInstance

      socketInstance.on('connect', () => {
        console.log('Connected to socket server')
        setIsConnected(true)

        // Authenticate with socket server
        socketInstance.emit('authenticate', {
          id: session.user.id,
          username: session.user.username,
          name: session.user.name,
          avatar: session.user.avatar
        })
      })

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server')
        setIsConnected(false)
      })

      // Listen for notifications
      socketInstance.on(`notification:${session.user.id}`, (notification: Notification) => {
        setNotifications(prev => [notification, ...prev])
      })

      // Listen for online users
      socketInstance.on('userOnline', (userData) => {
        setOnlineUsers(prev => new Map(prev).set(userData.userId, userData))
      })

      // Listen for offline users
      socketInstance.on('userOffline', (userData) => {
        setOnlineUsers(prev => {
          const newMap = new Map(prev)
          newMap.delete(userData.userId)
          return newMap
        })
      })

      // Listen for real-time updates
      socketInstance.on('viewUpdate', (data) => {
        console.log('View update:', data)
      })

      socketInstance.on('likesUpdate', (data) => {
        console.log('Likes update:', data)
      })

      // Listen for typing indicators
      socketInstance.on('userTyping', (data) => {
        console.log('User typing:', data)
      })

      setSocket(socketInstance)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [session])

  const sendLikeNotification = (data: {
    videoId: string
    videoTitle: string
    targetUserId: string
  }) => {
    if (socket) {
      socket.emit('likeVideo', data)
    }
  }

  const sendCommentNotification = (data: {
    videoId: string
    videoTitle: string
    targetUserId: string
    comment: string
  }) => {
    if (socket) {
      socket.emit('commentVideo', data)
    }
  }

  const sendFollowNotification = (data: { targetUserId: string }) => {
    if (socket) {
      socket.emit('followUser', data)
    }
  }

  const joinVideoRoom = (videoId: string) => {
    if (socket) {
      socket.emit('joinVideoRoom', videoId)
    }
  }

  const leaveVideoRoom = (videoId: string) => {
    if (socket) {
      socket.emit('leaveVideoRoom', videoId)
    }
  }

  const sendTypingIndicator = (videoId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { videoId, isTyping })
    }
  }

  return {
    socket,
    isConnected,
    notifications,
    onlineUsers,
    sendLikeNotification,
    sendCommentNotification,
    sendFollowNotification,
    joinVideoRoom,
    leaveVideoRoom,
    sendTypingIndicator
  }
}