import type {FormRef} from '@components/Form/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';

import useKeyboardState from '@hooks/useKeyboardState';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {RefObject} from 'react';
import type {GestureResponderEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useEffect, useRef} from 'react';

import scrollTappedLineIntoView from './scrollTappedLineIntoView';

/**
 * Keeps the line the user tapped in a long multiline input visible once the keyboard has opened, and returns the props
 * that wire it up. Without this, tapping a line low in the input leaves it behind the keyboard.
 *
 * @param formRef - the form that owns the scroll view the input lives in
 */
function useScrollTappedLineIntoView(formRef: RefObject<FormRef | null>) {
    const inputRef = useRef<AnimatedTextInputRef | null>(null);
    const tapOffsetInInputRef = useRef<number | undefined>(undefined);
    const scrollOffsetRef = useRef(0);
    const hasScrolledForKeyboardRef = useRef(false);
    const {isKeyboardShown, keyboardHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();

    useEffect(() => {
        if (!isKeyboardShown) {
            hasScrolledForKeyboardRef.current = false;
            return;
        }
        // The keyboard height keeps changing after it opened (e.g. when the autocorrect bar shows up), but the tapped
        // line only has to be brought back into view once, right after the keyboard covered it.
        if (hasScrolledForKeyboardRef.current) {
            return;
        }
        hasScrolledForKeyboardRef.current = true;
        scrollTappedLineIntoView({
            formRef,
            inputRef,
            tapOffsetInInput: tapOffsetInInputRef.current,
            scrollOffsetRef,
            keyboardTop: windowHeight - keyboardHeight,
        });
        // The tap is only worth following once, so a later keyboard that opens without one (e.g. the input is focused
        // programmatically) doesn't scroll back to a line the user tapped a while ago.
        tapOffsetInInputRef.current = undefined;
    }, [formRef, isKeyboardShown, keyboardHeight, windowHeight]);

    return {
        ref: inputRef,
        onPressIn: (event: GestureResponderEvent) => {
            const tapY = event.nativeEvent.pageY;
            // The input is taller than the screen, so the tap is stored relative to the input instead of the screen,
            // which keeps it valid no matter how the form scrolls before the keyboard is done opening.
            inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                tapOffsetInInputRef.current = tapY - pageY;
            });
        },
        onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        },
    };
}

export default useScrollTappedLineIntoView;
