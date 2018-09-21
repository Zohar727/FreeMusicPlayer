import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'
import search from '@/components/search'
import musicbox from '@/components/musicbox'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'musicbox',
      component: musicbox
    },
    {
      path: '/search',
      name: 'search',
      component: search
    }
  ]
})
