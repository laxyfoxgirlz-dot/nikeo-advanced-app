'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UploadModal } from '@/components/upload-modal'
import { SearchModal } from '@/components/search-modal'

interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const { data: session, status } = useSession()

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'inbox', icon: MessageSquare, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  const handleCreateClick = () => {
    if (status === 'authenticated') {
      setIsUploadModalOpen(true)
    } else {
      signIn()
    }
  }

  const handleProfileClick = () => {
    if (status === 'authenticated') {
      onTabChange('profile')
    } else {
      signIn()
    }
  }

  const handleSearchClick = () => {
    setIsSearchModalOpen(true)
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              NIKEO
            </div>
            <span className="text-xs text-gray-400">advanced</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => {
                    onTabChange(item.id)
                    if (item.id === 'create') {
                      handleCreateClick()
                    } else if (item.id === 'profile') {
                      handleProfileClick()
                    } else if (item.id === 'search') {
                      handleSearchClick()
                    }
                  }}
                  data-tab={item.id}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              )
            })}
          </div>

          {/* User Profile / Auth */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={handleSearchClick}
            >
              <Search className="w-5 h-5" />
            </Button>
            
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 cursor-pointer" onClick={handleProfileClick}>
                  <AvatarImage src={session.user.avatar || ''} alt={session.user.name || 'User'} />
                  <AvatarFallback>{(session.user.name || session.user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white text-xs"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white text-xs"
                  onClick={() => signIn()}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800 text-xs bg-black text-white"
                  onClick={() => window.location.href = '/auth/signup'}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  )
}