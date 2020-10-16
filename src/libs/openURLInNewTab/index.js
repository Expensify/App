/**
 * On web, the Linking.openURL implementation does not open a URL in a new tab by default. This lib allows for that
 * functionality.
 */

/**
 * @param {String} href
 */
const openURLInNewTab = (href) => {
    window.open(href, '_blank');
};

export default openURLInNewTab;
