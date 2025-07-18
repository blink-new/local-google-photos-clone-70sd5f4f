import { useState } from 'react'
import { Search, Upload, Grid3X3, Menu } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { PhotoGrid } from './components/PhotoGrid'
import { UploadModal } from './components/UploadModal'
import { PhotoViewer } from './components/PhotoViewer'
import { Sidebar } from './components/Sidebar'
import { Photo } from './types/photo'

function App() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState<'photos' | 'albums' | 'favorites'>('photos')

  const filteredPhotos = photos.filter(photo => 
    photo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const displayPhotos = currentView === 'favorites' 
    ? filteredPhotos.filter(photo => photo.isFavorite)
    : filteredPhotos

  const handlePhotoUpload = (newPhotos: Photo[]) => {
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const toggleFavorite = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Photos</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your photos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onViewChange={setCurrentView}
          photoCount={photos.length}
          favoriteCount={photos.filter(p => p.isFavorite).length}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {displayPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Grid3X3 className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentView === 'favorites' ? 'No favorites yet' : 'No photos yet'}
                </h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  {currentView === 'favorites' 
                    ? 'Photos you mark as favorites will appear here'
                    : 'Upload your first photos to get started with your personal photo library'
                  }
                </p>
                {currentView !== 'favorites' && (
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                )}
              </div>
            ) : (
              <PhotoGrid
                photos={displayPhotos}
                onPhotoClick={setSelectedPhoto}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handlePhotoUpload}
      />

      {/* Photo Viewer */}
      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          photos={displayPhotos}
          onClose={() => setSelectedPhoto(null)}
          onNext={() => {
            const currentIndex = displayPhotos.findIndex(p => p.id === selectedPhoto.id)
            const nextIndex = (currentIndex + 1) % displayPhotos.length
            setSelectedPhoto(displayPhotos[nextIndex])
          }}
          onPrevious={() => {
            const currentIndex = displayPhotos.findIndex(p => p.id === selectedPhoto.id)
            const prevIndex = currentIndex === 0 ? displayPhotos.length - 1 : currentIndex - 1
            setSelectedPhoto(displayPhotos[prevIndex])
          }}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}

export default App