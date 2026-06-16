import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home/index.vue';
import Archive from '../views/Archive/index.vue';
import Console from '../views/Console/index.vue';
import Footprints from '../views/Footprints/index.vue';
import Notes from '../views/Notes/index.vue';
import GalleryDetail from '../views/GalleryDetail/index.vue';
import PhotoDetail from '../views/PhotoDetail/index.vue';
import PhotoDesk from '../views/PhotoDesk/index.vue';
import WorkDetail from '../views/WorkDetail/index.vue';
import Postcards from '../views/Postcards/index.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/archive', name: 'Archive', component: Archive },
  { path: '/console', name: 'Console', component: Console },
  { path: '/console/work/:id', name: 'WorkDetail', component: WorkDetail },
  { path: '/footprints', name: 'Footprints', component: Footprints },
  { path: '/notes', name: 'Notes', component: Notes },
  { path: '/gallery-detail/:id', name: 'GalleryDetail', component: GalleryDetail },
  { path: '/photo-detail/:id', name: 'PhotoDetail', component: PhotoDetail },
  { path: '/photo-desk/:mapCode', name: 'PhotoDesk', component: PhotoDesk },
  { path: '/postcards', name: 'Postcards', component: Postcards },
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
