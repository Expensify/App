import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';

import variables from '@styles/variables';

import type ScrollTappedLineIntoView from './types';

/** Gap kept between the tapped line and the keyboard, so the line doesn't sit flush against it. */
const TAPPED_LINE_BOTTOM_MARGIN = variables.lineHeightXLarge;

/**
 * Scrolls the form so that the line the user tapped stays above the keyboard.
 *
 * The prompt input is laid out at its full content height inside the form's scroll view, so it can't scroll its own
 * content: when the keyboard covers the tapped line, only the form can bring it back into view. The tapped line sits at
 * a fixed distance from the top of the input, so its position on screen follows the input as the form scrolls.
 */
const scrollTappedLineIntoView: ScrollTappedLineIntoView = ({formRef, inputRef, tapOffsetInInput, scrollOffsetRef, keyboardTop}) => {
    if (tapOffsetInInput === undefined || !isTextInputFocused(inputRef)) {
        return;
    }
    inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const hiddenByKeyboard = pageY + tapOffsetInInput + TAPPED_LINE_BOTTOM_MARGIN - keyboardTop;
        if (hiddenByKeyboard <= 0) {
            return;
        }
        formRef.current?.scrollTo(scrollOffsetRef.current + hiddenByKeyboard);
    });
};

export default scrollTappedLineIntoView;
