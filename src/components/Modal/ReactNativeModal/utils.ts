import type {Orientation} from './types';

const defaultProps = {
    animationIn: 'slideInUp',
    animationInTiming: 300,
    animationOut: 'slideOutDown',
    animationOutTiming: 300,
    avoidKeyboard: false,
    coverScreen: true,
    hasBackdrop: true,
    backdropColor: 'black',
    backdropOpacity: 0.7,
    backdropTransitionInTiming: 300,
    backdropTransitionOutTiming: 300,
    customBackdrop: null,
    useNativeDriver: false,
    deviceHeight: null,
    deviceWidth: null,
    hideModalContentWhileAnimating: false,
    propagateSwipe: false,
    isVisible: false,
    panResponderThreshold: 4,
    swipeThreshold: 100,

    onModalShow: () => {},
    onModalWillShow: () => {},
    onModalHide: () => {},
    onModalWillHide: () => {},
    onBackdropPress: () => {},
    onBackButtonPress: () => {},
    scrollTo: null,
    scrollOffset: 0,
    scrollOffsetMax: 0,
    scrollHorizontal: false,
    statusBarTranslucent: false,
    supportedOrientations: ['portrait', 'landscape'] as Orientation[],
};

const reversePercentage = (x: number) => -(x - 1);

export {reversePercentage, defaultProps};
