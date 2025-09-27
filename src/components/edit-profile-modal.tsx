'use client'

import { useState } from 'react'
import { X, Camera, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  verified: boolean
  followersCount: number
  followingCount: number
  likesCount: number
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onUpdate: () => void
}

export function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    name: user.name || '',
    bio: user.bio || '',
    avatar: null as File | null
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, avatar: file })
        setAvatarPreview(URL.createObjectURL(file))
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('username', formData.username)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('bio', formData.bio)
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar)
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        toast({
          title: "Profile updated!",
          description: "Your profile has been updated successfully.",
        })
        onUpdate()
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Update failed",
          description: error.message || "Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-gray-800">
                <AvatarImage src={avatarPreview || ''} alt={user.username} />
                <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-400">Click the camera icon to change your avatar</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-white">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your display name"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/160 characters</p>
            </div>
          </div>

          {/* Stats Display (Read-only) */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-white">Your Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{user.followersCount}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{user.followingCount}</div>
                  <div className="text-xs text-gray-400">Following</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{user.likesCount}</div>
                  <div className="text-xs text-gray-400">Likes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}