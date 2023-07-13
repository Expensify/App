import {useEffect} from 'react';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import Clipboard from '../libs/Clipboard';
import SelectionScraper from '../libs/SelectionScraper';

export default function useCopySelectionHelper() {
    useEffect(() => {
        const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;
        const unsubscribeCopyShortcut = KeyboardShortcut.subscribe(
            copyShortcutConfig.shortcutKey,
            copySelectionToClipboard,
            copyShortcutConfig.descriptionKey,
            copyShortcutConfig.modifiers,
            false,
        );

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

        return () => {
            if (!unsubscribeCopyShortcut) {
                return;
            }

            unsubscribeCopyShortcut();
        };
    }, []);
}
