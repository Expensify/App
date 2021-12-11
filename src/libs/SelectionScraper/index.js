import render from 'dom-serializer';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {parseDocument} from 'htmlparser2';
import _ from 'underscore';

const elementsWillBeSkipped = ['html', 'body'];
const tagAttribute = 'data-testid';

/**
 * Reads html of selection. If there is no Selection API returns empty string.
 * @returns {String} HTML of selection as String
 */
const getHTMLOfSelection = () => {
    if (window.getSelection) {
        const selection = window.getSelection();

        if (selection.rangeCount > 0) {
            const div = document.createElement('div');

            // We traverse all ranges, and get closest node with data-testid and replace its contents with contents of
            // range.
            for (let i = 0; i < selection.rangeCount; i++) {
                const range = selection.getRangeAt(i);

                const clonedSelection = range.cloneContents();

                // If clonedSelection has no text content this data has no meaning to us.
                if (clonedSelection.textContent) {
                    let node = null;

                    if (range.commonAncestorContainer instanceof HTMLElement) {
                        node = range.commonAncestorContainer.closest(`[${tagAttribute}]`);
                    } else {
                        node = range.commonAncestorContainer.parentNode.closest(`[${tagAttribute}]`);
                    }

                    // This means "range.commonAncestorContainer" is a text node. We simply get its parent node.
                    if (!node) { node = range.commonAncestorContainer.parentNode; }

                    node = node.cloneNode();
                    node.appendChild(clonedSelection);
                    div.appendChild(node);

                    // We should not add new line after last range.
                    if (i < selection.rangeCount - 1) {
                        div.appendChild(document.createElement('br'));
                    }
                }
            }

            return div.innerHTML;
        }

        return window.getSelection().toString();
    }

    // If no Selection API returns empty string.
    return '';
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

    // We are skipping elements which has html and body in data-testid, since ExpensiMark can't parse it. Also this data
    // has no meaning for us.
    if (dom.attribs && dom.attribs[tagAttribute]) {
        if (!elementsWillBeSkipped.includes(dom.attribs[tagAttribute])) { domName = dom.attribs[tagAttribute]; }
    }

    // We need to preserve href attribute in order to copy links.
    if (dom.attribs && dom.attribs.href) {
        domAttribs.href = dom.attribs.href;
    }

    if (dom.children) {
        domChildren = _.map(dom.children, c => replaceNodes(c));
    }

    return {
        ...dom,
        name: domName,
        attribs: domAttribs,
        children: domChildren,
    };
};

/**
 * Reads html of selection, replaces with proper tags used for markdown, parses to markdown.
 * @returns {String} parsed html as String
 */
const getAsMarkdown = () => {
    const selectionHtml = getHTMLOfSelection();

    const domRepresentation = parseDocument(selectionHtml);
    domRepresentation.children = _.map(domRepresentation.children, c => replaceNodes(c));

    const newHtml = render(domRepresentation);

    const parser = new ExpensiMark();

    return parser.htmlToMarkdown(newHtml);
};

const SelectionScraper = {
    getAsMarkdown,
};

export default SelectionScraper;
