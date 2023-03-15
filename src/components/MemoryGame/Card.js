import * as React from 'react';
import {StyleSheet} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function Card({index, key, card, onPress}) {
  const handlePress = () => {
    console.log('flip');
    if (onPress) onPress();
  };

  return (
    <Pressable style={[styles.container]} onPress={handlePress}></Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    backgroundColor: 'pink',
  },
});
