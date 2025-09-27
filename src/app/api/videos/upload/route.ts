import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    
    const videoFile = formData.get('video') as File
    const thumbnailFile = formData.get('thumbnail') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string

    // Validate required fields
    if (!videoFile || !title) {
      return NextResponse.json({ 
        error: 'Video file and title are required' 
      }, { status: 400 })
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a video file.' 
      }, { status: 400 })
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 100MB.' 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const videosDir = path.join(uploadDir, 'videos')
    const thumbnailsDir = path.join(uploadDir, 'thumbnails')

    try {
      await writeFile(path.join(uploadDir, '.gitkeep'), '')
      await writeFile(path.join(videosDir, '.gitkeep'), '')
      await writeFile(path.join(thumbnailsDir, '.gitkeep'), '')
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filenames
    const videoId = uuidv4()
    const videoExtension = videoFile.name.split('.').pop()
    const videoFileName = `${videoId}.${videoExtension}`
    const videoPath = path.join(videosDir, videoFileName)

    // Save video file
    const videoBytes = await videoFile.arrayBuffer()
    await writeFile(videoPath, Buffer.from(videoBytes))

    // Handle thumbnail upload
    let thumbnailUrl = null
    if (thumbnailFile) {
      if (!thumbnailFile.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: 'Invalid thumbnail file type. Please upload an image file.' 
        }, { status: 400 })
      }

      const thumbnailExtension = thumbnailFile.name.split('.').pop()
      const thumbnailFileName = `${videoId}.${thumbnailExtension}`
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName)

      const thumbnailBytes = await thumbnailFile.arrayBuffer()
      await writeFile(thumbnailPath, Buffer.from(thumbnailBytes))
      
      thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`
    }

    // Parse tags
    let parsedTags = []
    if (tags) {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }

    // Create video record in database
    const video = await db.video.create({
      data: {
        title,
        description: description || null,
        videoUrl: `/uploads/videos/${videoFileName}`,
        thumbnail: thumbnailUrl,
        duration: 0, // TODO: Implement video duration detection
        authorId: user.id,
        tags: parsedTags.length > 0 ? JSON.stringify(parsedTags) : null,
      }
    })

    // Update user's video count
    await db.user.update({
      where: { id: user.id },
      data: {
        // You might want to add a videosCount field to the User model
      }
    })

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnail: video.thumbnail,
        duration: video.duration,
        views: video.views,
        likesCount: video.likesCount,
        commentsCount: video.commentsCount,
        tags: video.tags ? JSON.parse(video.tags) : [],
        createdAt: video.createdAt,
        author: {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          verified: user.verified
        }
      }
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload video. Please try again.' 
    }, { status: 500 })
  }
}