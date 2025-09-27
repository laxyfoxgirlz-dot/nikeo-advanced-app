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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        verified: true,
        followersCount: true,
        followingCount: true,
        likesCount: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const username = formData.get('username') as string
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatar = formData.get('avatar') as File | null

    // Check if username is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        username: username,
        NOT: {
          id: session.user.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 400 })
    }

    // Update user data
    const updateData: any = {
      username,
      name: name || null,
      bio: bio || null
    }

    // Handle avatar upload (in a real app, you'd upload to cloud storage)
    if (avatar) {
      // For demo purposes, we'll just store the filename
      // In production, you'd upload to S3 or similar and store the URL
      updateData.avatar = `avatar-${session.user.id}-${Date.now()}`
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        verified: true,
        followersCount: true,
        followingCount: true,
        likesCount: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}