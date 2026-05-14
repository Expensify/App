import type {ReactNode} from 'react';
import {useMemo} from 'react';

type TextInputAccessibilityResult = {
    /** The accessibilityValue prop for the TextInput */
    accessibilityValue: {text: string} | undefined;

    /** The accessibilityLabelledBy prop for the TextInput (Android only) */
    accessibilityLabelledBy: string | undefined;

    /** A hidden label element to render before the TextInput (Android only) */
    hiddenLabel: ReactNode;
};

/**
 * Default (iOS) implementation: sets accessibilityValue so VoiceOver announces the entered value on re-focus.
 * No hidden label element or accessibilityLabelledBy is needed on iOS.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useTextInputAccessibility(value: string | undefined, _accessibilityLabel: string): TextInputAccessibilityResult {
    const accessibilityValue = useMemo(() => ({text: value ?? ''}), [value]);
    return {
        accessibilityValue,
        accessibilityLabelledBy: undefined,
        hiddenLabel: null,
    };
}

export default useTextInputAccessibility;
export type {TextInputAccessibilityResult};
