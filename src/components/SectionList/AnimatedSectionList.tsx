import {SectionList as RNSectionList} from 'react-native';
import Animated from 'react-native-reanimated';
import type {SectionListProps} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedSectionList = Animated.createAnimatedComponent<SectionListProps<any, any>>(RNSectionList);

export default AnimatedSectionList;
