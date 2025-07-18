export interface Photo {
  id: string
  name: string
  url: string
  thumbnail: string
  size: number
  type: string
  width: number
  height: number
  uploadedAt: string
  isFavorite: boolean
  tags: string[]
  location?: string
}

export interface Album {
  id: string
  name: string
  description?: string
  coverPhoto?: string
  photoCount: number
  createdAt: string
  updatedAt: string
}