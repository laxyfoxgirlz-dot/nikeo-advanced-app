import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get videos with pagination
    const videos = await db.video.findMany({
      where: {
        isPublic: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    })

    // Get total count for pagination
    const total = await db.video.count({
      where: {
        isPublic: true,
      },
    })

    // Transform the data to match the expected format
    const transformedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      duration: video.duration,
      views: video.views,
      likesCount: video.likesCount,
      commentsCount: video.commentsCount,
      sharesCount: video.sharesCount,
      createdAt: video.createdAt.toISOString(),
      author: {
        id: video.author.id,
        username: video.author.username,
        name: video.author.name,
        avatar: video.author.avatar,
        verified: video.author.verified,
      },
      tags: video.tags ? JSON.parse(video.tags) : [],
    }))

    return NextResponse.json({
      videos: transformedVideos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}