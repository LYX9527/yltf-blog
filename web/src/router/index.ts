import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '../stores/auth'
import Home from '../views/Home.vue'
import PostDetail from '../views/PostDetail.vue'
import PostList from '../views/PostList.vue'
import Category from '../views/Category.vue'
import Tag from '../views/Tag.vue'
import CreatePost from '../views/CreatePost.vue'
import EditPost from '../views/EditPost.vue'
import ManagePosts from '../views/ManagePosts.vue'
import Archive from '../views/Archive.vue'
import Auth from '../views/Auth.vue'
import AdminProfile from '../views/AdminProfile.vue'
import UserProfile from '../views/UserProfile.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/auth',
        name: 'Auth',
        component: Auth
    },
    {
        path: '/profile',
        name: 'Profile',
        component: UserProfile,
        meta: {requiresAuth: true}
    },
    {
        path: '/admin',
        name: 'AdminProfile',
        component: AdminProfile,
        meta: {requiresAuth: true, requiresAdmin: true}
    },
    {
        path: '/posts',
        name: 'PostList',
        component: PostList
    },
    {
        path: '/posts/:slug',
        name: 'PostDetail',
        component: PostDetail,
        props: true
    },
    {
        path: '/category/:slug',
        name: 'Category',
        component: Category,
        props: true
    },
    {
        path: '/tag/:slug',
        name: 'Tag',
        component: Tag,
        props: true
    },
    {
        path: '/create',
        name: 'CreatePost',
        component: CreatePost,
        meta: {requiresAuth: true, requiresAdmin: true}
    },
    {
        path: '/edit/:slug',
        name: 'EditPost',
        component: EditPost,
        props: true,
        meta: {requiresAuth: true, requiresAdmin: true}
    },
    {
        path: '/manage',
        name: 'ManagePosts',
        component: ManagePosts,
        meta: {requiresAuth: true, requiresAdmin: true}
    },
    {
        path: '/archive',
        name: 'Archive',
        component: Archive
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/contact',
        name: 'Contact',
        component: Contact
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return {top: 0}
    }
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // 检查是否需要认证
    if (to.meta.requiresAuth) {
        // 如果没有登录，重定向到登录页
        if (!authStore.isLoggedIn) {
            next('/auth')
            return
        }

        // 检查是否需要管理员权限
        if (to.meta.requiresAdmin && !authStore.isAdmin) {
            // 权限不足，重定向到首页
            next('/')
            return
        }
    }

    next()
})

export default router
