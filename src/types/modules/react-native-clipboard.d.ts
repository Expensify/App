declare module '@react-native-clipboard/clipboard/jest/clipboard-mock' {
    import type Clipboard from '@react-native-clipboard/clipboard';

    const mockClipboard: typeof Clipboard;

    export default mockClipboard;
}
