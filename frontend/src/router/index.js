import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store';
//Components
import Categoria from '../components/Categoria.vue';
import Login from '../components/Login.vue';

Vue.use(VueRouter)

let routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      administrador: true,
      almacenero: true,
      vendedor: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      libre: true
    }
  },
  {
    path: '/categoria',
    name: 'categoria',
    component: Categoria,
    meta: {
      administrador: true,
      almacenero: true
    }
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.libre)){
    next();
  } else if ( store.state.usuario && store.state.usuario.rol == 'Administrador'){
    if (to.matched.some(record => record.meta.administrador)){
      next();
    }
  } else if ( store.state.usuario && store.state.usuario.rol == 'Vendedor'){
    if (to.matched.some(record => record.meta.vendedor)){
      next();
    }
  } else if ( store.state.usuario && store.state.usuario.rol == 'Almacenero'){
    if (to.matched.some(record => record.meta.almacenero)){
      next();
    }
  } else{
    next({name: 'login'});
  }
});

export default router
