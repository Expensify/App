import {SectionList} from 'react-native';
import Animated from 'react-native-reanimated';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<any, any>);

export default AnimatedSectionList;
