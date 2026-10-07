import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

type SwipeableViewProps = {
    /** The content to be rendered within the SwipeableView */
    children: ReactNode;

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown: () => void;

    style?: StyleProp<ViewStyle>;
};

export default SwipeableViewProps;
