// Mobile implementation to match the web lib, this will open the URL in the browser

import {Linking} from 'react-native';

/**
 * @param {String} href
 */
const openURLInNewTab = (href) => {
    Linking.openURL(href);
};

export default openURLInNewTab;
