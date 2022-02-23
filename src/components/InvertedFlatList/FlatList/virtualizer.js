import React from 'react';
import { useVirtual } from 'react-virtual-azim'

export const defaultRangeExtractor = range => {
  const start = Math.max(range.start - range.overscan, 0)
  const end = Math.min(range.end + range.overscan, range.size - 1)

  const arr = []

  for (let i = start; i <= end; i++) {
    arr.push(i)
  }

  return arr
}

export default ({ data, parentRef, scrollEffect, initialRowHeight }) => {
  const [preloadedElementHeight, setPreloadedElementHeight] = React.useState(0)

  /**
   * Scroll element handler
   */
  const onScrollElement = React.useRef({
    addEventListener: (eventName, eventHandler, eventConfig) => {
      scrollEffect.addEventListener(eventHandler)
    },
    removeEventListener: (eventName, eventHandler, eventConfig) => {
      // scrollEffect.removeEventListener(eventHandler)
    },
  })

  /**
   * Scroll offset calculator
   */
  const scrollOffsetFn = (event) => {
    if (!event) {
      return 0
    }
    return event.scrollTop
  }

  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef,
    estimateSize: React.useCallback((index) => initialRowHeight, []),
    onScrollElement,
    scrollOffsetFn,
    measureSize: React.useCallback((el, horizontal, index) => {
      return el.nativeEvent.layout.height
    }, []),
    overscan: 10,
    rangeExtractor: defaultRangeExtractor,
    paddingStart: preloadedElementHeight,
  })

  const measurePreloadedElement = (args) => {
    setPreloadedElementHeight(args.nativeEvent.layout.height)
  }

  return {
    ...rowVirtualizer,
    measurePreloadedElement,
    preloadedElementHeight,
  }
}