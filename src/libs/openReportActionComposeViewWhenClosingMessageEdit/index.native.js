import {Keyboard} from 'react-native';
import toggleReportActionComposeView from '../toggleReportActionComposeView';

export default (isSmallScreenWidth = true) => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        toggleReportActionComposeView(true, isSmallScreenWidth);
        keyboardDidHideListener.remove();
    });
};
