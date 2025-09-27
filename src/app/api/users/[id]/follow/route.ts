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

    const followerId = session.user.id
    const followingId = params.id

    // Don't allow following yourself
    if (followerId === followingId) {
      return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: {
          id: existingFollow.id
        }
      })

      // Update follower counts
      await db.user.update({
        where: { id: followingId },
        data: {
          followersCount: {
            decrement: 1
          }
        }
      })

      await db.user.update({
        where: { id: followerId },
        data: {
          followingCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Unfollowed successfully',
        following: false,
        followersCount: Math.max(0, (existingFollow.following?.followersCount || 0) - 1)
      })
    } else {
      // Follow
      const follow = await db.follow.create({
        data: {
          followerId,
          followingId
        }
      })

      // Update follower counts
      await db.user.update({
        where: { id: followingId },
        data: {
          followersCount: {
            increment: 1
          }
        }
      })

      await db.user.update({
        where: { id: followerId },
        data: {
          followingCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Followed successfully',
        following: true,
        followersCount: (follow.following?.followersCount || 0) + 1
      })
    }
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}