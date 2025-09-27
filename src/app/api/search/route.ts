import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // 'all', 'users', 'videos'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        message: 'Query must be at least 2 characters long',
        results: { users: [], videos: [] },
        pagination: { page, limit, total: 0, totalPages: 0 }
      }, { status: 400 })
    }

    const searchQuery = query.trim()
    const results = { users: [], videos: [] }
    let total = 0

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await db.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              name: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          verified: true,
          followersCount: true,
          followingCount: true,
          bio: true
        },
        orderBy: [
          { followersCount: 'desc' },
          { username: 'asc' }
        ],
        skip: type === 'users' ? offset : 0,
        take: type === 'users' ? limit : 5 // Limit to 5 users when searching 'all'
      })

      results.users = users
    }

    // Search videos
    if (type === 'all' || type === 'videos') {
      const videos = await db.video.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              tags: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ],
          isPublic: true
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true
            }
          }
        },
        orderBy: [
          { views: 'desc' },
          { likesCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: type === 'videos' ? offset : 0,
        take: type === 'videos' ? limit : 10 // Limit to 10 videos when searching 'all'
      })

      results.videos = videos
    }

    // Calculate total based on search type
    if (type === 'users') {
      total = await db.user.count({
        where: {
          OR: [
            {
              username: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              name: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ]
        }
      })
    } else if (type === 'videos') {
      total = await db.video.count({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              tags: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ],
          isPublic: true
        }
      })
    } else {
      // For 'all' type, calculate total as sum of both
      const userCount = await db.user.count({
        where: {
          OR: [
            {
              username: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              name: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ]
        }
      })
      const videoCount = await db.video.count({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              tags: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ],
          isPublic: true
        }
      })
      total = userCount + videoCount
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      query: searchQuery,
      type,
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}