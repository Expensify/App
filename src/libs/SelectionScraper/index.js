import render from 'dom-serializer';
import {parseDocument} from 'htmlparser2';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';

const elementsWillBeSkipped = ['html', 'body'];
const tagAttribute = 'data-testid';

/**
 * Reads html of selection. If browser doesn't support Selection API, returns empty string.
 * @returns {String} HTML of selection as String
 */
const getHTMLOfSelection = () => {
    // If browser doesn't support Selection API, return an empty string.
    if (!window.getSelection) {
        return '';
    }
    const selection = window.getSelection();

    if (selection.rangeCount <= 0) {
        return window.getSelection().toString();
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
            let parent;
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
                parent = range.commonAncestorContainer.parentNode.closest(`[${tagAttribute}]`);
            }

            // Keep traversing up to clone all parents with 'data-testid' attribute.
            while (parent) {
                const cloned = parent.cloneNode();
                cloned.appendChild(child);
                child = cloned;

                parent = parent.parentNode.closest(`[${tagAttribute}]`);
            }

            div.appendChild(child);
        }
    }

    return div.innerHTML;
};

/**
 * Clears all attributes from dom elements
 * @param {Object} dom htmlparser2 dom representation
 * @returns {Object} htmlparser2 dom representation
 */
const replaceNodes = (dom) => {
    let domName = dom.name;
    let domChildren;
    const domAttribs = {};
    let data;

    // Encoding HTML chars '< >' in the text, because any HTML will be removed in stripHTML method.
    if (dom.type === 'text') {
        data = Str.htmlEncode(dom.data);
    }

    // We are skipping elements which has html and body in data-testid, since ExpensiMark can't parse it. Also this data
    // has no meaning for us.
    if (dom.attribs && dom.attribs[tagAttribute]) {
        if (!elementsWillBeSkipped.includes(dom.attribs[tagAttribute])) {
            domName = dom.attribs[tagAttribute];
        }
    } else if (dom.name === 'div' && dom.children.length === 1 && dom.children[0].type !== 'text') {
        // We are excluding divs that have only one child and no text nodes and don't have a tagAttribute to prevent
        // additional newlines from being added in the HTML to Markdown conversion process.
        return replaceNodes(dom.children[0]);
    }

    // We need to preserve href attribute in order to copy links.
    if (dom.attribs && dom.attribs.href) {
        domAttribs.href = dom.attribs.href;
    }

    if (dom.children) {
        domChildren = _.map(dom.children, (c) => replaceNodes(c));
    }

    return {
        ...dom,
        data,
        name: domName,
        attribs: domAttribs,
        children: domChildren,
    };
};

/**
 * Resolves the current selection to values and produces clean HTML.
 * @returns {String} resolved selection in the HTML format
 */
const getCurrentSelection = () => {
    const domRepresentation = parseDocument(getHTMLOfSelection());
    domRepresentation.children = _.map(domRepresentation.children, replaceNodes);

    // Newline characters need to be removed here because the HTML could contain both newlines and <br> tags, and when
    // <br> tags are converted later to markdown, it creates duplicate newline characters. This means that when the content
    // is pasted, there are extra newlines in the content that we want to avoid.
    const newHtml = render(domRepresentation).replace(/<br>\n/g, '<br>');
    return newHtml || '';
};

export default {
    getCurrentSelection,
};
