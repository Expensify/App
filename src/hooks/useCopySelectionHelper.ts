import {useEffect} from 'react';
import Clipboard from '@libs/Clipboard';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Parser from '@libs/Parser';
import SelectionScraper from '@libs/SelectionScraper';
import CONST from '@src/CONST';

function copySelectionToClipboard() {
    const selection = SelectionScraper.getCurrentSelection();
    if (!selection) {
        return;
    }
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(Parser.htmlToMarkdown(selection));
        return;
    }
    Clipboard.setHtml(selection, Parser.htmlToText(selection));
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
