// on Web/desktop this import will be replaced with `react-native-web`
import {Clipboard} from 'react-native-web';
import lodashGet from 'lodash/get';

const canSetHtml = () => lodashGet(navigator, 'clipboard.write');

/**
 * Sets a string on the Clipboard object via react-native-web
 *
 * @param {String} text
 */
const setString = (text) => {
    Clipboard.setString(text);
};

export default {
    setString,
    canSetHtml,
};
