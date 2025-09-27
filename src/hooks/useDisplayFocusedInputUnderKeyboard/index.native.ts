import {useRef} from 'react';
import type {View} from 'react-native';
import {Dimensions, Platform} from 'react-native';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';
import SplitListItem from '@components/SelectionListWithSections/SplitListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import {FOOTER_BOTTOM_MARGIN, MARGIN_FROM_INPUT_ANDROID, MARGIN_FROM_INPUT_IOS} from './const';
import type UseDisplayFocusedInputUnderKeyboardType from './types';

const useDisplayFocusedInputUnderKeyboard = (): UseDisplayFocusedInputUnderKeyboardType => {
    const screenHeight = Dimensions.get('window').height;
    const viewRef = useRef<View>(null);
    const bottomOffset = useRef(0);
    const footerRef = useRef<View>(null);
    const keyboardHeight = useSharedValue(0);
    const safeAreaPaddings = useSafeAreaPaddings();
    const listRef = useRef<SelectionListHandle>(null);

    const changeKeyboardHeight = ({height}: {height: number}) => {
        'worklet';

        keyboardHeight.set(height);
    };

    useKeyboardHandler({
        onStart: changeKeyboardHeight,
        onMove: changeKeyboardHeight,
        onEnd: changeKeyboardHeight,
    });

    const scrollToFocusedInput = () => {
        if (!viewRef.current) {
            return;
        }

        viewRef.current.measureInWindow((_x, _y, _width, height) => {
            footerRef.current?.measureInWindow((_footerX, _footerY, _footerWidth, footerHeight) => {
                if (keyboardHeight.get() >= 1.0) {
                    return;
                }
                bottomOffset.current =
                    screenHeight -
                    safeAreaPaddings.paddingBottom -
                    safeAreaPaddings.paddingTop -
                    height +
                    footerHeight +
                    Platform.select({ios: MARGIN_FROM_INPUT_IOS, default: MARGIN_FROM_INPUT_ANDROID}) +
                    FOOTER_BOTTOM_MARGIN;
            });
        });
    };

    return {
        listRef,
        viewRef,
        footerRef,
        bottomOffset,
        scrollToFocusedInput,
        SplitListItem,
    };
};

export default useDisplayFocusedInputUnderKeyboard;
