import type {ReactNode} from 'react';
import type {NativeSyntheticEvent, NativeTouchEvent, PanResponderGestureState, StyleProp, ViewProps, ViewStyle} from 'react-native';

type Orientation = 'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right';

type Direction = 'up' | 'down' | 'left' | 'right';
type PresentationStyle = 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnOrientationChange = (orientation: NativeSyntheticEvent<any>) => void;

type OnSwipeCompleteParams = {
    swipingDirection: Direction;
};

type ModalProps = ViewProps & {
    /** Content inside the modal */
    children: ReactNode;

    /**  Callback when swipe gesture starts */
    onSwipeStart?: (gestureState: PanResponderGestureState) => void;

    /** Callback when swipe gesture moves */
    onSwipeMove?: (percentageShown: number, gestureState: PanResponderGestureState) => void;

    /** Callback when swipe gesture is completed */
    onSwipeComplete?: (params: OnSwipeCompleteParams, gestureState: PanResponderGestureState) => void;

    /** Callback when swipe gesture is canceled */
    onSwipeCancel?: (gestureState: PanResponderGestureState) => void;

    /** Style applied to the modal container */
    style?: StyleProp<ViewStyle>;

    /** Allowed swipe direction(s) for the modal */
    swipeDirection?: Direction | Direction[];

    /** Callback when the modal is dismissed */
    onDismiss?: () => void;

    /** Callback when the modal is shown */
    onShow?: () => void;

    /** Whether to use hardware acceleration for animations */
    hardwareAccelerated?: boolean;

    /** Callback when device orientation changes */
    onOrientationChange?: OnOrientationChange;

    /** The presentation style of the modal */
    presentationStyle?: PresentationStyle;

    /** Default ModalProps Provided */
    /** Whether to use the native driver for the backdrop animation */
    useNativeDriverForBackdrop?: boolean;

    /** Enum for animation type when modal appears */
    animationIn?: string;

    /** Duration of the animation when modal appears */
    animationInTiming?: number;

    /** Enum for animation type when modal disappears */
    animationOut?: string;

    /** Duration of the animation when modal disappears */
    animationOutTiming?: number;

    /** Whether to avoid keyboard overlap during modal display */
    avoidKeyboard?: boolean;

    /** Whether the modal should cover the entire screen */
    coverScreen?: boolean;

    /** Whether the modal should have a backdrop */
    hasBackdrop?: boolean;

    /** Color of the backdrop */
    backdropColor?: string;

    /** Opacity of the backdrop */
    backdropOpacity?: number;

    /** Duration of backdrop transition when modal appears */
    backdropTransitionInTiming?: number;

    /** Duration of backdrop transition when modal disappears */
    backdropTransitionOutTiming?: number;

    /** Custom component to use as the backdrop */
    customBackdrop?: ReactNode;

    /** Whether to use the native driver for animations */
    useNativeDriver?: boolean;

    /** Height of the device (used for positioning) */
    deviceHeight?: number | null;

    /** Width of the device (used for positioning) */
    deviceWidth?: number | null;

    /** Whether to hide modal content during animations */
    hideModalContentWhileAnimating?: boolean;

    /** Whether swipe gestures should propagate to parent components */
    propagateSwipe?: boolean | ((event?: GestureResponderEvent, gestureState?: PanResponderGestureState) => boolean);

    /** Whether the modal is visible */
    isVisible?: boolean;

    /** Threshold for the pan responder to recognize the swipe gesture */
    panResponderThreshold: 4;

    /** Minimum swipe distance for the modal to close */
    swipeThreshold?: number;

    /** Callback when modal has fully appeared */
    onModalShow?: () => void;

    /** Callback when modal is about to appear */
    onModalWillShow?: () => void;

    /** Callback when modal has fully disappeared */
    onModalHide?: () => void;

    /** Callback when modal is about to disappear */
    onModalWillHide?: () => void;

    /** Callback when the backdrop is pressed */
    onBackdropPress?: () => void;

    /** Callback when the back button is pressed (on Android) */
    onBackButtonPress?: () => void;

    /** Scrolls to the specified position within the modal */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scrollTo?: ((e?: any) => void) | null;

    /** Vertical offset for scrolling */
    scrollOffset?: number;

    /** Maximum scroll offset value */
    scrollOffsetMax?: number;

    /** Whether scrolling is horizontal */
    scrollHorizontal?: boolean;

    /** Whether the status bar should be translucent when the modal is visible */
    statusBarTranslucent?: boolean;

    /** List of supported orientations for the modal */
    supportedOrientations?: Orientation[];
};

type GestureResponderEvent = NativeSyntheticEvent<NativeTouchEvent>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimationEvent = (...args: any[]) => void;

export default ModalProps;
export type {GestureResponderEvent, AnimationEvent, Direction, Orientation};
