<style scoped>
    .virtual-list {
        width: 100%;
        height: 100%;
        overflow: auto;
        font-size: 12px;
    }

    .virtual-list-container {
        position: relative;
    }

    .virtual-list-item {
        overflow: hidden;
    }
</style>
<template>
    <div class="virtual-list">
        <div class="virtual-list-container" :style="{height: containerHeight + 'px'}">
            <div v-for="(item, index) in renderList" :key="item.id" class="virtual-list-item"
                 :style="getLayoutStyle(item)">
                <slot :item="item" :index="index"></slot>
            </div>
        </div>
    </div>
</template>
<script>
  const TOP = -1;
  const VISIBLE = 0;
  const BOTTOM = 1;
  export default {
    name: 'image-virtual-list',
    props: {
      data: {
        type: Array,
      },
      top: {
        type: Number,
        default: 0
      }
    },
    watch: {
      data: {
        handler() {
          this.initRender()
        },
        deep: true,
      },
      top(val) {
        this.$el.scrollTop = val;
        this.onScroll()
      }
    },
    data() {
      return {
        renderList: [],
        clientHeight: 0,
        start: 0,
        end: 0,
        rowItemsList: [],
        lastScrollTop: 0,
        layoutData: []
      }
    },
    computed: {
      containerHeight() {
        if (!this.layoutData.length) {
          return 0
        }
        let lastRow = this.layoutData[this.layoutData.length - 1];
        return lastRow.top + lastRow.height;
      }
    },
    mounted() {
      this.clientHeight = this.$el.clientHeight;
      const throttle_scroll = this.throttle(this.onScroll, 30);
      this.$el.addEventListener('scroll', throttle_scroll);
      this.initRender();
    },
    methods: {
      throttle(fn, delay) {
        let last = 0, timer = null;

        return function () {
          let context = this;
          let args = arguments;
          let now = +new Date();

          if (now - last < delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
              last = now;
              fn.apply(context, args);
            }, delay)
          } else {
            last = now;
            fn.apply(context, args);
          }
        }
      },
      getClientWidth() {
        return this.$el.clientWidth;
      },
      getLayoutGeometry(aspectRatioList, config = {}) {
        let defaultConfig = {
          containerWidth: this.getClientWidth(),
          containerTop: 20
        };
        let imageConfig = Object.assign({}, defaultConfig, config);
        return require('./row-layout')(aspectRatioList, imageConfig);
      },
      getLayoutStyle(item) {
        let boxes = item.boxes;
        if (!boxes) {
          return {}
        }
        return {
          position: 'absolute',
          height: boxes.height + 'px',
          width: boxes.width + 'px',
          left: boxes.left + 'px',
          top: boxes.top + 'px'
        }
      },
      calculatePos(row) {
        let scrollTop = this.$el.scrollTop || 0;
        if (row.top <= scrollTop - this.clientHeight / 2) {
          return TOP;
        } else if (row.top > (scrollTop + this.clientHeight * 3)) {
          return BOTTOM;
        }
        return VISIBLE;
      },
      onScroll() {
        const rowItemsList = this.layoutData;
        let preItem;
        let visibleList = [];
        for (let i = 0; i < rowItemsList.length; i++) {
          let rowItem = rowItemsList[i];
          let pos = this.calculatePos(rowItem);
          if (pos === TOP) {
            preItem = rowItem;
          } else if (pos === VISIBLE) {
            visibleList.push(rowItem)
          } else {
            visibleList.push(rowItem);
            break;
          }
        }
        if (preItem) {
          visibleList.splice(0, 0, preItem);
        }
        let renderList = [];
        visibleList.forEach(item => {
          let data = item.data;
          let top = item.top;
          let height = item.height;
          let lastLeft = 0;
          for (let i = 0; i < data.length; i++) {
            let dataItem = data[i];
            let renderItem = Object.assign({}, dataItem);
            renderItem.boxes = {
              height: height,
              width: height * (dataItem.width / dataItem.height),
              top: top,
              left: lastLeft
            };
            lastLeft += renderItem.boxes.width;
            renderList.push(renderItem);
          }
        })
        this.renderList = renderList;
      },
      initRender() {
        this.layoutData = Object.freeze(this.getLayoutGeometry(this.data));
        this.onScroll()
      }
    }
  }
</script>
