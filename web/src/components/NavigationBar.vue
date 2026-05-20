<template>
  <nav class="navigation-bar">
    <div class="logo">
      <router-link to="/">光影纪 · CHRONICLES</router-link>
    </div>
    <div class="nav-links">
      <router-link to="/">HOME</router-link>
      <router-link to="/archive">ARCHIVE</router-link>
      <router-link to="/ai-lab">AI LAB</router-link>
      <router-link to="/footprints">FOOTPRINTS</router-link>
      <router-link to="/about">ABOUT</router-link>
    </div>
    <div class="nav-icons">
      <a href="#"><i class="icon-placeholder"></i></a>
      <a href="#"><i class="icon-placeholder-gear"></i></a>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavigationBar',
};
</script>

<style scoped>
.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(to right, #18212f, #2c3e50);
  color: white;
  width: 100%;
  margin: 0;
  /* remove external spacing */
  box-sizing: border-box;
  /* ensure padding doesn't cause overflow */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.logo a {
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-links a {
  color: white;
  text-decoration: none;
  margin: 0 1rem;
  font-size: 1rem;
  position: relative;
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: white;
}

.nav-icons a {
  color: white;
  margin-left: 1rem;
}

/* You can replace these with actual icons */
.icon-placeholder,
.icon-placeholder-gear {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: white;
  /* Placeholder color */
  -webkit-mask-size: cover;
  mask-size: cover;
}

.icon-placeholder {
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2v2.1a7.5 7.5 0 0 1 0 11.8V20a2 2 0 0 1-4 0v-2.1a7.5 7.5 0 0 1 0-11.8V4a2 2 0 0 1 2-2zm0 4a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>') no-repeat 50% 50%;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2v2.1a7.5 7.5 0 0 1 0 11.8V20a2 2 0 0 1-4 0v-2.1a7.5 7.5 0 0 1 0-11.8V4a2 2 0 0 1 2-2zm0 4a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>') no-repeat 50% 50%;
}

.icon-placeholder-gear {
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.4 12.5c0 .3-.1.6-.2.9l1.7 1.3c.4.3.5.9.2 1.3l-1.6 2.8c-.3.4-.9.5-1.3.2l-2-1.2c-.5.4-1 .7-1.6.9v2.1c0 .5-.4.9-.9.9h-3.2c-.5 0-.9-.4-.9-.9v-2.1c-.6-.2-1.2-.5-1.6-.9l-2 1.2c-.4.3-.9.2-1.3-.2l-1.6-2.8c-.3-.4-.2-.9.2-1.3l1.7-1.3c-.1-.3-.2-.6-.2-.9s.1-.6.2-.9l-1.7-1.3c-.4-.3-.5-.9-.2-1.3l1.6-2.8c.3-.4.9-.5 1.3-.2l2 1.2c.5-.4 1-.7 1.6-.9V4.4c0-.5.4-.9.9-.9h3.2c.5 0 .9.4.9.9v2.1c.6.2 1.2.5 1.6.9l2-1.2c.4-.3.9-.2 1.3.2l1.6 2.8c.3.4.2.9-.2 1.3l-1.7 1.3c.1.3.2.6.2.9zm-7.4 2.5c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3z"/></svg>') no-repeat 50% 50%;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.4 12.5c0 .3-.1.6-.2.9l1.7 1.3c.4.3.5.9.2 1.3l-1.6 2.8c-.3.4-.9.5-1.3.2l-2-1.2c-.5.4-1 .7-1.6.9v2.1c0 .5-.4.9-.9.9h-3.2c-.5 0-.9-.4-.9-.9v-2.1c-.6-.2-1.2-.5-1.6-.9l-2 1.2c-.4.3-.9.2-1.3-.2l-1.6-2.8c-.3-.4-.2-.9.2-1.3l1.7-1.3c-.1-.3-.2-.6-.2-.9s.1-.6.2-.9l-1.7-1.3c-.4-.3-.5-.9-.2-1.3l1.6-2.8c.3-.4.9-.5 1.3-.2l2 1.2c.5-.4 1-.7 1.6-.9V4.4c0-.5.4-.9.9-.9h3.2c.5 0 .9.4.9.9v2.1c.6.2 1.2.5 1.6.9l2-1.2c.4-.3.9-.2 1.3.2l1.6 2.8c.3.4.2.9-.2 1.3l-1.7 1.3c.1.3.2.6.2.9zm-7.4 2.5c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3z"/></svg>') no-repeat 50% 50%;
}
</style>
