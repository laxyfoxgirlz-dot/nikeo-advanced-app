'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a video file.",
          variant: "destructive"
        })
      }
    }
  }

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file)
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
    
    if (!videoFile) {
      toast({
        title: "No video selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create FormData for upload
      const formData = new FormData()
      formData.append('video', videoFile)
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile)
      }
      formData.append('title', title)
      formData.append('description', description)
      formData.append('tags', tags)

      // Simulate API call (replace with actual upload)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      setVideoFile(null)
      setThumbnailFile(null)
      setTitle('')
      setDescription('')
      setTags('')
      
      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded and is being processed.",
      })

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive"
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Video File</Label>
            <Card 
              className="border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
              onClick={() => videoInputRef.current?.click()}
            >
              <CardContent className="p-8 text-center">
                {videoFile ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{videoFile.name}</p>
                      <p className="text-sm text-gray-400">{formatFileSize(videoFile.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload video</p>
                      <p className="text-sm text-gray-400">MP4, WebM, or MOV (max 100MB)</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Thumbnail Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Thumbnail (Optional)</Label>
            <Card 
              className="border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <CardContent className="p-6 text-center">
                {thumbnailFile ? (
                  <div className="space-y-2">
                    <div className="w-32 h-20 bg-gray-700 rounded-lg mx-auto overflow-hidden">
                      <img 
                        src={URL.createObjectURL(thumbnailFile)} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm">{thumbnailFile.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">Click to upload thumbnail</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
          </div>

          {/* Video Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/100 characters</p>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/500 characters</p>
            </div>

            <div>
              <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uploading...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !videoFile || !title.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}