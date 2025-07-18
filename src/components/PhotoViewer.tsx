import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download, Heart, Share, Info, ZoomIn, ZoomOut } from 'lucide-react'
import { Photo } from '../types/photo'
import { formatFileSize, formatDateTime } from '../utils/format'

interface PhotoViewerProps {
  photo: Photo
  photos: Photo[]
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onToggleFavorite: (photoId: string) => void
}

export function PhotoViewer({ photo, photos, onClose, onNext, onPrevious, onToggleFavorite }: PhotoViewerProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const currentIndex = photos.findIndex(p => p.id === photo.id)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onPrevious()
          break
        case 'ArrowRight':
          onNext()
          break
        case 'i':
        case 'I':
          setShowInfo(!showInfo)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrevious, showInfo])

  // Reset zoom and position when photo changes
  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [photo.id])

  if (!photo) return null

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const downloadPhoto = () => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const sharePhoto = async () => {
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
      navigator.clipboard.writeText(photo.url)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium truncate max-w-md">{photo.name}</h2>
            <span className="text-sm opacity-75">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Photo info (I)"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              onClick={sharePhoto}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Share"
            >
              <Share className="h-5 w-5" />
            </button>
            <button
              onClick={downloadPhoto}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Previous (←)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Next (→)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full p-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-white text-sm px-2 min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          disabled={zoom >= 5}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Photo */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={photo.url}
          alt={photo.name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-sm text-white p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Photo Details</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <p className="mt-1">{photo.name}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Size:</span>
                  <p className="mt-1">{formatFileSize(photo.size)}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Dimensions:</span>
                  <p className="mt-1">{photo.width} × {photo.height}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="mt-1">{photo.type}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Uploaded:</span>
                  <p className="mt-1">{formatDateTime(photo.uploadedAt)}</p>
                </div>
                
                {photo.tags && photo.tags.length > 0 && (
                  <div>
                    <span className="text-gray-400">Tags:</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {photo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/20 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {photo.location && (
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <p className="mt-1">{photo.location}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <button
                onClick={() => onToggleFavorite(photo.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  photo.isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Heart className={`h-4 w-4 ${photo.isFavorite ? 'fill-current' : ''}`} />
                {photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}