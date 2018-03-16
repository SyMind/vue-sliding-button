<template>
  <div class="better-slider"
    style="transition-property: height; transition-timing-function: 'ease-in;"
    :style="{ 'transition-duration': `${closeTime}ms` }"
    @transitionEnd="transitionEnd"
    @webkitTransitionEnd="transitionEnd"
    @oTransitionEnd="transitionEnd"
    @MSTransitionEnd="transitionEnd">
    <div class="better-slider-wrapper"
      style="transition-property: transform; transition-timing-function: ease-in-out;"
      ref="wrapper">
      <div v-show="isBackShow" class="better-slider-back" @click="clickBackEventHandle" ref="back">
        <slot name="back"></slot>
      </div>
      <div class="better-slider-front" ref="front"
        style="transition-property: transform;"
        :style="{ 'transition-timing-function': easing,
          'transition-duration': `${duration}ms`,
          'transform': `translate(${x}px, 0px) translateZ(0px)` }"
        @touchstart="start"
        @touchmove="move"
        @touchend="end"
        @click="clickFrontEventHandle">
        <slot name="front"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.better-slider {
  position: relative;
  overflow: hidden;
  width: 100%;
  transition: all 300ms ease-in-out;
  .better-slider-wrapper {
    height: 100%;
    .better-slider-back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #E6454A;
    }
  }
  .better-slider-front {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}
</style>

<script>
import { getNow, computeMomentum } from './util'
export default {
  name: 'better-slider',
  props: {
    right: {
      type: Number,
      default: 80
    },
    left: {
      type: Number,
      default: 0
    },
    deceleration: {
      type: Number,
      default: 0.01
    },
    momentum: {
      type: Boolean,
      default: true
    },
    momentumTime: {
      type: Number,
      default: 100
    },
    momentumLimitTime: {
      type: Number,
      default: 300
    },
    momentumLimitDistance: {
      type: Number,
      default: 15
    },
    bounce: {
      type: Boolean,
      default: true
    },
    bounceTime: {
      type: Number,
      default: 200
    },
    slideTime: {
      type: Number,
      default: 200
    },
    closeTime: {
      type: Number,
      default: 300
    },
    backgroundColor: {
      type: String,
      default: '#E6454A'
    },
    trigger: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      x: 0,
      wrapperX: 0,
      duration: 0,
      easing: {},
      isBackShow: false
    }
  },
  methods: {
    clickBackEventHandle (event) {
      this.$emit('clickBackEvent', { event, component: this })
    },
    clickFrontEventHandle (event) {
      this.$emit('clickFrontEvent', { event, component: this })
    },
    close () {
      let elStyle = this.$el.style
      elStyle.backgroundColor = this.backgroundColor
      elStyle.height = 0

      let wrapperStyle = this.$refs.wrapper.style
      wrapperStyle.transitionDuration = `${this.closeTime}ms`
      wrapperStyle.transform = `translate(${-this.$refs.front.offsetWidth}px, 0px) translateZ(0px)`

      this.wrapperX = -this.$refs.front.offsetWidth
      this.isClosing = true
    },
    start (event) {
      this.isTouch = true
      this.isBackShow = true
      this.$emit('touchStartEvent')

      this.duration = this.slideTime
      this.x = 0

      this.distX = 0
      this.startTime = getNow()

      let touch = event.touches[0]
      this.startX = this.x
      this.absStartX = this.x
      this.touchX = touch.pageX
    },
    move (event) {
      this.duration = 0

      let touch = event.touches[0]
      let deltaX = touch.pageX - this.touchX
      this.touchX = touch.pageX
      this.distX += deltaX
      let absDistX = Math.abs(this.distX)
      let timestamp = getNow()

      if (timestamp - this.endTime > this.momentumLimitTime && absDistX < this.momentumLimitDistance) {
        return
      }

      let newX = this.x + deltaX
      if ((this.left === 0 && newX > this.maxScrollX) || (this.right === 0 && newX < this.minScrollX)) {
        return
      }

      if (newX < this.minScrollX || newX > this.maxScrollX) {
        if (this.bounce) {
          newX = this.x + deltaX / 3
        } else {
          newX = newX < this.minScrollX ? this.minScrollX : this.maxScrollX
        }
      }

      this.x = newX

      if (timestamp - this.startTime > this.momentumLimitTime) {
        this.startTime = timestamp
        this.startX = this.x
      }
    },
    end (event) {
      this.isTouch = false

      this.endTime = getNow()
      let duration = this.endTime - this.startTime
      let absDistX = Math.abs(this.x - this.startX)

      if (this.momentum && duration < this.momentumLimitTime && absDistX > this.momentumLimitDistance) {
        let momentumX = computeMomentum(this.x, this.startX, duration, this.minScrollX, this.maxScrollX, this.$el.offsetWidth, this.momentumTime, this.deceleration)
        this.duration = momentumX.duration
        this.x = momentumX.destination
        this.easing = this.ease.momentum
      } else {
        if (this.x < 1 / 3 * this.minScrollX) {
          this.duration = this.slideTime
          this.easing = this.ease.slide
          this.x = this.minScrollX
        } else if (this.x > 1 / 3 * this.maxScrollX) {
          this.duration = this.slideTime
          this.easing = this.ease.slide
          this.x = this.maxScrollX
        } else {
          this.duration = this.bounceTime
          this.easing = this.ease.slideTime
          this.x = 0
        }
      }
    },
    transitionEnd (event) {
      if (this.x === 0) this.isBackShow = false

      if (event.target.className.indexOf('better-slider') > -1 && this.isClosing && this.$el.offsetHeight === 0) {
        this.$emit('deleteTransitionEndEvent', this)
      } else {
        this.resetPosition(this.bounceTime, this.ease.bounce)
      }
    },
    resetPosition (time, easing) {
      if (this.isRightOpened) this.x = this.minScrollX
      else if (this.isLeftOpened) this.x = this.maxScrollX
      else this.x = 0
      this.duration = time
      this.easing = easing
    }
  },
  created () {
    this.minScrollX = -this.right
    this.maxScrollX = this.left
    this.isClosing = false
    this.ease = {
      slide: 'ease-in',
      momentum: 'ease-out'
    }
  },
  mounted () {
    let getComputedStyle = document.defaultView && document.defaultView.getComputedStyle
    let computedStyle = getComputedStyle(this.$refs.back, null)
    this.backgroundColor = computedStyle.backgroundColor

    this.$el.style.height = Math.ceil(this.$slots.front[0].elm.offsetHeight) + 'px'
  },
  watch: {
    x () {
      if (this.x <= this.minScrollX) this.isRightOpened = true
      else this.isRightOpened = false
      if (this.x >= this.maxScrollX) this.isLeftOpened = true
      else this.isLeftOpened = false
    },
    trigger () {
      if (!this.isTouch) {
        this.duration = this.slideTime
        this.x = 0
      }
    }
  }
}
</script>
