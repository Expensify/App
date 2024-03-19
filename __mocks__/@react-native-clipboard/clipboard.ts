import type ClipboardModule from '@react-native-clipboard/clipboard';
import MockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock';

const Clipboard: typeof ClipboardModule = MockClipboard;

export default Clipboard;
