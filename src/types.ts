export type User = {
  id: string
  username: string
  pictureUrl: string
}

export type Comment = {
  id: string
  memeId: string
  content: string
  createdAt: string
  authorId: string
  author?: User
}

export type Meme = {
  id: string
  pictureUrl: string
  description: string
  createdAt: string
  authorId: string
  commentsCount: number
  texts: {
    content: string
    x: number
    y: number
  }[]
  comments: Comment[]
  author?: User
}

export type MemeResponse = {
  results: Meme[]
  pageSize: number
  total: number
}

export type MemePage = {
  results: Meme[]
  hasMore: boolean
}

export type CreateCommentResponse = {
  id: string
  memeId: string
  content: string
  createdAt: string
  authorId: string
}