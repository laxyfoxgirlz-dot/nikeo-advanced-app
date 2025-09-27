import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id

    const comments = await db.comment.findMany({
      where: {
        videoId,
        parentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                verified: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { content, parentId } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Comment content is required' }, { status: 400 })
    }

    // If parentId is provided, check if it exists
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId }
      })

      if (!parentComment) {
        return NextResponse.json({ message: 'Parent comment not found' }, { status: 404 })
      }
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        userId,
        videoId,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true
          }
        }
      }
    })

    // Update video comments count
    await db.video.update({
      where: { id: videoId },
      data: {
        commentsCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}