import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 禁用自动滚动，由各页面组件自行控制
  scrollBehavior() {
    // 返回 false 禁用滚动行为
    return false
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/era/:id',
      name: 'era-detail',
      component: () => import('@/views/EraDetail.vue'),
    },
    {
      path: '/levels',
      name: 'levels',
      component: () => import('@/views/LevelSystem.vue'),
    },
    {
      path: '/collection',
      name: 'collection',
      component: () => import('@/views/Collection.vue'),
    },
    {
      path: '/collection/:type',
      name: 'collection-type',
      component: () => import('@/views/Collection.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/Favorites.vue'),
    },
  ],
})

export default router
