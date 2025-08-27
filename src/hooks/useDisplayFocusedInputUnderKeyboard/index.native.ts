import {useRef} from 'react';
import type {View} from 'react-native';
import {Dimensions, Platform} from 'react-native';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';
import SplitListItem from '@components/SelectionList/SplitListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
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

    useKeyboardHandler({
        onStart: (e) => {
            'worklet';

            keyboardHeight.set(e.height);
        },
        onMove: (e) => {
            'worklet';

            keyboardHeight.set(e.height);
        },
        onEnd: (e) => {
            'worklet';

            keyboardHeight.set(e.height);
        },
    });

    const scrollToFocusedInput = () => {
        if (!viewRef.current) {
            return;
        }

        viewRef.current.measureInWindow((x, y, width, height /* measureInWindow callback requires all 4 parameters (x, y, width, height) - cannot omit first 3 */) => {
            footerRef.current?.measureInWindow((footerX, footerY, footerWidth, footerHeight /* same as above */) => {
                const keyboardHeightValue = keyboardHeight.get();
                if (keyboardHeightValue >= 1.0) {
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
