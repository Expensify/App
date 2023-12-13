import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {useEffect} from 'react';
import Clipboard from '@libs/Clipboard';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import SelectionScraper from '@libs/SelectionScraper';
import CONST from '@src/CONST';

function copySelectionToClipboard() {
    const selection = SelectionScraper.getCurrentSelection();
    if (!selection) {
        return;
    }
    const parser = new ExpensiMark();
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(parser.htmlToMarkdown(selection));
        return;
    }
    Clipboard.setHtml(selection, parser.htmlToText(selection));
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
