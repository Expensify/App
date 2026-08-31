import CONST from '@src/CONST';

import type {ChildNode} from 'domhandler';

import render from 'dom-serializer';
import {DataNode, Element} from 'domhandler';
import {Str} from 'expensify-common';
import {parseDocument} from 'htmlparser2';
import {useRef} from 'react';

import type GetCurrentSelection from './types';

const markdownElements = new Set(['h1', 'strong', 'em', 'del', 'blockquote', 'q', 'code', 'pre', 'a', 'br', 'li', 'ul', 'ol', 'b', 'i', 's', 'mention-user']);
const tagAttribute = 'data-testid';
const hiddenElementAttribute = `data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}`;
const hiddenElementSelector = `[${hiddenElementAttribute}=true]`;
const COPYABLE_TEXT_SELECTOR = `[data-${CONST.COPYABLE_TEXT_ELEMENT}=true]`;
const COPYABLE_TEXT_DATA_SET = {[CONST.COPYABLE_TEXT_ELEMENT]: true} as const;
const COPYABLE_ROW_SELECTOR = `[data-${CONST.COPYABLE_ROW_ELEMENT}=true]`;
const COPYABLE_ROW_DATA_SET = {[CONST.COPYABLE_ROW_ELEMENT]: true} as const;

type SuppressCopyableTextRowPressOptions = {
    shouldSuppressOnMouseDown?: boolean;
};

function getCopyableTextElement(target: EventTarget | Node | null | undefined): HTMLElement | null {
    if (typeof HTMLElement === 'undefined') {
        return null;
    }

    try {
        if (target instanceof HTMLElement) {
            return target.closest(COPYABLE_TEXT_SELECTOR);
        }

        if (typeof Node !== 'undefined' && target instanceof Node) {
            return target.parentElement?.closest(COPYABLE_TEXT_SELECTOR) ?? null;
        }
    } catch {
        return null;
    }

    return null;
}

function isCopyableTextTarget(target: EventTarget | null | undefined): boolean {
    return !!getCopyableTextElement(target);
}

function getMouseEventPosition(event: unknown): {clientX: number; clientY: number} | null {
    if (typeof event !== 'object' || event === null) {
        return null;
    }

    if ('clientX' in event && 'clientY' in event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
        return {clientX: event.clientX, clientY: event.clientY};
    }

    if (!('nativeEvent' in event) || typeof event.nativeEvent !== 'object' || event.nativeEvent === null) {
        return null;
    }

    const {nativeEvent} = event;
    if ('clientX' in nativeEvent && 'clientY' in nativeEvent && typeof nativeEvent.clientX === 'number' && typeof nativeEvent.clientY === 'number') {
        return {clientX: nativeEvent.clientX, clientY: nativeEvent.clientY};
    }

    return null;
}

function getMouseEventTarget(event: unknown): EventTarget | null {
    if (typeof EventTarget === 'undefined' || typeof event !== 'object' || event === null || !('target' in event) || !(event.target instanceof EventTarget)) {
        return null;
    }

    return event.target;
}

