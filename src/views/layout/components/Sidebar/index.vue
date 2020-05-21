<template>
  <el-scrollbar wrapClass="scrollbar-wrapper no-text-select" :style="{backgroundColor:bgColor}">
    <div class="side-ham">
<hamburger class="side-hanburger" :toggleClick="toggleSideBar" :isActive="sidebar.opened" :style="{marginLeft:sidebar.opened?'10px':'4px'}"></hamburger>
    <h3 class="side-title" :style="{display:sidebar.opened?'block':'none'}">{{sideTitle}}</h3>
    </div>
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      :background-color="bgColor"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <sidebar-item :routes="permission_left_routers"></sidebar-item>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import Hamburger from '@/components/Hamburger'

export default {
  components: { SidebarItem, Hamburger },
  computed: {
    ...mapGetters([
      'permission_left_routers',
      'sidebar',
      'sideTitle',
      'bgColor'
    ]),
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    }
  }
}
</script>

