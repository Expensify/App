import render from 'dom-serializer';
import type {ChildNode} from 'domhandler';
import {DataNode, Element} from 'domhandler';
import {Str} from 'expensify-common';
import {parseDocument} from 'htmlparser2';
import CONST from '@src/CONST';
import type GetCurrentSelection from './types';

const markdownElements = new Set(['h1', 'strong', 'em', 'del', 'blockquote', 'q', 'code', 'pre', 'a', 'br', 'li', 'ul', 'ol', 'b', 'i', 's', 'mention-user']);
const tagAttribute = 'data-testid';

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

    // Find and remove the div housing the UnreadActionIndicator because we don't want
    // the 'New/Nuevo' text inside it being copied.
    const divsToRemove = div.querySelectorAll(`[data-${CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT}=true]`);

    if (divsToRemove && divsToRemove.length > 0) {
        for (const element of divsToRemove) {
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
