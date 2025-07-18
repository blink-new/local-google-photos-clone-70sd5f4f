import { useState, useRef, useCallback } from 'react'
import { Heart, MoreVertical, Download, Share, Trash2 } from 'lucide-react'
import { Photo } from '../types/photo'
import { formatDate, getRelativeTime } from '../utils/format'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onToggleFavorite: (photoId: string) => void
  onDeletePhoto?: (photoId: string) => void
}

export function PhotoGrid({ photos, onPhotoClick, onToggleFavorite, onDeletePhoto }: PhotoGridProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // Group photos by date
  const groupedPhotos = photos.reduce((groups, photo) => {
    const date = formatDate(photo.uploadedAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(photo)
    return groups
  }, {} as Record<string, Photo[]>)

  const handlePhotoClick = useCallback((photo: Photo, event: React.MouseEvent) => {
    if (isSelectionMode) {
      event.preventDefault()
      togglePhotoSelection(photo.id)
    } else {
      onPhotoClick(photo)
    }
  }, [isSelectionMode, onPhotoClick])

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      
      // Exit selection mode if no photos selected
      if (newSet.size === 0) {
        setIsSelectionMode(false)
      }
      
      return newSet
    })
  }

  const startSelectionMode = (photoId: string) => {
    setIsSelectionMode(true)
    setSelectedPhotos(new Set([photoId]))
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedPhotos(new Set())
  }

  const selectAllPhotos = () => {
    setSelectedPhotos(new Set(photos.map(p => p.id)))
  }

  const downloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = photo.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const sharePhoto = async (photo: Photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.name,
          text: `Check out this photo: ${photo.name}`,
          url: photo.url
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(photo.url)
    }
  }

  if (photos.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Selection toolbar */}
      {isSelectionMode && (
        <div className="sticky top-20 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mx-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedPhotos.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllPhotos}
              >
                Select all
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedPhotos.forEach(photoId => onToggleFavorite(photoId))
                }}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  for (const photoId of selectedPhotos) {
                    const photo = photos.find(p => p.id === photoId)
                    if (photo) await downloadPhoto(photo)
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              {onDeletePhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedPhotos.forEach(photoId => onDeletePhoto(photoId))
                    exitSelectionMode()
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={exitSelectionMode}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      <div ref={gridRef} className="space-y-8">
        {Object.entries(groupedPhotos)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, datePhotos]) => (
            <div key={date} className="space-y-4">
              {/* Date header */}
              <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-sm py-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {date}
                </h2>
                <p className="text-sm text-gray-500">
                  {datePhotos.length} {datePhotos.length === 1 ? 'photo' : 'photos'}
                </p>
              </div>

              {/* Photos grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {datePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={(e) => handlePhotoClick(photo, e)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      if (!isSelectionMode) {
                        startSelectionMode(photo.id)
                      }
                    }}
                  >
                    {/* Selection checkbox */}
                    {isSelectionMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPhotos.has(photo.id)
                              ? 'bg-primary border-primary'
                              : 'bg-white/80 border-white/80'
                          }`}
                        >
                          {selectedPhotos.has(photo.id) && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photo */}
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-1">
                        {/* Favorite button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-700 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(photo.id)
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              photo.isFavorite ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </Button>

                        {/* More actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => downloadPhoto(photo)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sharePhoto(photo)}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onToggleFavorite(photo.id)}
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              {photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            </DropdownMenuItem>
                            {onDeletePhoto && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDeletePhoto(photo.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Photo info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-xs font-medium truncate">
                        {photo.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {getRelativeTime(photo.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}