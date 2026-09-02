import type {LayoutChangeEvent} from 'react-native';

import {useCallback, useState} from 'react';
import {useWindowDimensions} from 'react-native-keyboard-controller';

type UseOdometerKeyboardVerticalOffsetResult = {
    /** How much space `KeyboardAvoidingView` should reserve above the keyboard. */
    keyboardVerticalOffset: number;

    /** Pass to the `onLayout` of the same view `KeyboardAvoidingView` wraps. */
    onLayout: (e: LayoutChangeEvent) => void;
};

/**
 * KeyboardAvoidingView measures its position relative to its parent, not the screen, so without an offset it
 * under-reserves space and the buttons end up behind the keyboard. `windowHeight - ownY - ownHeight` derives that
 * offset from the view's own layout and the same window-height source the library's internal padding math uses.
 */
export default function useOdometerKeyboardVerticalOffset(): UseOdometerKeyboardVerticalOffsetResult {
    const {height: windowHeight} = useWindowDimensions();
    const [ownY, setOwnY] = useState(0);
    const [ownHeight, setOwnHeight] = useState(0);
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        setOwnY(e.nativeEvent.layout.y);
        setOwnHeight(e.nativeEvent.layout.height);
    }, []);

    return {keyboardVerticalOffset: windowHeight - ownY - ownHeight, onLayout};
}
