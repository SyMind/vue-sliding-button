<template>
  <div class="better-slider"
    style="transition-property: height; transition-timing-function: ease-in;"
    :style="{ 'transition-duration': `${closeTime}ms` }"
    @transitionEnd="transitionEnd"
    @webkitTransitionEnd="transitionEnd"
    @oTransitionEnd="transitionEnd"
    @MSTransitionEnd="transitionEnd"
  >
    <div class="better-slider-wrapper"
      style="transition-property: transform; transition-timing-function: ease-in-out;"
      ref="wrapper">
      <div class="better-slider-front" ref="front"
        style="transition-property: transform;"
        :style="{
          'transition-timing-function': easing,
          'transition-duration': `${duration}ms`,
          'transform': `translate(${x}px, 0px) translateZ(0px)`
        }"
        @touchstart="start"
        @mousedown="start"
        @touchmove="move"
        @mousemove="move"
        @touchend="end"
        @mouseup="end"
        @touchcancel="end"
        @mousecancel="end"
        @mouseleave="end"
        @click="clickFrontEventHandle"
      >
        <slot name="front"></slot>
      </div>
      <div
        class="better-slider-back"
        @click="clickBackEventHandle"
        ref="back"
      >
        <slot name="back"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.better-slider {
  position: relative;
  overflow-x: hidden;
  width: 100%;
  transition: all 300ms ease-in-out;
  .better-slider-wrapper {
    overflow: hidden;
    height: 100%;
    .better-slider-back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .better-slider-front {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    border: 0;
    margin: 0;
    padding: 0;
    z-index: 10;
  }
}
</style>

<script>
import {
  eventType,
  TOUCH_EVENT
} from './util/dom'
import {
  getNow,
  computeMomentum,
  parsePercentage
} from './util/lang'

export default {
  name: 'better-slider',
  props: {
    right: {
      type: [ Number, String ],
      default: 80
    },
    left: {
      type: [ Number, String ],
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
    rightBackgroundColor: {
      type: String,
      default: '#e6454a'
    },
    leftBackgroundColor: {
      type: String,
      default: '#ccc'
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
      easing: {}
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
      this.$el.style.height = 0

      let wrapperStyle = this.$refs.wrapper.style
      wrapperStyle.transitionDuration = `${this.closeTime}ms`
      wrapperStyle.transform = `translate(${-this.$refs.front.offsetWidth}px, 0px) translateZ(0px)`

      this.wrapperX = -this.$refs.front.offsetWidth
      this.isClosing = true
    },
    start (event) {
      const _eventType = eventType[event.type]
      if (_eventType !== TOUCH_EVENT) {
        if (event.button !== 0) {
          return
        }
      }

      if (this.initiated && this.initiated !== _eventType) {
        return
      }
      this.initiated = _eventType

      this.$emit('touchStartEvent', { event, component: this })

      this.duration = this.slideTime
      this.x = 0

      this.distX = 0
      this.startTime = getNow()

      const touch = event.touches ? event.touches[0] : event
      this.startX = this.x
      this.absStartX = this.x
      this.touchX = touch.pageX
    },
    move (event) {
      if (eventType[event.type] !== this.initiated) {
        return
      }

      this.duration = 0
      const touch = event.touches ? event.touches[0] : event
      const deltaX = touch.pageX - this.touchX
      this.touchX = touch.pageX
      this.distX += deltaX
      const absDistX = Math.abs(this.distX)
      const timestamp = getNow()

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
      if (eventType[event.type] !== this.initiated) {
        return
      }
      this.initiated = false

      this.endTime = getNow()
      const duration = this.endTime - this.startTime
      const absDistX = Math.abs(this.x - this.startX)

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
      if (event.target.className.indexOf('better-slider') > -1 &&
        this.isClosing &&
        this.$el.offsetHeight === 0
      ) {
        this.$emit('closeTransitionEndEvent', { event, component: this })
      } else {
        if (this.isRightOpened && this.x === this.minScrollX) {
          this.$emit('rightOpenedEvent', { event, component: this })
        }
        if (this.isLeftOpened && this.x === this.maxScrollX) {
          this.$emit('leftOpenedEvent', { event, component: this })
        }
        this.resetPosition(this.bounceTime, this.ease.bounce)
      }
    },
    resetPosition (time, easing) {
      if (this.isRightOpened) {
        this.x = this.minScrollX
      } else if (this.isLeftOpened) {
        this.x = this.maxScrollX
      } else {
        this.x = 0
      }
      this.duration = time
      this.easing = easing
    },
    computeX (input) {
      if (typeof input === 'string') {
        const percentage = parsePercentage(input)
        const wrapperWidth = parseInt(window.getComputedStyle(this.$refs.wrapper, null).width)
        if (typeof percentage === 'number') {
          return Math.ceil(percentage * wrapperWidth)
        }
        return 0
      }
      return input
    }
  },
  created () {
    this.isClosing = false
    this.ease = {
      slide: 'ease-in',
      momentum: 'ease-out'
    }
  },
  mounted () {
    this.minScrollX = -this.computeX(this.right)
    this.maxScrollX = this.computeX(this.left)
    this.$el.style.height = `${Math.ceil(this.$slots.front[0].elm.offsetHeight)}px`
  },
  watch: {
    x () {
      let elStyle = this.$el.style
      if (this.x === 0) {
        elStyle.backgroundColor = ''
        this.isLeftOpened = false
        this.isRightOpened = false
      } else if (this.x > 0) {
        this.isLeftOpened = true
        this.isRightOpened = false
        elStyle.backgroundColor = this.leftBackgroundColor
      } else {
        this.isLeftOpened = false
        this.isRightOpened = true
        elStyle.backgroundColor = this.rightBackgroundColor
      }
    },
    trigger () {
      if (!this.initiated) {
        this.duration = this.slideTime
        this.x = 0
      }
    }
  }
}
</script>
