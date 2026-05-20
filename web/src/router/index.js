import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Archive from '../views/Archive.vue';
import AILab from '../views/AILab.vue';
import Footprints from '../views/Footprints.vue';
import About from '../views/About.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/archive', name: 'Archive', component: Archive },
  { path: '/ai-lab', name: 'AILab', component: AILab },
  { path: '/footprints', name: 'Footprints', component: Footprints },
  { path: '/about', name: 'About', component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
