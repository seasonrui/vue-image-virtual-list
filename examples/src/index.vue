<style>
    html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    #app {
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        width: 100%;
        height: 100%;
    }

    .image-item {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .image-box {
        flex: 1;
        position: relative;
    }

    .image-box img {
        max-height: 100%;
        max-width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .image-info {
        height: 32px;
    }

</style>
<template>
    <div id="app">
        <image-virtual-list
                :data="layoutGeometry"
                :top="scrollTop"
                v-slot="{ item, index }"
        >
            <div class="image-item">
                <div class="image-box">
                    <img :src="item && item.url"/>
                </div>
                <div class="image-info">{{ item && item.name }}{{ item.id }}</div>
            </div>
        </image-virtual-list>
    </div>
</template>

<script>
  const Mock = require("mockjs");
  export default {
    name: "app",
    data() {
      return {
        layoutGeometry: [],
        scrollTop: 0
      };
    },
    created() {
      this.layoutGeometry = this.mockDataList();
    },
    methods: {
      mockDataList() {
        let data = Mock.mock({
          "list|1-1000": [
            {
              "id|+1": 1,
              name: function () {
                return Mock.Random.cword(2)
              },
              height: function () {
                return Mock.Random.natural(100, 1000)
              },
              width: function () {
                return Mock.Random.natural(100, 1000)
              },
              url: function (data) {
                let width = data.context.currentContext.width;
                let height = data.context.currentContext.height;
                return Mock.Random.image(width + 'x' + height)
              }
            }
          ]
        });
        return data.list;
      },
    }
  };
</script>