function isMouseDownOnCopyableText(event: unknown): boolean {
    const position = getMouseEventPosition(event);
    const copyableElement = getCopyableTextElement(getMouseEventTarget(event));
    if (!position || !copyableElement || typeof document === 'undefined' || typeof NodeFilter === 'undefined') {
        return false;
    }

    const walker = document.createTreeWalker(copyableElement, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();

    while (textNode) {
        if (textNode.textContent?.trim()) {
            const range = document.createRange();
            range.selectNodeContents(textNode);

            const isInsideText = Array.from(range.getClientRects()).some(
                (rect) => position.clientX >= rect.left && position.clientX <= rect.right && position.clientY >= rect.top && position.clientY <= rect.bottom,
            );
            if (isInsideText) {
                return true;
            }
        }
        textNode = walker.nextNode();
    }

    return false;
}

// Row press handlers use this after mouseup/click to suppress navigation only for the drag-select gesture that started on copyable text.
function shouldSuppressCopyableTextPress(didMouseDownStartOnCopyableText: boolean): boolean {
    if (!didMouseDownStartOnCopyableText) {
        return false;
    }

    if (typeof window === 'undefined' || typeof window.getSelection !== 'function') {
        return false;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().length === 0) {
        return false;
    }

    const anchorCopyableElement = getCopyableTextElement(selection.anchorNode);
    const focusCopyableElement = getCopyableTextElement(selection.focusNode);
    return !!anchorCopyableElement || !!focusCopyableElement;
}

function useCopyableTextRowPress() {
    const wasMouseDownOnCopyableTextRef = useRef(false);

    const markMouseDownOnCopyableText = (target: EventTarget | null | undefined, shouldCheck = true): boolean => {
        const isCopyableTarget = shouldCheck && isCopyableTextTarget(target);
        wasMouseDownOnCopyableTextRef.current = isCopyableTarget;
        return isCopyableTarget;
    };

    const shouldSuppressCopyableTextRowPress = (shouldCheck = true, {shouldSuppressOnMouseDown = false}: SuppressCopyableTextRowPressOptions = {}): boolean => {
        const shouldSuppressPress =
            shouldCheck && wasMouseDownOnCopyableTextRef.current && (shouldSuppressOnMouseDown || shouldSuppressCopyableTextPress(wasMouseDownOnCopyableTextRef.current));
        wasMouseDownOnCopyableTextRef.current = false;
        return shouldSuppressPress;
    };

    // Pointer focus from copyable text should not make virtualized lists scroll the row into view.
    const shouldSuppressCopyableTextRowFocus = () => wasMouseDownOnCopyableTextRef.current;

    return {
        markMouseDownOnCopyableText,
        shouldSuppressCopyableTextRowFocus,
        shouldSuppressCopyableTextRowPress,
    };
}

function getCopyableElementText(element: globalThis.Element, selection: Selection): string {
    const elementRange = document.createRange();
    elementRange.selectNodeContents(element);
    const selectedText: string[] = [];

    for (let i = 0; i < selection.rangeCount; i++) {
        const intersectionRange = selection.getRangeAt(i).cloneRange();
        if (!intersectionRange.intersectsNode(element)) {
            continue;
        }

        if (intersectionRange.compareBoundaryPoints(globalThis.Range.START_TO_START, elementRange) < 0) {
            intersectionRange.setStart(elementRange.startContainer, elementRange.startOffset);
        }
        if (intersectionRange.compareBoundaryPoints(globalThis.Range.END_TO_END, elementRange) > 0) {
            intersectionRange.setEnd(elementRange.endContainer, elementRange.endOffset);
        }
        selectedText.push(intersectionRange.toString());
    }

    return selectedText
        .join(' ')
        .trim()
        .replaceAll(/[\t\n\r ]+/g, ' ');
}

function replaceElementContentWithLines(element: globalThis.Element, lines: string[]) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    for (const [index, line] of lines.entries()) {
        if (index > 0) {
            element.appendChild(document.createElement('br'));
        }
        element.appendChild(document.createTextNode(line));
    }
}

function getElementFromNode(node: globalThis.Node): globalThis.Element | null {
    if (node instanceof globalThis.Element) {
        return node;
    }

    return node.parentElement;
}

function getSelectedRowsForRange(range: Range): globalThis.Element[] {
    const rootElement = getElementFromNode(range.commonAncestorContainer);
    if (!rootElement) {
        return [];
    }

    // Use the live selection range so partially selected first/last grouped rows are still included.
    return [rootElement.closest(COPYABLE_ROW_SELECTOR), ...Array.from(rootElement.querySelectorAll(COPYABLE_ROW_SELECTOR))].filter(
        (row): row is globalThis.Element => !!row && range.intersectsNode(row),
    );
}

function isTopLevelCopyableElementForRow(copyableElement: globalThis.Element, row: globalThis.Element): boolean {
    if (!copyableElement.matches(COPYABLE_TEXT_SELECTOR) || copyableElement.closest(COPYABLE_ROW_SELECTOR) !== row) {
        return false;
    }

    const copyableAncestor = copyableElement.parentElement?.closest(COPYABLE_TEXT_SELECTOR);
    return !copyableAncestor || copyableAncestor.closest(COPYABLE_ROW_SELECTOR) !== row;
}

