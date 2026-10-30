import getClipboardText from '@libs/Clipboard/getClipboardText';
import SelectionScraper from '@libs/SelectionScraper';

import {useEffect} from 'react';

function hasSelectionWithinEditableTarget(target: EventTarget | null) {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return target.selectionStart !== null && target.selectionEnd !== null && target.selectionStart !== target.selectionEnd;
    }

    if (!(target instanceof HTMLElement) || !target.isContentEditable) {
        return false;
    }

    const selection = window.getSelection();
    return !!selection && (target.contains(selection.anchorNode) || target.contains(selection.focusNode));
}

function copySelectionToClipboard(event: ClipboardEvent) {
    if (event.defaultPrevented || !event.clipboardData || hasSelectionWithinEditableTarget(event.target)) {
        return;
    }

    const selection = SelectionScraper.getCurrentSelection();
    if (!selection) {
        return;
    }

    const clipboardText = getClipboardText(selection);
    event.preventDefault();
    event.clipboardData.clearData();
    event.clipboardData.setData('text/html', selection);
    event.clipboardData.setData('text/plain', clipboardText);
}

let copySelectionEventConsumerCount = 0;

export default function useCopySelectionEvent() {
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        if (copySelectionEventConsumerCount === 0) {
            document.addEventListener('copy', copySelectionToClipboard);
        }
        copySelectionEventConsumerCount += 1;

        return () => {
            copySelectionEventConsumerCount -= 1;
            if (copySelectionEventConsumerCount === 0) {
                document.removeEventListener('copy', copySelectionToClipboard);
            }
        };
    }, []);
}
