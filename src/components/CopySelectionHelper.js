import React from 'react';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import Clipboard from '../libs/Clipboard';
import SelectionScraper from '../libs/SelectionScraper';

class CopySelectionHelper extends React.Component {
    componentDidMount() {
        const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;
        this.unsubscribeCopyShortcut = KeyboardShortcut.subscribe(
            copyShortcutConfig.shortcutKey,
            this.copySelectionToClipboard,
            copyShortcutConfig.descriptionKey,
            copyShortcutConfig.modifiers,
            false,
        );
    }

    componentWillUnmount() {
        if (!this.unsubscribeCopyShortcut) {
            return;
        }

        this.unsubscribeCopyShortcut();
    }

    copySelectionToClipboard() {
        const selection = SelectionScraper.getCurrentSelection();
        if (!selection) {
            return;
        }
        const parser = new ExpensiMark();
        if (!Clipboard.canSetHtml()) {
            Clipboard.setString(parser.htmlToMarkdown(selection));
            return;
        }

        // Replace doubled newlines with the single ones because selection from SelectionScraper html contains doubled <br/> marks
        Clipboard.setHtml(selection, Str.htmlDecode(parser.htmlToText(selection).replace(/\n\n/g, '\n')));
    }

    render() {
        return null;
    }
}

export default CopySelectionHelper;
