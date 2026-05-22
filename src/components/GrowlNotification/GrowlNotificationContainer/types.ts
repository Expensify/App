import type {SharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type GrowlNotificationContainerProps = ChildrenProps & {
    translateY: SharedValue<number>;

    /** When true, position the growl at the bottom-right (wide screens with an action button). */
    useBottomPosition?: boolean;
};

export default GrowlNotificationContainerProps;
