import {StatusBar} from 'react-native';

/**
 * Returns safe area padding top to use for a View
 *
 * @param {Object} insets
 * @param {Boolean} statusBarTranslucent
 * @returns {Number}
 */
export default function getSafeAreaPaddingTop(insets, statusBarTranslucent) {
    return (statusBarTranslucent && StatusBar.currentHeight) || 0;
}
