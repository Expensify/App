import type GetNativeHiddenAccessibilityProps from './types';

const getNativeHiddenAccessibilityProps: GetNativeHiddenAccessibilityProps = (enableNativeDisabled, isDisabledOrLoading) => {
    if (!enableNativeDisabled || !isDisabledOrLoading) {
        return undefined;
    }

    return {
        accessible: false,
        focusable: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
    };
};

export default getNativeHiddenAccessibilityProps;