function getCopyableElementsForSelectedRow(row: globalThis.Element, range: Range): globalThis.Element[] {
    return [row, ...Array.from(row.querySelectorAll(COPYABLE_TEXT_SELECTOR))].filter(
        (copyableElement) => isTopLevelCopyableElementForRow(copyableElement, row) && range.intersectsNode(copyableElement),
    );
}

function getHTMLOfSelectedCopyableRows(selection: Selection): string {
    const selectedRows: globalThis.Element[] = [];
    const selectedCopyableElementsByRow = new Map<globalThis.Element, Set<globalThis.Element>>();

    // Build an ordered row -> cells map so multi-row copied output follows the visual table order.
    for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        for (const row of getSelectedRowsForRange(range)) {
            const copyableElements = getCopyableElementsForSelectedRow(row, range);
            if (copyableElements.length === 0) {
                continue;
            }

            if (!selectedCopyableElementsByRow.has(row)) {
                selectedRows.push(row);
                selectedCopyableElementsByRow.set(row, new Set());
            }

            const selectedCopyableElements = selectedCopyableElementsByRow.get(row);
            for (const copyableElement of copyableElements) {
                selectedCopyableElements?.add(copyableElement);
            }
        }
    }

    const selectedCopyableElementCount = Array.from(selectedCopyableElementsByRow.values()).reduce((count, copyableElements) => count + copyableElements.size, 0);
    if (selectedCopyableElementCount <= 1) {
        // Single-cell selections should preserve the browser's exact selected text instead of forcing full-cell output.
        return '';
    }

    const lines = selectedRows
        .map((row) =>
            [row, ...Array.from(row.querySelectorAll(COPYABLE_TEXT_SELECTOR))]
                .filter((copyableElement) => selectedCopyableElementsByRow.get(row)?.has(copyableElement))
                .map((copyableElement) => getCopyableElementText(copyableElement, selection))
                .filter((text) => !!text)
                .join(' '),
        )
        .filter((line) => !!line);

    if (lines.length === 0) {
        return '';
    }

    const div = document.createElement('div');
    replaceElementContentWithLines(div, lines);
    return div.innerHTML;
}

/**
 * Reads html of selection. If browser doesn't support Selection API, returns empty string.
 * @returns HTML of selection as String
 */
const getHTMLOfSelection = (): string => {
    // If browser doesn't support Selection API, return an empty string.
    if (!window.getSelection) {
        return '';
    }
    const selection = window.getSelection();
    if (!selection) {
        return '';
    }

    if (selection.rangeCount <= 0) {
        return window.getSelection()?.toString() ?? '';
    }

    const selectedCopyableRowsHTML = getHTMLOfSelectedCopyableRows(selection);
    if (selectedCopyableRowsHTML) {
        // Explicitly marked rows need normalized row text before generic selection cleanup.
        return selectedCopyableRowsHTML;
    }

    const div = document.createElement('div');

    // HTML tag of markdown comments is in data-testid attribute (em, strong, blockquote..). Our goal here is to
    // find that nodes and replace that tag with the one inside data-testid, so ExpensiMark can parse it.
    // Simply, we want to replace this:
    // <span class="..." style="..." data-testid="strong">bold</span>
    // to this:
    // <strong>bold</strong>
    //
    // We traverse all ranges, and get closest node with data-testid and replace its contents with contents of
    // range.
    for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i).cloneRange();

        while (range.endOffset === 0) {
            range.setEndBefore(range.endContainer);
        }

        const clonedSelection = range.cloneContents();

        // If clonedSelection has no text content this data has no meaning to us.
        if (clonedSelection.textContent) {
            let parent: globalThis.Element | null = null;
            let child = clonedSelection;

            // If selection starts and ends within same text node we use its parentNode. This is because we can't
            // use closest function on a [Text](https://developer.mozilla.org/en-US/docs/Web/API/Text) node.
            // We are selecting closest node because nodes with data-testid can be one of the parents of the actual node.
            // Assuming we selected only "block" part of following html:
            // <div className="..." style="..." data-testid="pre">
            //     <div dir="auto" class="..." style="...">
            //         this is block code
            //     </div>
            // </div>
            // commonAncestorContainer: #text "this is block code"
            // commonAncestorContainer.parentNode:
            //     <div dir="auto" class="..." style="...">
            //         this is block code
            //     </div>
            // and finally commonAncestorContainer.parentNode.closest('data-testid') is targeted dom.
            if (range.commonAncestorContainer instanceof HTMLElement) {
                parent = range.commonAncestorContainer.closest(`[${tagAttribute}]`);
            } else {
                parent = (range.commonAncestorContainer.parentNode as HTMLElement | null)?.closest(`[${tagAttribute}]`) ?? null;
            }

            // Keep traversing up to clone all parents with 'data-testid' attribute.
            while (parent) {
                const cloned = parent.cloneNode();
                cloned.appendChild(child);
                child = cloned as DocumentFragment;

                parent = (parent.parentNode as HTMLElement | null)?.closest(`[${tagAttribute}]`) ?? null;
            }

            div.appendChild(child);
        }
    }

    // Find and remove content that is intentionally hidden from copied selections.
    const hiddenElements = div.querySelectorAll(hiddenElementSelector);

    if (hiddenElements && hiddenElements.length > 0) {
        for (const element of hiddenElements) {
            element.remove();
        }
    }

    return div.innerHTML;
};

