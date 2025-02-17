import Animated from 'react-native-reanimated';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

const AnimatedPressableWithoutFeedback = Animated.createAnimatedComponent(PressableWithoutFeedback);
AnimatedPressableWithoutFeedback.displayName = 'AnimatedPressableWithoutFeedback';

export default AnimatedPressableWithoutFeedback;
