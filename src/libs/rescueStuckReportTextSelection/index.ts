/**
 * Chrome drops a drag-selection that starts in the blank LHN (or collapses one when a row's hover
 * menu mounts) by anchoring on an empty element. While the primary button is down, rebuild the range
 * from the report text under the pointer so the selection survives that.
 */
const REPORT_ACTIONS_LIST_SELECTOR = '[data-testid="report-actions-list"], [data-testid="money-request-report-actions-list"]';

type TextPoint = {
    node: Text;
    offset: number;
};

type CaretPositionFromPoint = (x: number, y: number) => {offsetNode: Node; offset: number} | null;

let primaryPointerDown = false;
let selectionAnchor: TextPoint | null = null;
let didTakeOverSelection = false;

function isTextNode(node: Node | null | undefined): node is Text {
    return !!node && node.nodeType === Node.TEXT_NODE;
}

function getCaretRange(x: number, y: number): Range | null {
    const caretPositionFromPoint = (document as Document & {caretPositionFromPoint?: CaretPositionFromPoint}).caretPositionFromPoint;
    if (typeof caretPositionFromPoint !== 'function') {
        return null;
    }

    const position = caretPositionFromPoint.call(document, x, y);
    if (!position) {
        return null;
    }

    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
}

function getReportTextPoint(x: number, y: number): TextPoint | null {
    const range = getCaretRange(x, y);
    const node = range?.startContainer;
    if (!isTextNode(node)) {
        return null;
    }

    if (!(node.textContent ?? '').trim()) {
        return null;
    }

    if (!node.parentElement?.closest(REPORT_ACTIONS_LIST_SELECTOR)) {
        return null;
    }

    return {node, offset: range?.startOffset ?? 0};
}

function onMouseDown(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    primaryPointerDown = true;
    // Keep the glyph under the press as the anchor. Waiting for the first move drops a short message when the pointer has already entered the next row.
    selectionAnchor = getReportTextPoint(event.clientX, event.clientY);
    didTakeOverSelection = false;
}

function onMouseMove(event: MouseEvent) {
    if (!primaryPointerDown || event.buttons !== 1) {
        return;
    }

    const caret = getReportTextPoint(event.clientX, event.clientY);
    if (!caret) {
        return;
    }

    const selection = window.getSelection();
    if (!selection) {
        return;
    }

    const anchorNode = selection.anchorNode;
    const anchorIsLiveText = isTextNode(anchorNode) && document.contains(anchorNode);
    // Chrome anchors a cross-pane drag on an empty element. A live text anchor means the browser is already selecting, including a still-collapsed caret at the start of an in-pane drag.
    const isSelectionStuck = !anchorIsLiveText;

    if (!selectionAnchor || !document.contains(selectionAnchor.node)) {
        selectionAnchor = caret;
    }

    if (!isSelectionStuck && !didTakeOverSelection) {
        if (isTextNode(anchorNode)) {
            selectionAnchor = {node: anchorNode, offset: selection.anchorOffset};
        }
        return;
    }

    const anchorOffset = Math.min(selectionAnchor.offset, selectionAnchor.node.textContent?.length ?? 0);
    const caretOffset = Math.min(caret.offset, caret.node.textContent?.length ?? 0);
    try {
        // extend() loses to Chrome's drag update, so replace the empty-element anchor directly.
        selection.setBaseAndExtent(selectionAnchor.node, anchorOffset, caret.node, caretOffset);
        didTakeOverSelection = true;
    } catch {
        selectionAnchor = caret;
    }
}

function onMouseUp() {
    primaryPointerDown = false;
    selectionAnchor = null;
    didTakeOverSelection = false;
}

export default function installRescueStuckReportTextSelection(): () => void {
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, true);

    return () => {
        document.removeEventListener('mousedown', onMouseDown, true);
        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('mouseup', onMouseUp, true);
        onMouseUp();
    };
}
