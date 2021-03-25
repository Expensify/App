// on Web/desktop this import will be replaced with `react-native-web` so we have to import the named export;
import {Clipboard as base} from '@react-native-community/clipboard';


class Clipboard extends base {
    /**
     * Enable copying the images on Web/Desktop
     *
     * @static
     * @param {String} html
     * @returns {Boolean}
     * @memberof Clipboard
     */
    static setImage(html) {
        let success = false;
        const body = document.body;

        if (body) {
            // add the text to a hidden node
            const node = document.createElement('div');
            node.contentEditable = true;
            node.innerHTML = html;
            node.style.opacity = '0';
            node.style.position = 'absolute';
            node.style.whiteSpace = 'pre-wrap';
            node.style.userSelect = 'auto';
            body.appendChild(node);

            // select the text
            const selection = window.getSelection();
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.addRange(range);

            // attempt to copy
            try {
                document.execCommand('copy');
                success = true;
            // eslint-disable-next-line no-empty
            } catch (e) {}

            // remove selection and node
            selection.removeAllRanges();
            body.removeChild(node);
        }

        return success;
    }
}

export default Clipboard;
