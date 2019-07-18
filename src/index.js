import ImageVirtualList from "./image-virtual-list.vue"

const plugin = {
    install(Vue) {
        Vue.component("ImageVirtualList", ImageVirtualList)
    }
}

export default plugin