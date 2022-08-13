import Clipboard from '@react-native-community/clipboard';

export default {
    ...Clipboard,

    // We don't want to set HTML on native platforms so noop them.
    canSetHtml: () => false,
    setHtml: () => {},
};
