import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home/index.vue';
import Archive from '../views/Archive/index.vue';
import AILab from '../views/AlLab/index.vue';
import Footprints from '../views/Footprints/index.vue';
import About from '../views/About.vue';
import GalleryDetail from '../views/GalleryDetail/index.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/archive', name: 'Archive', component: Archive },
  { path: '/ai-lab', name: 'AILab', component: AILab },
  { path: '/footprints', name: 'Footprints', component: Footprints },
  { path: '/about', name: 'About', component: About },
  { path: '/gallery/:id', name: 'GalleryDetail', component: GalleryDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
