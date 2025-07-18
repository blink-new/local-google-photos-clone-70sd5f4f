import { X, Grid3X3, Heart, FolderOpen, Settings, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentView: 'photos' | 'albums' | 'favorites'
  onViewChange: (view: 'photos' | 'albums' | 'favorites') => void
  photoCount: number
  favoriteCount: number
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  currentView, 
  onViewChange, 
  photoCount, 
  favoriteCount 
}: SidebarProps) {
  const menuItems = [
    {
      id: 'photos' as const,
      label: 'Photos',
      icon: Grid3X3,
      count: photoCount,
      description: 'All your photos'
    },
    {
      id: 'favorites' as const,
      label: 'Favorites',
      icon: Heart,
      count: favoriteCount,
      description: 'Your favorite photos'
    },
    {
      id: 'albums' as const,
      label: 'Albums',
      icon: FolderOpen,
      count: 0,
      description: 'Organized collections'
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id)
                  onClose() // Close sidebar on mobile after selection
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-gray-500"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.label}</span>
                    {item.count > 0 && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Storage info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600">Storage used</span>
                <span className="font-medium">2.1 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: '35%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                3.5 GB remaining of 5 GB
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // Handle settings
                onClose()
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}