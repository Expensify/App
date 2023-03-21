import {StatusBar} from 'react-native';

export default function getSafeAreaPaddingTop(insets, statusBarTranslucent) {
    return (statusBarTranslucent && StatusBar.currentHeight) || 0;
}
