import type {FormRef} from '@components/Form/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';

import type {RefObject} from 'react';

type ScrollTappedLineIntoViewParams = {
    /** Form that owns the scroll view the input lives in */
    formRef: RefObject<FormRef | null>;

    /** The multiline input that was tapped */
    inputRef: RefObject<AnimatedTextInputRef | null>;

    /** Distance from the top of the input to the line the user tapped, or undefined when the input wasn't tapped */
    tapOffsetInInput: number | undefined;

    /** Current scroll offset of the form */
    scrollOffsetRef: RefObject<number>;

    /** Y position of the top edge of the keyboard */
    keyboardTop: number;
};

type ScrollTappedLineIntoView = (params: ScrollTappedLineIntoViewParams) => void;

export default ScrollTappedLineIntoView;
