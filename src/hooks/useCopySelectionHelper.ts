import {useEffect} from 'react';
import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import SelectionScraper from '@libs/SelectionScraper';
import CONST from '@src/CONST';

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
    useEffect(() => {
        const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;
        const unsubscribeCopyShortcut = KeyboardShortcut.subscribe(
            copyShortcutConfig.shortcutKey,
            copySelectionToClipboard,
            copyShortcutConfig.descriptionKey,
            [...copyShortcutConfig.modifiers],
            false,
        );

        return () => {
            unsubscribeCopyShortcut();
        };
    }, []);
}
