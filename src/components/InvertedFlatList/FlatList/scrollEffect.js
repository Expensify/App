import React from 'react';

function useScrollSubscription({ parentRef, onStartReached, onEndReached }) {
  const scrollSubscriptions = React.useRef([])

  const handleScroll = ({ nativeEvent }) => {
    const isStartReached = nativeEvent.contentOffset.y <= nativeEvent.layoutMeasurement.height
    const isEndReached = nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height * 2

    if (isStartReached && onStartReached) {
      onStartReached()
    }

    if (isEndReached && onEndReached) {
      onEndReached()
    }

    parentRef.current.measure((fx, fy, width, height) => {
      scrollSubscriptions.current.forEach((callback) => {
        callback({
          height,
          scrollTop: nativeEvent.contentOffset.y,
        })
      })
    })
  }

  const addEventListener = (callback) => {
    scrollSubscriptions.current.push(callback)
  }

  const removeEventListener = () => {
  }

  return {
    addEventListener,
    removeEventListener,
    handleScroll,
  } 
}

export {
  useScrollSubscription,
}