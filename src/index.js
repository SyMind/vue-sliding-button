import BetterSlider from './BetterSlider'

const plugin = {
  install (Vue, options) {
    Vue.component(BetterSlider.name, BetterSlider)
  }
}

export default plugin
