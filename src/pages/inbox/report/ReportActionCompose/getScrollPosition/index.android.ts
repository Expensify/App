import type {GetScrollPositionType} from './types';

// Use a stub function as react-native-keyboard-controller already accounts for the scroll position on Android.
function getScrollPosition(): GetScrollPositionType {
    return {
        scrollValue: 0,
    };
}

export default getScrollPosition;
