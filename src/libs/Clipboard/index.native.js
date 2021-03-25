import base from '@react-native-community/clipboard';

class Clipboard extends base {
    /**
     * Noop on native platforms
     *
     * @static
     * @returns {Boolean}
     * @memberof Clipboard
     */
    static setImage() {
        return null;
    }
}

export default Clipboard;
