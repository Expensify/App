import {useEffect} from 'react';
import Clipboard from '@libs/Clipboard';
import getPlatform from '@libs/getPlatform';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Parser from '@libs/Parser';
import SelectionScraper from '@libs/SelectionScraper';
import CONST from '@src/CONST';

function copySelectionToClipboard() {
    const selection = SelectionScraper.getCurrentSelection();
    if (!selection) {
        return;
    }
    // Web-only fix: use plain text in text/plain, keep markdown on native to preserve behavior.
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;
    const htmlPlainText = Parser.htmlToText(selection);
    const plainText = isWeb ? htmlPlainText : Parser.htmlToMarkdown(selection);
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(plainText);
        return;
    }
    Clipboard.setHtml(selection, htmlPlainText);
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
