import type {Animated} from 'react-native';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type GrowlNotificationContainerProps = ChildrenProps & {
    translateY: Animated.Value;
};

export default GrowlNotificationContainerProps;
