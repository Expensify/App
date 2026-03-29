import type GetNativeHiddenAccessibilityProps from './types';

const getNativeHiddenAccessibilityProps: GetNativeHiddenAccessibilityProps = (enableNativeDisabled, isDisabledOrLoading) => {
    if (!enableNativeDisabled || !isDisabledOrLoading) {
        return undefined;
    }

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-hidden': true,
    };
};

export default getNativeHiddenAccessibilityProps;
