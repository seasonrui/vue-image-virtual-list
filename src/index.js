import ImageVirtualList from "./image-virtual-list.vue"

const plugin = {
  install(Vue) {
    Vue.component("ImageVirtualList", ImageVirtualList)
  }
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(ImageVirtualList);
}
export default plugin
