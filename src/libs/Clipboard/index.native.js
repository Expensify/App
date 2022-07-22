import Clipboard from '@react-native-community/clipboard';

export default {
    ...Clipboard,

    // Native does not support HTML.
    canSetHtml: () => false,
    setHtml: () => {},
};
