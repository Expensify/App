import {isMobileChrome} from '@libs/Browser';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import SelectionScraper from '@libs/SelectionScraper';

import CONST from '@src/CONST';

import {useEffect} from 'react';

const copyableTextSelector = `[data-${CONST.COPYABLE_TEXT_ELEMENT}=true]`;
const copyableRowSelector = `[data-${CONST.COPYABLE_ROW_ELEMENT}=true]`;

let copyableSelectionAnchor: {node: Node; offset: number} | null = null;

function isCopyableTextNode(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    return !!element?.closest(copyableTextSelector)?.closest(copyableRowSelector);
}

function preserveCopyableSelectionAnchor() {
    const selection = window.getSelection();
    if (!selection?.anchorNode || selection.isCollapsed) {
        copyableSelectionAnchor = null;
        return;
    }

    if (isCopyableTextNode(selection.anchorNode)) {
        copyableSelectionAnchor = {node: selection.anchorNode, offset: selection.anchorOffset};
        return;
    }

    // Android Chrome can move the start of an extended selection to an empty layout element
    // when its handle reaches the fixed header or composer while scrolling.
    if (!copyableSelectionAnchor?.node.isConnected || selection.anchorNode.nodeType !== Node.ELEMENT_NODE || selection.anchorNode.textContent?.trim() || !selection.focusNode) {
        copyableSelectionAnchor = null;
        return;
    }

    selection.setBaseAndExtent(copyableSelectionAnchor.node, copyableSelectionAnchor.offset, selection.focusNode, selection.focusOffset);
}

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
            if (isMobileChrome()) {
                document.addEventListener('selectionchange', preserveCopyableSelectionAnchor);
            }
        }
        copySelectionEventConsumerCount += 1;

        return () => {
            copySelectionEventConsumerCount -= 1;
            if (copySelectionEventConsumerCount === 0) {
                document.removeEventListener('copy', copySelectionToClipboard);
                document.removeEventListener('selectionchange', preserveCopyableSelectionAnchor);
                copyableSelectionAnchor = null;
            }
        };
    }, []);
}
