import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';

const { width, height } = Dimensions.get('screen');

interface EmojiProps {
  emoji: string;
  progress: SharedValue<number>;
}

interface EmojiWaterfallContextValue {
  startAnimation: () => void;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export const EmojiWaterfallContext =
  React.createContext<EmojiWaterfallContextValue>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    startAnimation: () => {},
  });

function Emoji({ emoji, progress }: EmojiProps) {
  const left = randomBetween(-50, width + 100);

  const startY = randomBetween(-1000, -100);
  const endY = height + randomBetween(100, 1000);

  const scale = randomBetween(0.7, 1.3);
  const rotate = `${randomBetween(0, 360)}deg`;

  const animatedStyle = useAnimatedStyle(() => {
    const angle = Math.cos(progress.value * 5 * Math.PI) * 0.3;
    return {
      transform: [
        { translateX: left },
        { translateY: interpolate(progress.value, [0, 1], [startY, endY]) },
        { scale },
        { rotate },
        { rotate: `${angle}rad` },
      ],
    };
  });

  return (
    <Animated.Text
      style={[{ fontSize: 80, position: 'absolute' }, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
}

function EmojiWaterfallProvider({ children }: React.PropsWithChildren) {
  const progress = useSharedValue(0);

  const count = 100;
  const emoji = '💵';
  const duration = 8000;

  const startAnimation = () => {
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.linear });
  };

  return (
    <EmojiWaterfallContext.Provider value={{ startAnimation }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        //   backgroundColor: 'rgba(255,0,0,0.5)',
        }}
        pointerEvents="none">
        {[...Array(count)].map((_, i) => (
          <Emoji emoji={emoji} progress={progress} key={i} />
        ))}
      </View>
      {children}
    </EmojiWaterfallContext.Provider>
  );
}

function Control() {
  const { startAnimation } = useContext(EmojiWaterfallContext);

  return (
    <>
      <Text>Hello world!</Text>
      <Button title="Run animation" onPress={startAnimation} />
    </>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <EmojiWaterfallProvider>
        <Control />
      </EmojiWaterfallProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {
    EmojiWaterfallProvider,
    EmojiWaterfallContext,
};