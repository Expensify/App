import type {ReactNode} from 'react';

type TextInputAccessibilityResult = {
    /** The accessibilityValue prop for the TextInput */
    accessibilityValue: {text: string} | undefined;

    /** The accessibilityLabelledBy prop for the TextInput, defined on Android only */
    accessibilityLabelledBy: string | undefined;

    /** A hidden label element to render before the TextInput (Android only) */
    hiddenLabel: ReactNode;
};

export default TextInputAccessibilityResult;
