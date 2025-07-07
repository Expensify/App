"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dom_serializer_1 = require("dom-serializer");
var domhandler_1 = require("domhandler");
var expensify_common_1 = require("expensify-common");
var htmlparser2_1 = require("htmlparser2");
var CONST_1 = require("@src/CONST");
var markdownElements = ['h1', 'strong', 'em', 'del', 'blockquote', 'q', 'code', 'pre', 'a', 'br', 'li', 'ul', 'ol', 'b', 'i', 's', 'mention-user'];
var tagAttribute = 'data-testid';
/**
 * Reads html of selection. If browser doesn't support Selection API, returns empty string.
 * @returns HTML of selection as String
 */
var getHTMLOfSelection = function () {
    var _a, _b, _c, _d, _e, _f;
    // If browser doesn't support Selection API, return an empty string.
    if (!window.getSelection) {
        return '';
    }
    var selection = window.getSelection();
    if (!selection) {
        return '';
    }
    if (selection.rangeCount <= 0) {
        return (_b = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
    }
    var div = document.createElement('div');
    // HTML tag of markdown comments is in data-testid attribute (em, strong, blockquote..). Our goal here is to
    // find that nodes and replace that tag with the one inside data-testid, so ExpensiMark can parse it.
    // Simply, we want to replace this:
    // <span class="..." style="..." data-testid="strong">bold</span>
    // to this:
    // <strong>bold</strong>
    //
    // We traverse all ranges, and get closest node with data-testid and replace its contents with contents of
    // range.
    for (var i = 0; i < selection.rangeCount; i++) {
        var range = selection.getRangeAt(i).cloneRange();
        while (range.endOffset === 0) {
            range.setEndBefore(range.endContainer);
        }
        var clonedSelection = range.cloneContents();
        // If clonedSelection has no text content this data has no meaning to us.
        if (clonedSelection.textContent) {
            var parent_1 = null;
            var child = clonedSelection;
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
                parent_1 = range.commonAncestorContainer.closest("[".concat(tagAttribute, "]"));
            }
            else {
                parent_1 = (_d = (_c = range.commonAncestorContainer.parentNode) === null || _c === void 0 ? void 0 : _c.closest("[".concat(tagAttribute, "]"))) !== null && _d !== void 0 ? _d : null;
            }
            // Keep traversing up to clone all parents with 'data-testid' attribute.
            while (parent_1) {
                var cloned = parent_1.cloneNode();
                cloned.appendChild(child);
                child = cloned;
                parent_1 = (_f = (_e = parent_1.parentNode) === null || _e === void 0 ? void 0 : _e.closest("[".concat(tagAttribute, "]"))) !== null && _f !== void 0 ? _f : null;
            }
            div.appendChild(child);
        }
    }
    // Find and remove the div housing the UnreadActionIndicator because we don't want
    // the 'New/Nuevo' text inside it being copied.
    var divsToRemove = div.querySelectorAll("[data-".concat(CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT, "=true]"));
    if (divsToRemove && divsToRemove.length > 0) {
        divsToRemove.forEach(function (element) {
            element.remove();
        });
    }
    return div.innerHTML;
};
/**
 * Clears all attributes from dom elements
 * @param dom - dom htmlparser2 dom representation
 */
var replaceNodes = function (dom, isChildOfEditorElement) {
    var _a, _b, _c, _d;
    var domName;
    var domChildren = [];
    var domAttribs = {};
    var data = '';
    // Encoding HTML chars '< >' in the text, because any HTML will be removed in stripHTML method.
    if (dom.type.toString() === 'text' && dom instanceof domhandler_1.DataNode) {
        data = expensify_common_1.Str.htmlEncode(dom.data);
        if (dom.parent instanceof domhandler_1.Element && ((_b = (_a = dom.parent) === null || _a === void 0 ? void 0 : _a.attribs) === null || _b === void 0 ? void 0 : _b[tagAttribute]) === 'email-with-break-opportunities') {
            data = data.replaceAll('\u200b', '');
        }
    }
    else if (dom instanceof domhandler_1.Element) {
        domName = dom.name;
        var child = dom.children.at(0);
        if ((_c = dom.attribs) === null || _c === void 0 ? void 0 : _c[tagAttribute]) {
            // If it's a markdown element, rename it according to the value of data-testid, so ExpensiMark can parse it
            if (markdownElements.includes(dom.attribs[tagAttribute])) {
                domName = dom.attribs[tagAttribute];
            }
        }
        else if (dom.name === 'div' && dom.children.length === 1 && isChildOfEditorElement && child) {
            // We are excluding divs that are children of our editor element and have only one child to prevent
            // additional newlines from being added in the HTML to Markdown conversion process.
            return replaceNodes(child, isChildOfEditorElement);
        }
        // We need to preserve href attribute in order to copy links.
        if ((_d = dom.attribs) === null || _d === void 0 ? void 0 : _d.href) {
            domAttribs.href = dom.attribs.href;
        }
        if (dom.children) {
            domChildren = dom.children.map(function (c) { var _a; return replaceNodes(c, isChildOfEditorElement || !!((_a = dom.attribs) === null || _a === void 0 ? void 0 : _a[tagAttribute])); });
        }
    }
    else {
        throw new Error("Unknown dom type: ".concat(dom.type));
    }
    return __assign(__assign({}, dom), { data: data, name: domName, attribs: domAttribs, children: domChildren });
};
/**
 * Resolves the current selection to values and produces clean HTML.
 */
var getCurrentSelection = function () {
    var domRepresentation = (0, htmlparser2_1.parseDocument)(getHTMLOfSelection());
    domRepresentation.children = domRepresentation.children.map(function (item) { return replaceNodes(item, false); });
    // Newline characters need to be removed here because the HTML could contain both newlines and <br> tags, and when
    // <br> tags are converted later to markdown, it creates duplicate newline characters. This means that when the content
    // is pasted, there are extra newlines in the content that we want to avoid.
    var newHtml = (0, dom_serializer_1.default)(domRepresentation).replace(/<br>\n/g, '<br>');
    return newHtml || '';
};
exports.default = {
    getCurrentSelection: getCurrentSelection,
};
