import type {ReactNode} from 'react';
import type {NativeSyntheticEvent, StyleProp, ViewProps, ViewStyle} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type {FocusTrapOptions} from '@components/Modal/types';
import type CONST from '@src/CONST';

type GestureProps = {
    /** Height of the device (used for positioning) */
    deviceHeight?: number | null;

    /** Width of the device (used for positioning) */
    deviceWidth?: number | null;
};

type SwipeDirection = ValueOf<typeof CONST.SWIPE_DIRECTION>;

type GestureHandlerProps = {
    /** Callback to be fired on swipe gesture. */
    onSwipeComplete?: () => void;

    /** Threshold for swipe gesture. */
    swipeThreshold: number;

    /** Threshold for swipe gesture. */
    swipeDirection?: SwipeDirection | SwipeDirection[];
};

type AnimationIn = 'fadeIn' | 'slideInUp' | 'slideInRight';
type AnimationOut = 'fadeOut' | 'slideOutDown' | 'slideOutRight';

type ReanimatedModalProps = ViewProps &
    GestureProps &
    GestureHandlerProps & {
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

        /** Enum for animation type when modal appears */
        animationIn?: AnimationIn;

        /** Duration of the animation when modal appears */
        animationInTiming?: number;

        /** Enum for animation type when modal disappears */
        animationOut?: AnimationOut;

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

        /** Modal type */
        type?: ValueOf<typeof CONST.MODAL.MODAL_TYPE>;

        /** Whether to prevent scroll on focus */
        shouldPreventScrollOnFocus?: boolean;

        /** Whether to use a custom backdrop for the modal? (This prevents focus issues on desktop) */
        initialFocus?: FocusTrapOptions['initialFocus'];

        /**
         * Whether the modal should enable the new focus manager.
         * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
         * */
        shouldEnableNewFocusManagement?: boolean;

        /** Whether to ignore the back handler during transition */
        shouldIgnoreBackHandlerDuringTransition?: boolean;
    };

type BackdropProps = {
    /** Style applied to the modal backdrop */
    style: StyleProp<ViewStyle>;

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

    /** Opacity of the backdrop */
    backdropOpacity?: number;

    /** Shows backdrop content */
    isBackdropVisible: boolean;
};

type ContainerProps = {
    /** This function is called by open animation callback */
    onOpenCallBack: () => void;

    /** This function is called by close animation callback */
    onCloseCallBack: () => void;

    /** Position animated by pan gesture */
    panPosition?: {translateX: SharedValue<number>; translateY: SharedValue<number>};

    /** Animation played when modal shows */
    animationIn: AnimationIn;

    /** Animation played when modal disappears */
    animationOut: AnimationOut;
};

export default ReanimatedModalProps;
export type {BackdropProps, ContainerProps, GestureHandlerProps, AnimationIn, AnimationOut, SwipeDirection};
