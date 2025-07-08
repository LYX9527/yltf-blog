import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
    timeout: 10000,
})

// 获取完整图片URL的工具函数
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return ''

    // 如果已经是完整URL，直接返回
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
    }

    // 如果是相对路径，拼接服务器地址
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    return imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
}

export interface Post {
    id: string
    title: string
    slug: string
    excerpt?: string
    content: string
    published: boolean
    featured: boolean
    coverImage?: string
    readTime?: number
    viewCount: number
    createdAt: string
    updatedAt: string
    publishedAt?: string
    author: {
        id: string
        username: string
        name?: string
        avatar?: string
        bio?: string
    }
    category?: {
        id: string
        name: string
        slug: string
    }
    tags: {
        tag: {
            id: string
            name: string
            slug: string
        }
    }[]
}

export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    _count?: {
        posts: number
    }
}

export interface Tag {
    id: string
    name: string
    slug: string
    _count?: {
        posts: number
    }
}

export interface PostsResponse {
    posts: Post[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export const postsApi = {
    getAll: (params?: {
        page?: number
        limit?: number
        category?: string
        tag?: string
        search?: string
        published?: boolean | string
        date?: string
    }) => api.get<PostsResponse>('/posts', {params}),

    getFeatured: () => api.get<Post[]>('/posts/featured'),

    getBySlug: (slug: string) => api.get<Post>(`/posts/${slug}`),

    create: (data: Partial<Post>) => api.post<Post>('/posts', data),

    update: (slug: string, data: Partial<Post>) => api.put<Post>(`/posts/${slug}`, data),

    delete: (slug: string) => api.delete(`/posts/${slug}`),
}

export const categoriesApi = {
    getAll: () => api.get<Category[]>('/categories'),
    getBySlug: (slug: string) => api.get<Category>(`/categories/${slug}`),
    create: (data: Partial<Category>) => api.post<Category>('/categories', data),
}

export const tagsApi = {
    getAll: () => api.get<Tag[]>('/tags'),
    getBySlug: (slug: string) => api.get<Tag>(`/tags/${slug}`),
    create: (data: Partial<Tag>) => api.post<Tag>('/tags', data),
}

export interface Comment {
    id: string
    content: string
    createdAt: string
    author?: {
        id: string
        name?: string
        username: string
        avatar?: string
    }
    guestName?: string
    guestEmail?: string
    parentId?: string
    replies?: Comment[]
}

export const commentsApi = {
    getByPostId: (postId: string) => api.get<Comment[]>(`/comments/post/${postId}`),
    create: (postId: string, data: {
        content: string
        parentId?: string | null
        guestName?: string
        guestEmail?: string
    }) => api.post<Comment>(`/comments/post/${postId}`, data),
    delete: (commentId: string) => api.delete(`/comments/${commentId}`),
}

export default api
