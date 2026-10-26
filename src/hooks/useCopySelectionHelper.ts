import Clipboard from '@libs/Clipboard';
import formatClipboardContent from '@libs/Clipboard/formatClipboardContent';
import SelectionScraper from '@libs/SelectionScraper';

import CONST from '@src/CONST';

import useKeyboardShortcut from './useKeyboardShortcut';

function copySelectionToClipboard() {
    const selection = SelectionScraper.getCurrentSelection();
    if (!selection) {
        return;
    }
    const {html, plainText} = formatClipboardContent({html: selection});
    if (!plainText) {
        return;
    }
    if (!html || !Clipboard.canSetHtml()) {
        Clipboard.setString(plainText);
        return;
    }
    Clipboard.setHtml(html, plainText);
}

export default function useCopySelectionHelper() {
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.COPY, copySelectionToClipboard, {captureOnInputs: false});
}
