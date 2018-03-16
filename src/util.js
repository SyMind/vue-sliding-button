export function getNow () {
  return window.performance && window.performance.now ? (window.performance.now() + window.performance.timing.navigationStart) : +new Date()
}

export function computeMomentum (current, start, time, minScrollX, maxScrollX, wrapperSize, momentumTime, deceleration) {
  let distance = current - start
  let speed = Math.abs(distance) / time

  let momentum = speed / deceleration
  let duration = momentumTime
  let destination = current + momentum * (distance < 0 ? -1 : 1)

  if (destination < maxScrollX - wrapperSize) {
    destination = maxScrollX - wrapperSize
  } else if (destination > wrapperSize + minScrollX) {
    destination = wrapperSize + minScrollX
  }

  return {
    destination: Math.round(destination),
    duration
  }
}
