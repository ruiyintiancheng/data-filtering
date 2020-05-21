<template>
  <div class="app-wrapper" :class="classObj">
    
    <navbar></navbar>
    <div class="main-container">
      <sidebar class="sidebar-container" :style="{display:dispalySideBar}"></sidebar>
      <tags-view :style="{marginLeft:marginNavBar,width:'calc(100% - '+marginNavBar+')'}"></tags-view>
      <app-main :style="{marginLeft:marginNavBar}"></app-main>
    </div>
    <bottom-bar></bottom-bar>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain, TagsView, BottomBar } from './components'
import { mapGetters } from 'vuex'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    TagsView,
    BottomBar
  },
  computed: {
    ...mapGetters([
      'dispalySideBar',
      'marginNavBar'
    ]),
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  created() {
    this.setCurrentHeight()
    this.$i18n.locale = this.$store.state.app.language
    window.addEventListener('resize', function() {
      this.setCurrentHeight()
    }.bind(this), false)
  },
  data() {
    return {
      height: null
    }
  },
  methods: {
    setCurrentHeight() {
      const height = document.body.offsetHeight - 131
      const dialogHeight = document.body.offsetHeight * 0.75
      this.height = height + 'px'
      this.$store.dispatch('setContainHeight', { height, dialogHeight })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-wrapper {
   // @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }
</style>
