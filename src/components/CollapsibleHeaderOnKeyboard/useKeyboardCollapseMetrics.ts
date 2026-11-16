import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {SharedValue} from 'react-native-reanimated';

import {useEffect} from 'react';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';

type KeyboardCollapseMetrics = {
    /** Keyboard offset from the bottom of the window. Negative while the keyboard is open. */
    keyboardHeightSV: SharedValue<number>;

    /** Keyboard animation progress, 0 when closed and 1 when fully open. */
    keyboardProgressSV: SharedValue<number>;

    /** Window height minus the top safe area inset, i.e. the height the content is laid out in. */
    availableWindowHeightSV: SharedValue<number>;

    /** UI-thread mirror of the caller's `collapsibleHeaderOffset` prop. */
    collapsibleHeaderOffsetSV: SharedValue<number>;
};

function useKeyboardCollapseMetrics(collapsibleHeaderOffset: number): KeyboardCollapseMetrics {
    const {height: keyboardHeightSV, progress: keyboardProgressSV} = useReanimatedKeyboardAnimation();

    const {windowHeight} = useWindowDimensions();
    const {top: topSafeAreaInset} = useSafeAreaInsets();
    const availableWindowHeight = windowHeight - topSafeAreaInset;

    const availableWindowHeightSV = useSharedValue(availableWindowHeight);
    const collapsibleHeaderOffsetSV = useSharedValue(collapsibleHeaderOffset);
    useEffect(() => {
        availableWindowHeightSV.set(availableWindowHeight);
    }, [availableWindowHeight, availableWindowHeightSV]);
    useEffect(() => {
        collapsibleHeaderOffsetSV.set(collapsibleHeaderOffset);
    }, [collapsibleHeaderOffset, collapsibleHeaderOffsetSV]);

    return {keyboardHeightSV, keyboardProgressSV, availableWindowHeightSV, collapsibleHeaderOffsetSV};
}

export default useKeyboardCollapseMetrics;
