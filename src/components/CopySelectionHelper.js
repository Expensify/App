import React from 'react';
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
        const selectionMarkdown = SelectionScraper.getAsMarkdown();
        Clipboard.setString(selectionMarkdown);
    }

    render() {
        return null;
    }
}

export default CopySelectionHelper;
