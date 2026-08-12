import {COPYABLE_TEXT_SELECTOR} from '@components/CopyableText/selection';

import CONST from '@src/CONST';

import type {ChildNode} from 'domhandler';

import render from 'dom-serializer';
import {DataNode, Element} from 'domhandler';
import {Str} from 'expensify-common';
import {parseDocument} from 'htmlparser2';

import type GetCurrentSelection from './types';

const markdownElements = new Set(['h1', 'strong', 'em', 'del', 'blockquote', 'q', 'code', 'pre', 'a', 'br', 'li', 'ul', 'ol', 'b', 'i', 's', 'mention-user']);
const tagAttribute = 'data-testid';
const hiddenElementAttribute = `data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}`;
const hiddenElementSelector = `[${hiddenElementAttribute}=true]`;
// These rows need line-based copy output when a browser selection crosses grouped search rows.
const copyableRowSelector = [`[${tagAttribute}=transaction-group-header-row][${hiddenElementAttribute}=true]`, `[${tagAttribute}=transaction-item-row][${hiddenElementAttribute}=true]`].join(
    ', ',
);

function getCopyableElementText(element: globalThis.Element): string {
    return element.textContent?.trim().replaceAll(/[\t\n\r ]+/g, ' ') ?? '';
}

function isTopLevelCopyableElementForHiddenElement(copyableElement: globalThis.Element, hiddenElement: globalThis.Element): boolean {
    if (!copyableElement.matches(COPYABLE_TEXT_SELECTOR) || copyableElement.closest(hiddenElementSelector) !== hiddenElement) {
        return false;
    }

    // DisplayNames can mark both the wrapper and child names copyable, so only keep the top-most copyable node.
    const copyableAncestor = copyableElement.parentElement?.closest(COPYABLE_TEXT_SELECTOR);
    return !copyableAncestor || copyableAncestor.closest(hiddenElementSelector) !== hiddenElement;
}

function getCopyableTextForHiddenElement(element: globalThis.Element): string {
    return [element, ...Array.from(element.querySelectorAll(COPYABLE_TEXT_SELECTOR))]
        .filter((copyableElement) => isTopLevelCopyableElementForHiddenElement(copyableElement, element))
        .map(getCopyableElementText)
        .filter((text) => !!text)
        .join(' ');
}

function getDirectHiddenChildren(element: globalThis.Element): globalThis.Element[] {
    return Array.from(element.querySelectorAll(hiddenElementSelector)).filter((hiddenElement) => hiddenElement.parentElement?.closest(hiddenElementSelector) === element);
}

function getCopyableSelectionLines(element: globalThis.Element): string[] {
    const currentLine = getCopyableTextForHiddenElement(element);
    // Expanded grouped rows contain hidden child rows; keep each child as its own copied line.
    const nestedLines = getDirectHiddenChildren(element).flatMap(getCopyableSelectionLines);
    return currentLine ? [currentLine, ...nestedLines] : nestedLines;
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

// Hidden row wrappers can contain avatars, icons, and violation text; keep only values explicitly marked copyable.
function keepOnlyCopyableSelectionContent(element: globalThis.Element): boolean {
    const copyableLines = getCopyableSelectionLines(element);
    if (copyableLines.length === 0) {
        return false;
    }

    // Rebuild copied row text with spaces between cells and line breaks between rows.
    replaceElementContentWithLines(element, copyableLines);
    element.removeAttribute(hiddenElementAttribute);
    return true;
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
    return [rootElement.closest(copyableRowSelector), ...Array.from(rootElement.querySelectorAll(copyableRowSelector))].filter(
        (row): row is globalThis.Element => !!row && range.intersectsNode(row),
    );
}

function isTopLevelCopyableElementForRow(copyableElement: globalThis.Element, row: globalThis.Element): boolean {
    if (!copyableElement.matches(COPYABLE_TEXT_SELECTOR) || copyableElement.closest(copyableRowSelector) !== row) {
        return false;
    }

    const copyableAncestor = copyableElement.parentElement?.closest(COPYABLE_TEXT_SELECTOR);
    return !copyableAncestor || copyableAncestor.closest(copyableRowSelector) !== row;
}

function getCopyableElementsForSelectedRow(row: globalThis.Element, range: Range): globalThis.Element[] {
    return [row, ...Array.from(row.querySelectorAll(COPYABLE_TEXT_SELECTOR))].filter(
        (copyableElement) => isTopLevelCopyableElementForRow(copyableElement, row) && range.intersectsNode(copyableElement),
    );
}

function getHTMLOfSelectedTransactionRows(selection: Selection): string {
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
                .map(getCopyableElementText)
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

    const selectedTransactionRowsHTML = getHTMLOfSelectedTransactionRows(selection);
    if (selectedTransactionRowsHTML) {
        // Grouped transaction rows need normalized row text before the generic selection cleanup strips hidden wrappers.
        return selectedTransactionRowsHTML;
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
            if (!div.contains(element)) {
                continue;
            }

            // Keep only explicitly copyable values when their parent row is hidden from the selection scraper.
            if (keepOnlyCopyableSelectionContent(element)) {
                continue;
            }
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

export default {
    getCurrentSelection,
};
