import {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';
import useThemeStyles from './useThemeStyles';

const useExtraSafePaddingBottomStyle = () => {
    const styles = useThemeStyles();
    const [willKeyboardShow, setWillKeyboardShow] = useState(false);
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
        if (willKeyboardShow || paddingBottom) {
            return {};
        }
        return styles.pb5;
    }, [willKeyboardShow, paddingBottom]);
    return extraPaddingBottomStyle;
};

export default useExtraSafePaddingBottomStyle;
