import * as React from 'react';
import {StyleSheet} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function Card({index, key, card, onPress}) {
  return <View style={[styles]}></View>;
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
  },
});
