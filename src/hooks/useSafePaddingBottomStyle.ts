import {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';
import useThemeStyles from './useThemeStyles';

// This hook is useful for adding extra bottom padding to a component based on the device's safe area
// If the device's safe area padding bottom is 0, the hook returns 0. Otherwise, it provides a padding bottom of 20.
// Use this to ensure content visibility and layout consistency across different devices.
const useSafePaddingBottomStyle = () => {
    const styles = useThemeStyles();
    const [willKeyboardShow, setWillKeyboardShow] = useState<boolean>(false);
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
            setWillKeyboardShow(true);
        });
        const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
            setWillKeyboardShow(false);
        });
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    const {paddingBottom} = useStyledSafeAreaInsets();

    const extraPaddingBottomStyle = useMemo(() => {
        // Do not add extra padding at the bottom if the keyboard is open or if there is no safe area bottom padding style.
        if (willKeyboardShow || !paddingBottom) {
            return {};
        }
        return styles.pb5;
    }, [willKeyboardShow, paddingBottom, styles.pb5]);
    return extraPaddingBottomStyle;
};

export default useSafePaddingBottomStyle;
