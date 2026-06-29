import type {SharedValue} from 'react-native-reanimated';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type GrowlNotificationContainerProps = ChildrenProps & {
    /** Normalized visibility (0 = fully offscreen, 1 = fully visible). Translated to a pixel offset at render time. */
    progress: SharedValue<number>;

    /** Pixel offset that corresponds to the current "offscreen" position for the active anchor. */
    inactiveY: number;

    /** When true, position the growl at the bottom-right (wide screens with an action button). */
    useBottomPosition?: boolean;
};

export default GrowlNotificationContainerProps;
