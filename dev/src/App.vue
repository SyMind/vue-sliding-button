<template>
  <div class="wrapper">
    <better-slider :right="60"
      :left="60"
      :trigger="trigger"
      @touchStartEvent="touchStartEventHandle"
      @clickFrontEvent="clickFrontEventHandle"
      @clickBackEvent="clickBackEventHandle">
      <div slot="front" class="front">
        <div class="content">
          <div class="title">这是一条消息</div>
          <div class="description">这里是消息的内容</div>
        </div>
      </div>
      <div slot="back" class="back">
        <div class="read">已读</div>
        <div class="delete">删除</div>
      </div>
    </better-slider>
    <better-slider v-for="item in items" :key="item.id"
      :right="60"
      :trigger="trigger"
      @touchStartEvent="touchStartEventHandle"
      @clickFrontEvent="clickFrontEventHandle"
      @clickBackEvent="clickBackEventHandle">
      <div slot="front" class="front">
        <div class="content">
          <div class="title">{{ item.id }}的标题</div>
          <div class="description">{{ item.id }}的描述信息</div>
        </div>
      </div>
      <div slot="back" class="back">
        <div class="delete">删除</div>
      </div>
    </better-slider>
  </div>
</template>

<script>
export default {
  data () {
    return {
      items: new Array(100).fill(0).map((_, index) => ({ id: '#' + index })),
      trigger: false
    }
  },
  methods: {
    touchStartEventHandle () {
      this.trigger = !this.trigger
    },
    clickFrontEventHandle ({ event, component }) {

    },
    clickBackEventHandle ({ event, component }) {
      if (event.target.className.indexOf('delete') > -1) {
        component.close()
      }
    }
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
.front {
  height: 60px;
  padding: 0 0 0 60px;
  background-image: url('../static/logo.png');
  background-size: 40px;
  background-repeat: no-repeat;
  background-position: 10px;
  background-color: #fff;
  .content {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    &:after {
      content: '';
      pointer-events: none;
      box-sizing: border-box;
      position: absolute;
      width: 100%;
      height: 1px;
      left: 0;
      bottom: 0;
      background: #999;
      transform: scaleY(0.5);
      transform-origin: 0 0;
    }
    .title {
      padding: 10px 0 0 0;
      font-size: 16px;
      line-height: 16px;
    }
    .description {
      padding: 10px 0 0 0;
      font-size: 13px;
      line-height: 13px;
      color: #aaa;
    }
  }
}
.back {
  height: 60px;
  position: relative;
  .read {
    position: absolute;
    left: 0;
    width: 60px;
    text-align: center;
    font-size: 16px;
    line-height: 60px;
    color: #fff;
    background-color: #ccc;
  }
  .delete {
    position: absolute;
    right: 0;
    width: 60px;
    text-align: center;
    font-size: 16px;
    line-height: 60px;
    color: #fff;
  }
}
</style>
