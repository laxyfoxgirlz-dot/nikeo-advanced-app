import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const likedVideos = await db.like.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            videoUrl: true,
            thumbnail: true,
            views: true,
            likesCount: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                verified: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to return just the videos
    const videos = likedVideos.map(like => like.video)

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Get liked videos error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}