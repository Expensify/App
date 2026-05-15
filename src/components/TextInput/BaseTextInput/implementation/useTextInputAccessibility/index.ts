import {useMemo} from 'react';
import type TextInputAccessibilityResult from './type';

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
