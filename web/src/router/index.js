import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home/index.vue';
import Archive from '../views/Archive/index.vue';
import AILab from '../views/AlLab/index.vue';
import Footprints from '../views/Footprints/index.vue';
import About from '../views/About/index.vue';
import GalleryDetail from '../views/GalleryDetail/index.vue';
import PhotoDetail from '../views/PhotoDetail/index.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/archive', name: 'Archive', component: Archive },
  { path: '/ai-lab', name: 'AILab', component: AILab },
  { path: '/footprints', name: 'Footprints', component: Footprints },
  { path: '/about', name: 'About', component: About },
  { path: '/gallery-detail/:id', name: 'GalleryDetail', component: GalleryDetail },
  { path: '/photo-detail/:id', name: 'PhotoDetail', component: PhotoDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

export default router;
