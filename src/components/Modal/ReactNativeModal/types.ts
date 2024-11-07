import type {ReactNode} from 'react';
import type {NativeSyntheticEvent, NativeTouchEvent, PanResponderGestureState, StyleProp, ViewProps, ViewStyle} from 'react-native';

type Orientation = 'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right';

type Direction = 'up' | 'down' | 'left' | 'right';
type PresentationStyle = 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
type OnOrientationChange = (orientation: NativeSyntheticEvent<any>) => void;

type OnSwipeCompleteParams = {
    swipingDirection: Direction;
};

type ModalProps = ViewProps & {
    children: ReactNode;
    onSwipeStart?: (gestureState: PanResponderGestureState) => void;
    onSwipeMove?: (percentageShown: number, gestureState: PanResponderGestureState) => void;
    onSwipeComplete?: (params: OnSwipeCompleteParams, gestureState: PanResponderGestureState) => void;
    onSwipeCancel?: (gestureState: PanResponderGestureState) => void;
    style?: StyleProp<ViewStyle>;
    swipeDirection?: Direction | Direction[];
    onDismiss?: () => void;
    onShow?: () => void;
    hardwareAccelerated?: boolean;
    onOrientationChange?: OnOrientationChange;
    presentationStyle?: PresentationStyle;

    // Default ModalProps Provided
    useNativeDriverForBackdrop?: boolean;

    animationIn?: string; // enum
    animationInTiming?: number;
    animationOut?: string; // enum
    animationOutTiming?: number;
    avoidKeyboard?: boolean;
    coverScreen?: boolean;
    hasBackdrop?: boolean;
    backdropColor?: string; // color
    backdropOpacity?: number;
    backdropTransitionInTiming?: number;
    backdropTransitionOutTiming?: number;
    customBackdrop?: ReactNode;
    useNativeDriver?: boolean;
    deviceHeight?: number;
    deviceWidth?: number;
    hideModalContentWhileAnimating?: boolean;
    propagateSwipe?: boolean | ((event?: GestureResponderEvent, gestureState?: PanResponderGestureState) => boolean);
    isVisible?: boolean;
    panResponderThreshold: 4;
    swipeThreshold?: 100;

    onModalShow?: () => void;
    onModalWillShow?: () => void;
    onModalHide?: () => void;
    onModalWillHide?: () => void;
    onBackdropPress?: () => void;
    onBackButtonPress?: () => void;
    scrollTo?: (e?: GestureResponderEvent) => void;
    scrollOffset?: number;
    scrollOffsetMax?: number;
    scrollHorizontal?: boolean;
    statusBarTranslucent?: boolean;
    supportedOrientations?: Orientation[];
};

type GestureResponderEvent = NativeSyntheticEvent<NativeTouchEvent>;
type AnimationEvent = (...args: any[]) => void;
type OrNull<T> = null | T;

export default ModalProps;
export type {GestureResponderEvent, AnimationEvent, Direction, OrNull, Orientation};
