import Clipboard from '@react-native-clipboard/clipboard';

import type {CanSetHtml, SetHtml, SetString} from './types';

/**
 * Sets a string on the Clipboard object via @react-native-clipboard/clipboard
 */
const setString: SetString = async (text) => {
    try {
        // The native bridge confirms invocation, not eventual OS clipboard persistence.
        Clipboard.setString(text);
        return true;
    } catch {
        return false;
    }
};

// We don't want to set HTML on native platforms so noop them.
const canSetHtml: CanSetHtml = () => false;
const setHtml: SetHtml = () => {};

export default {
    setString,
    canSetHtml,
    setHtml,
};
