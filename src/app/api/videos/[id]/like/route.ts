import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const videoId = params.id
    const userId = session.user.id

    // Check if user already liked the video
    const existingLike = await db.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    })

    if (existingLike) {
      // Unlike the video
      await db.like.delete({
        where: {
          id: existingLike.id
        }
      })

      // Update video likes count
      await db.video.update({
        where: { id: videoId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      // Update user likes count
      await db.user.update({
        where: { id: userId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Video unliked',
        liked: false,
        likesCount: Math.max(0, (existingLike.video?.likesCount || 0) - 1)
      })
    } else {
      // Like the video
      const like = await db.like.create({
        data: {
          userId,
          videoId
        }
      })

      // Update video likes count
      await db.video.update({
        where: { id: videoId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      // Update user likes count
      await db.user.update({
        where: { id: userId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Video liked',
        liked: true,
        likesCount: (like.video?.likesCount || 0) + 1
      })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}