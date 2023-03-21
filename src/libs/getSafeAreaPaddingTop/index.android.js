import {StatusBar} from 'react-native';

export default function getSafeAreaPaddingTop() {
    return StatusBar.currentHeight || 0;
}
