import type {LayoutChangeEvent} from 'react-native';

import {useRef} from 'react';
import {TextInput} from 'react-native';

import type {UseKeepSubmitButtonInView} from './types';

// The space kept above the focused input, so its label stays visible too
const FOCUSED_INPUT_TOP_SPACING = 20;

/**
 * Android scrolls only the focused input into view, so the submit button at the end of a long form stays under the keyboard.
 * When the keyboard shrinks the scroll view, or the content grows while an input is focused, the form scrolls to its end,
 * as long as the focused input stays visible.
 */
const useKeepSubmitButtonInView: UseKeepSubmitButtonInView = ({isEnabled, scrollViewRef, contentRef}) => {
    const viewportHeightRef = useRef(0);
    const contentHeightRef = useRef(0);

    if (!isEnabled) {
        return {};
    }

    const scrollToEndIfFocusedInputStaysVisible = () => {
        const focusedInput = TextInput.State.currentlyFocusedInput();
        const content = contentRef.current;
        const maxScrollOffset = contentHeightRef.current - viewportHeightRef.current;
        if (!focusedInput || !content || maxScrollOffset <= 0) {
            return;
        }

        // The measurement fails for an input outside of this form, which leaves the scroll position alone
        focusedInput.measureLayout(content, (_left, top) => {
            if (top - FOCUSED_INPUT_TOP_SPACING < maxScrollOffset) {
                return;
            }
            // The native content may not have its new height yet, so the scroll waits for the next frame
            requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({animated: false}));
        });
    };

    return {
        onLayout: (event: LayoutChangeEvent) => {
            const {height} = event.nativeEvent.layout;
            const hasShrunk = height < viewportHeightRef.current;
            viewportHeightRef.current = height;
            if (hasShrunk) {
                scrollToEndIfFocusedInputStaysVisible();
            }
        },
        onContentSizeChange: (_width: number, height: number) => {
            const hasGrown = height > contentHeightRef.current;
            contentHeightRef.current = height;
            if (hasGrown) {
                scrollToEndIfFocusedInputStaysVisible();
            }
        },
    };
};

export default useKeepSubmitButtonInView;
