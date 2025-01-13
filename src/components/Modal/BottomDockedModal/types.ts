import type {ReactNode} from 'react';
import type {Animated, NativeSyntheticEvent, NativeTouchEvent, PanResponderGestureState, StyleProp, ViewProps, ViewStyle} from 'react-native';
import type {ModalProps as ReactNativeModalProps} from 'react-native-modal';
import type {SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

type Direction = 'up' | 'down' | 'left' | 'right';

type ScrollToEvent = {
    scrollViewTag?: number;
    x?: number;
    y?: number;
    animated?: boolean;
};
type GestureResponderEvent = NativeSyntheticEvent<NativeTouchEvent>;
type AnimationEvent = ReturnType<typeof Animated.event>;

type GestureProps = {
    /** Whether swipe gestures should propagate to parent components */
    propagateSwipe?: boolean | ((event?: GestureResponderEvent, gestureState?: PanResponderGestureState) => boolean);

    /** Threshold for the pan responder to recognize the swipe gesture */
    panResponderThreshold?: number;

    /** Minimum swipe distance for the modal to close */
    swipeThreshold?: number;

    /** Allowed swipe direction(s) for the modal */
    swipeDirection?: Direction | Direction[];

    /** Scrolls to the specified position within the modal */
    scrollTo?: ((e?: ScrollToEvent) => void) | null;

    /** Vertical offset for scrolling */
    scrollOffset?: number;

    /** Maximum scroll offset value */
    scrollOffsetMax?: number;

    /** Whether scrolling is horizontal */
    scrollHorizontal?: boolean;

    /**  Callback when swipe gesture starts */
    onSwipeStart?: (gestureState: PanResponderGestureState) => void;

    /** Callback when swipe gesture moves */
    onSwipeMove?: (percentageShown: number, gestureState: PanResponderGestureState) => void;

    /** Callback when swipe gesture is completed */
    onSwipeComplete?: (
        params: {
            swipingDirection: Direction;
        },
        gestureState: PanResponderGestureState,
    ) => void;

    /** Callback when swipe gesture is canceled */
    onSwipeCancel?: (gestureState: PanResponderGestureState) => void;

    /** Height of the device (used for positioning) */
    deviceHeight?: number | null;

    /** Width of the device (used for positioning) */
    deviceWidth?: number | null;
};

type ModalProps = ViewProps &
    GestureProps & {
        /** Content inside the modal */
        children: ReactNode;

        /** Style applied to the modal container */
        style?: StyleProp<ViewStyle>;

        /** Callback when the modal is dismissed */
        onDismiss?: () => void;

        /** Callback when the modal is shown */
        onShow?: () => void;

        /** Whether to use hardware acceleration for animations */
        hardwareAccelerated?: boolean;

        /** Callback when device orientation changes */
        onOrientationChange?: (
            orientation: NativeSyntheticEvent<{
                orientation: 'portrait' | 'landscape';
            }>,
        ) => void;

        /** The presentation style of the modal */
        presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';

        /** Default ModalProps Provided */
        /** Whether to use the native driver for the backdrop animation */
        useNativeDriverForBackdrop?: boolean;

        /** Enum for animation type when modal appears */
        animationIn?: ValueOf<Pick<ReactNativeModalProps, 'animationIn'>>;

        /** Duration of the animation when modal appears */
        animationInTiming?: number;

        /** Enum for animation type when modal disappears */
        animationOut?: ValueOf<Pick<ReactNativeModalProps, 'animationOut'>>;

        /** Duration of the animation when modal disappears */
        animationOutTiming?: number;

        /** Duration of the animation delay when modal appears */
        animationInDelay?: number;

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

        /** Whether to hide modal content during animations */
        hideModalContentWhileAnimating?: boolean;

        /** Whether the modal is visible */
        isVisible?: boolean;

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

        /** Whether the status bar should be translucent when the modal is visible */
        statusBarTranslucent?: boolean;

        /** List of supported orientations for the modal */
        supportedOrientations?: Array<'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right'>;

        navigationBarTranslucent?: boolean;
    };

type BackdropProps = {
    /** Style applied to the modal backdrop */
    style: StyleProp<ViewStyle>;

    /** Whether modal has backdrop */
    hasBackdrop: boolean;

    /** Custom backdrop component */
    customBackdrop?: ReactNode;

    /** Callback fired when pressing the backdrop */
    onBackdropPress?: () => void;

    /** Delay set to animation on enter */
    animationInDelay?: number;

    /** Timing of animation on enter */
    animationInTiming?: number;

    /** Timing of animation on exit */
    animationOutTiming?: number;
};

type ContainerProps = {
    /** This function is called by open animation callback */
    onOpenCallBack: () => void;

    /** This function is called by close animation callback */
    onCloseCallBack: () => void;

    /** Position animated by pan gesture */
    panPosition?: {translateX: SharedValue<number>; translateY: SharedValue<number>};
};

export default ModalProps;
export type {GestureResponderEvent, AnimationEvent, Direction, BackdropProps, ContainerProps, GestureProps};
