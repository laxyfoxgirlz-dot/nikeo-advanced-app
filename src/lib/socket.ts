import { Server } from 'socket.io';

interface User {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
}

interface LikeNotification {
  type: 'like';
  videoId: string;
  videoTitle: string;
  userId: string;
  username: string;
  avatar?: string;
  timestamp: string;
}

interface CommentNotification {
  type: 'comment';
  videoId: string;
  videoTitle: string;
  userId: string;
  username: string;
  avatar?: string;
  comment: string;
  timestamp: string;
}

interface FollowNotification {
  type: 'follow';
  userId: string;
  username: string;
  avatar?: string;
  timestamp: string;
}

type Notification = LikeNotification | CommentNotification | FollowNotification;

export const setupSocket = (io: Server) => {
  // Store online users
  const onlineUsers = new Map<string, User>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (user: User) => {
      onlineUsers.set(socket.id, user);
      socket.emit('authenticated', { success: true });
      
      // Notify other users that this user is online
      socket.broadcast.emit('userOnline', {
        userId: user.id,
        username: user.username,
        avatar: user.avatar
      });
    });

    // Handle like notifications
    socket.on('likeVideo', (data: {
      videoId: string;
      videoTitle: string;
      targetUserId: string;
    }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      const notification: LikeNotification = {
        type: 'like',
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        timestamp: new Date().toISOString()
      };

      // Send notification to the video owner
      io.emit(`notification:${data.targetUserId}`, notification);
    });

    // Handle comment notifications
    socket.on('commentVideo', (data: {
      videoId: string;
      videoTitle: string;
      targetUserId: string;
      comment: string;
    }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      const notification: CommentNotification = {
        type: 'comment',
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        comment: data.comment,
        timestamp: new Date().toISOString()
      };

      // Send notification to the video owner
      io.emit(`notification:${data.targetUserId}`, notification);
    });

    // Handle follow notifications
    socket.on('followUser', (data: {
      targetUserId: string;
    }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      const notification: FollowNotification = {
        type: 'follow',
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        timestamp: new Date().toISOString()
      };

      // Send notification to the target user
      io.emit(`notification:${data.targetUserId}`, notification);
    });

    // Handle real-time view count updates
    socket.on('viewVideo', (data: { videoId: string }) => {
      // Broadcast view count update to all clients
      socket.broadcast.emit('viewUpdate', {
        videoId: data.videoId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle real-time like count updates
    socket.on('updateLikes', (data: { videoId: string; likesCount: number }) => {
      // Broadcast like count update to all clients
      socket.broadcast.emit('likesUpdate', {
        videoId: data.videoId,
        likesCount: data.likesCount,
        timestamp: new Date().toISOString()
      });
    });

    // Handle joining video rooms for real-time updates
    socket.on('joinVideoRoom', (videoId: string) => {
      socket.join(`video:${videoId}`);
      console.log(`User ${socket.id} joined video room: ${videoId}`);
    });

    // Handle leaving video rooms
    socket.on('leaveVideoRoom', (videoId: string) => {
      socket.leave(`video:${videoId}`);
      console.log(`User ${socket.id} left video room: ${videoId}`);
    });

    // Handle typing indicators for comments
    socket.on('typing', (data: { videoId: string; isTyping: boolean }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      socket.to(`video:${data.videoId}`).emit('userTyping', {
        userId: user.id,
        username: user.username,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      const user = onlineUsers.get(socket.id);
      if (user) {
        onlineUsers.delete(socket.id);
        
        // Notify other users that this user is offline
        socket.broadcast.emit('userOffline', {
          userId: user.id,
          username: user.username
        });
      }
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to NIKEO Real-time Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};