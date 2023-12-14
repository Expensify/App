import {Animated} from 'react-native';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type GrowlNotificationContainerProps = ChildrenProps & {
    translateY: Animated.Value;
};

export default GrowlNotificationContainerProps;
