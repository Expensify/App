import {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';
import useThemeStyles from './useThemeStyles';

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
