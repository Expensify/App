import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import SelectionScraper from '@libs/SelectionScraper';
import CONST from '@src/CONST';
import useKeyboardShortcut from './useKeyboardShortcut';

function copySelectionToClipboard() {
    const selection = SelectionScraper.getCurrentSelection();
    if (!selection) {
        return;
    }
    const clipboardText = getClipboardText(selection);
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(clipboardText);
        return;
    }
    Clipboard.setHtml(selection, clipboardText);
}

export default function useCopySelectionHelper() {
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.COPY, copySelectionToClipboard, {captureOnInputs: false});
}
