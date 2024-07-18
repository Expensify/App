import Clipboard from '@react-native-clipboard/clipboard';
import type {CanSetHtml, GetImage, SetHtml, SetString} from './types';

/**
 * Sets a string on the Clipboard object via @react-native-clipboard/clipboard
 */
const setString: SetString = (text) => {
    Clipboard.setString(text);
};

// We don't want to set HTML on native platforms so noop them.
const canSetHtml: CanSetHtml = () => false;
const setHtml: SetHtml = () => {};

const getImage: GetImage = () => {
    return Clipboard.getImage().then((imageb64) => {
        if (!imageb64) {
            return undefined;
        }
        return {uri: imageb64, name: 'image.png', type: 'image/png'};
    });
};

export default {
    setString,
    canSetHtml,
    setHtml,
    getImage,
};
