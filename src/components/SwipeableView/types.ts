import {ReactNode} from 'react';
import {StyleProp, ViewStyle} from 'react-native';

type SwipeableViewProps = {
    /** The content to be rendered within the SwipeableView */
    children: ReactNode;

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown?: () => void;

    /** Callback to fire when the user swipes up on the child content */
    onSwipeUp?: () => void;

    /** Style for the wrapper View */
    style?: StyleProp<ViewStyle>;
};

export default SwipeableViewProps;
