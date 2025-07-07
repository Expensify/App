"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Parser_1 = require("@libs/Parser");
var CONST_1 = require("@src/CONST");
var insertAtCaret = function (target, insertedText, maxLength) {
    var _a;
    var currentText = (_a = target.textContent) !== null && _a !== void 0 ? _a : '';
    var availableLength = maxLength - currentText.length;
    if (availableLength <= 0) {
        return;
    }
    var text = insertedText;
    var selection = window.getSelection();
    if (selection === null || selection === void 0 ? void 0 : selection.rangeCount) {
        var range = selection.getRangeAt(0);
        var selectedText = range.toString();
        availableLength -= selectedText.length;
        if (availableLength <= 0) {
            return;
        }
        text = text.slice(0, availableLength);
        range.deleteContents();
        var node = document.createTextNode(text);
        range.insertNode(node);
        // Move caret to the end of the newly inserted text node.
        range.setStart(node, node.length);
        range.setEnd(node, node.length);
        selection.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
        // Dispatch input event to trigger Markdown Input to parse the new text
        target.dispatchEvent(new Event('input', { bubbles: true }));
    }
};
var useHtmlPaste = function (textInputRef, preHtmlPasteCallback, isActive, maxLength) {
    if (isActive === void 0) { isActive = false; }
    if (maxLength === void 0) { maxLength = CONST_1.default.MAX_COMMENT_LENGTH + 1; }
    /**
     * Set pasted text to clipboard
     * @param {String} text
     */
    var paste = (0, react_1.useCallback)(function (text) {
        var _a, _b;
        try {
            var textInputHTMLElement_1 = textInputRef.current;
            if (textInputHTMLElement_1 === null || textInputHTMLElement_1 === void 0 ? void 0 : textInputHTMLElement_1.hasAttribute('contenteditable')) {
                insertAtCaret(textInputHTMLElement_1, text, maxLength);
            }
            else {
                var htmlInput = textInputRef.current;
                var availableLength = maxLength - ((_b = (_a = htmlInput.value) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
                htmlInput.setRangeText(text.slice(0, availableLength));
            }
            requestAnimationFrame(function () {
                var selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    var caretRect = range.getBoundingClientRect();
                    var inputRect = textInputHTMLElement_1.getBoundingClientRect();
                    // Calculate position need to scroll to
                    var scrollLeft = Math.max(0, caretRect.left - inputRect.left + textInputHTMLElement_1.scrollLeft - textInputHTMLElement_1.clientWidth / 2);
                    var scrollTop = Math.max(0, caretRect.top - inputRect.top + textInputHTMLElement_1.scrollTop - textInputHTMLElement_1.clientHeight / 2);
                    // Auto scroll to the position of cursor
                    textInputHTMLElement_1.scrollLeft = scrollLeft;
                    textInputHTMLElement_1.scrollTop = scrollTop;
                }
            });
            // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
            // To avoid the keyboard toggle issue in mWeb if using blur() and focus() functions, we just need to dispatch the event to trigger the onFocus handler
            // We need to trigger the bubbled "focusin" event to make sure the onFocus handler is triggered
            textInputHTMLElement_1.dispatchEvent(new FocusEvent('focusin', {
                bubbles: true,
            }));
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
        // We only need to set the callback once.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [maxLength, textInputRef]);
    /**
     * Manually place the pasted HTML into Composer
     *
     * @param {String} html - pasted HTML
     */
    var handlePastedHTML = (0, react_1.useCallback)(function (html) {
        paste(Parser_1.default.htmlToMarkdown(html, {}, maxLength));
    }, [paste, maxLength]);
    /**
     * Paste the plaintext content into Composer.
     *
     * @param {ClipboardEvent} event
     */
    var handlePastePlainText = (0, react_1.useCallback)(function (event) {
        var _a;
        var plainText = (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
        if (plainText) {
            paste(plainText);
        }
    }, [paste]);
    var handlePaste = (0, react_1.useCallback)(function (event) {
        var _a, _b, _c;
        if (!textInputRef.current) {
            return;
        }
        if (preHtmlPasteCallback === null || preHtmlPasteCallback === void 0 ? void 0 : preHtmlPasteCallback(event)) {
            return;
        }
        var isFocused = (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.isFocused();
        if (!isFocused) {
            return;
        }
        event.preventDefault();
        var TEXT_HTML = 'text/html';
        // If paste contains HTML
        if ((_c = (_b = event.clipboardData) === null || _b === void 0 ? void 0 : _b.types) === null || _c === void 0 ? void 0 : _c.includes(TEXT_HTML)) {
            var pastedHTML = event.clipboardData.getData(TEXT_HTML);
            var domparser = new DOMParser();
            var embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML).images;
            // Exclude parsing img tags in the HTML, as fetching the image via fetch triggers a connect-src Content-Security-Policy error.
            if (embeddedImages.length > 0 && embeddedImages[0].src) {
                // If HTML has emoji, then treat this as plain text.
                if (embeddedImages[0].dataset && embeddedImages[0].dataset.stringifyType === 'emoji') {
                    handlePastePlainText(event);
                    return;
                }
            }
            // If HTML starts with <p dir="ltr">, it means that the text was copied from the markdown input from the native app
            // and was saved to clipboard with additional styling, so we need to treat this as plain text to avoid adding unnecessary characters.
            if (pastedHTML.startsWith('<p dir="ltr">')) {
                handlePastePlainText(event);
                return;
            }
            handlePastedHTML(pastedHTML);
            return;
        }
        handlePastePlainText(event);
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [handlePastedHTML, handlePastePlainText, preHtmlPasteCallback]);
    (0, react_1.useEffect)(function () {
        if (!isActive) {
            return;
        }
        document.addEventListener('paste', handlePaste, true);
        return function () {
            document.removeEventListener('paste', handlePaste, true);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isActive]);
};
exports.default = useHtmlPaste;
