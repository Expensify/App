import {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';
import useThemeStyles from './useThemeStyles';

// This hook is useful for adding extra bottom padding to a component based on the device's safe area
// If the device's safe area padding bottom is 0, the hook returns 0. Otherwise, it provides a padding bottom of 20.
// Use this to ensure content visibility and layout consistency across different devices.
const useSafePaddingBottomStyle = (): ViewStyle => {
    const styles = useThemeStyles();
    const {paddingBottom} = useStyledSafeAreaInsets();

    const extraPaddingBottomStyle = useMemo(() => {
        // Do not add extra padding at the bottom if the keyboard is open or if there is no safe area bottom padding style.
        if (!paddingBottom) {
            return {};
        }
        return styles.pb5;
    }, [paddingBottom, styles.pb5]);
    return extraPaddingBottomStyle;
};
const useSafePaddingBottomValue = () => {
    const style = useSafePaddingBottomStyle();

    return style.paddingBottom ?? 0;
};

export {useSafePaddingBottomValue};
export default useSafePaddingBottomStyle;
