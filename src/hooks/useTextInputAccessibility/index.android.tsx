import type {ReactNode} from 'react';
import React, {useId} from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type TextInputAccessibilityResult from './type';

/**
 * Android implementation: omits accessibilityValue (Android's EditText natively exposes its text to TalkBack)
 * and instead uses a hidden Text element with accessibilityLabelledBy so TalkBack always announces the label,
 * even when the input already contains a value.
 */
function useTextInputAccessibility(value: string | undefined, accessibilityLabel: string): TextInputAccessibilityResult {
    const styles = useThemeStyles();
    const labelId = useId();
    const labelNativeID = accessibilityLabel ? `label-${labelId}` : undefined;

    let hiddenLabel: ReactNode = null;
    if (accessibilityLabel) {
        hiddenLabel = (
            <Text
                nativeID={labelNativeID}
                importantForAccessibility="yes"
                style={styles.visuallyHidden}
            >
                {accessibilityLabel}
            </Text>
        );
    }

    return {
        accessibilityValue: undefined,
        accessibilityLabelledBy: labelNativeID,
        hiddenLabel,
    };
}

export default useTextInputAccessibility;
