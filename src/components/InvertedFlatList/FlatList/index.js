import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import { useScrollSubscription } from './scrollEffect'
import virtualizer from './virtualizer';

const FlatList = (props) => {
  const parentRef = React.useRef()

  /**
   * Scroll event tracker
   */
  const scrollEffect = useScrollSubscription({
    parentRef,
    onEndReached: props.onEndReached,
    onStartReached: props.onStartReached
  })

  /**
   * Split data into two chunks,
   * preloadedDataChunk will be rendered immediately without virtualization
   * postloadedDataChunk will be rendered, measured and re-rendered
   */
  const preloadedDataChunk = React.useMemo(() => props.data.slice(props.initialNumToRender), [props.data])
  const postloadedDataChunk = React.useMemo(() => props.data.slice(0, props.initialNumToRender), [props.data])

  /**
   * virtualization helper
   */
  const rowVirtualizer = virtualizer({
    data: preloadedDataChunk,
    parentRef,
    scrollEffect,
    initialNumToRender: props.initialNumToRender,
    initialRowHeight: props.initialRowHeight,
  })

  return (
    <ScrollView ref={parentRef} style={styles.container} onScroll={scrollEffect.handleScroll} scrollEventThrottle={16}>
      <View style={[styles.list, styles.listFixed]} onLayout={rowVirtualizer.measurePreloadedElement}>
        {postloadedDataChunk.map((item, index) => (
          <View key={index}>
            <View style={styles.inverted}>
              {props.renderItem({ index: index, item: props.data[index] })}
            </View>
          </View>
        ))}
      </View>

      <View style={[{ height: rowVirtualizer.totalSize }]}>
        {rowVirtualizer.preloadedElementHeight ? rowVirtualizer.virtualItems.map(virtualRow => (
          <View key={virtualRow.index} onLayout={virtualRow.measureRef} style={[styles.item, { transform: [{ translateY: virtualRow.start }] }]}>
            <View style={styles.inverted}>
              {props.renderItem({ index: virtualRow.index, item: props.data[virtualRow.index + props.initialNumToRender] })}
            </View>
          </View>
        )) : null}
      </View>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: `100%`,

    transform: [{
      scaleY: -1
    }]
  },

  list: {
    width: '100%',
    position: 'relative',
  },
  listFixed: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },

  item: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },

  inverted: {
    transform: [{ scaleY: -1 }],
  },
});

export default FlatList;