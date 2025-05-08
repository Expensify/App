import type {SharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type GrowlNotificationContainerProps = ChildrenProps & {
    translateY: SharedValue<number>;
};

export default GrowlNotificationContainerProps;
