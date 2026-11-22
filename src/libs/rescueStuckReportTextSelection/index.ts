/**
 * Chrome drops a drag-selection that starts in the blank LHN (or collapses one when a row's hover
 * menu mounts) by anchoring on an empty element. While the primary button is down, rebuild the range
 * from the report text under the pointer so the selection survives that. Current Safari has the same
 * caret API, so this only arms for a press in the list or the LHN. A composer drag stays with the browser.
 */
import CONST from '@src/CONST';

const REPORT_ACTIONS_LIST_SELECTOR = `[data-testid="${CONST.TEST_ID.REPORT_ACTIONS_LIST}"], [data-testid="${CONST.TEST_ID.MONEY_REQUEST_REPORT_ACTIONS_LIST}"]`;
const RESCUE_DRAG_START_SELECTOR = `${REPORT_ACTIONS_LIST_SELECTOR}, [data-testid="${CONST.TEST_ID.BASE_SIDEBAR_SCREEN}"]`;

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

function shouldRescueDrag(target: EventTarget | null): boolean {
    let element: Element | null = null;
    if (target instanceof Element) {
        element = target;
    } else if (target instanceof Node) {
        element = target.parentElement;
    }
    if (!element) {
        return false;
    }
    // The composer is an input or contenteditable. Its anchor is not a text node, so taking over would steal a drag that starts there and moves into the chat.
    if (element.closest('input, textarea, [contenteditable="true"], [contenteditable=""]')) {
        return false;
    }
    return element.closest(RESCUE_DRAG_START_SELECTOR) !== null;
}

function onMouseDown(event: MouseEvent) {
    if (event.button !== 0 || !shouldRescueDrag(event.target)) {
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