/**
 * Clears all attributes from dom elements
 * @param dom - dom htmlparser2 dom representation
 */
const replaceNodes = (dom: ChildNode, isChildOfEditorElement: boolean): ChildNode => {
    let domName;
    let domChildren: ChildNode[] = [];
    const domAttribs: Element['attribs'] = {};
    let data = '';

    // Encoding HTML chars '< >' in the text, because any HTML will be removed in stripHTML method.
    if (dom.type.toString() === 'text' && dom instanceof DataNode) {
        data = Str.htmlEncode(dom.data);
        if (dom.parent instanceof Element && dom.parent?.attribs?.[tagAttribute] === 'email-with-break-opportunities') {
            data = data.replaceAll('\u200b', '');
        }
    } else if (dom instanceof Element) {
        domName = dom.name;
        const child = dom.children.at(0);
        if (dom.attribs?.[tagAttribute]) {
            // If it's a markdown element, rename it according to the value of data-testid, so ExpensiMark can parse it
            if (markdownElements.has(dom.attribs[tagAttribute])) {
                domName = dom.attribs[tagAttribute];
            }
        } else if (dom.name === 'div' && dom.children.length === 1 && isChildOfEditorElement && child) {
            // We are excluding divs that are children of our editor element and have only one child to prevent
            // additional newlines from being added in the HTML to Markdown conversion process.
            return replaceNodes(child, isChildOfEditorElement);
        }

        // We need to preserve href attribute in order to copy links.
        if (dom.attribs?.href) {
            domAttribs.href = dom.attribs.href;
        }

        if (dom.children) {
            domChildren = dom.children.map((c) => replaceNodes(c, isChildOfEditorElement || !!dom.attribs?.[tagAttribute]));
        }
    } else {
        throw new Error(`Unknown dom type: ${dom.type}`);
    }

    return {
        ...dom,
        data,
        name: domName,
        attribs: domAttribs,
        children: domChildren,
    } as Element & DataNode;
};

/**
 * Resolves the current selection to values and produces clean HTML.
 */
const getCurrentSelection: GetCurrentSelection = () => {
    const domRepresentation = parseDocument(getHTMLOfSelection());
    domRepresentation.children = domRepresentation.children.map((item) => replaceNodes(item, false));

    // Newline characters need to be removed here because the HTML could contain both newlines and <br> tags, and when
    // <br> tags are converted later to markdown, it creates duplicate newline characters. This means that when the content
    // is pasted, there are extra newlines in the content that we want to avoid.
    const newHtml = render(domRepresentation).replaceAll('<br>\n', '<br>');
    return newHtml || '';
};

export {COPYABLE_ROW_DATA_SET, COPYABLE_TEXT_DATA_SET, isMouseDownOnCopyableText, useCopyableTextRowPress};

export default {
    getCurrentSelection,
};
