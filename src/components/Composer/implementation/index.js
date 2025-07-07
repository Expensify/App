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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var RNMarkdownTextInput_1 = require("@components/RNMarkdownTextInput");
var useHtmlPaste_1 = require("@hooks/useHtmlPaste");
var useIsScrollBarVisible_1 = require("@hooks/useIsScrollBarVisible");
var useMarkdownStyle_1 = require("@hooks/useMarkdownStyle");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var Browser_1 = require("@libs/Browser");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var isEnterWhileComposition_1 = require("@libs/KeyboardShortcut/isEnterWhileComposition");
var Parser_1 = require("@libs/Parser");
var CONST_1 = require("@src/CONST");
var excludeNoStyles = [];
var excludeReportMentionStyle = ['mentionReport'];
var imagePreviewAuthRequiredURLs = [CONST_1.default.EXPENSIFY_URL, CONST_1.default.STAGING_EXPENSIFY_URL];
// Enable Markdown parsing.
// On web we like to have the Text Input field always focused so the user can easily type a new chat
function Composer(_a, ref) {
    var value = _a.value, defaultValue = _a.defaultValue, _b = _a.maxLines, maxLines = _b === void 0 ? -1 : _b, _c = _a.onKeyPress, onKeyPress = _c === void 0 ? function () { } : _c, style = _a.style, _d = _a.autoFocus, autoFocus = _d === void 0 ? false : _d, _e = _a.shouldCalculateCaretPosition, shouldCalculateCaretPosition = _e === void 0 ? false : _e, _f = _a.isDisabled, isDisabled = _f === void 0 ? false : _f, _g = _a.onClear, onClear = _g === void 0 ? function () { } : _g, _h = _a.onPasteFile, onPasteFile = _h === void 0 ? function () { } : _h, _j = _a.onSelectionChange, onSelectionChange = _j === void 0 ? function () { } : _j, _k = _a.checkComposerVisibility, checkComposerVisibility = _k === void 0 ? function () { return false; } : _k, _l = _a.selection, selectionProp = _l === void 0 ? {
        start: 0,
        end: 0,
    } : _l, _m = _a.isComposerFullSize, isComposerFullSize = _m === void 0 ? false : _m, onContentSizeChange = _a.onContentSizeChange, _o = _a.shouldContainScroll, shouldContainScroll = _o === void 0 ? true : _o, _p = _a.isGroupPolicyReport, isGroupPolicyReport = _p === void 0 ? false : _p, props = __rest(_a, ["value", "defaultValue", "maxLines", "onKeyPress", "style", "autoFocus", "shouldCalculateCaretPosition", "isDisabled", "onClear", "onPasteFile", "onSelectionChange", "checkComposerVisibility", "selection", "isComposerFullSize", "onContentSizeChange", "shouldContainScroll", "isGroupPolicyReport"]);
    var textContainsOnlyEmojis = (0, react_1.useMemo)(function () { return (0, EmojiUtils_1.containsOnlyEmojis)(Parser_1.default.htmlToText(Parser_1.default.replace(value !== null && value !== void 0 ? value : ''))); }, [value]);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var markdownStyle = (0, useMarkdownStyle_1.default)(textContainsOnlyEmojis, !isGroupPolicyReport ? excludeReportMentionStyle : excludeNoStyles);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var textInput = (0, react_1.useRef)(null);
    var _q = (0, react_1.useState)({
        start: selectionProp.start,
        end: selectionProp.end,
    }), selection = _q[0], setSelection = _q[1];
    var _r = (0, react_1.useState)(false), isRendered = _r[0], setIsRendered = _r[1];
    var isScrollBarVisible = (0, useIsScrollBarVisible_1.default)(textInput, value !== null && value !== void 0 ? value : '');
    var _s = (0, react_1.useState)(), prevScroll = _s[0], setPrevScroll = _s[1];
    var _t = (0, react_1.useState)(), prevHeight = _t[0], setPrevHeight = _t[1];
    var isReportFlatListScrolling = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (!!selection && selectionProp.start === selection.start && selectionProp.end === selection.end) {
            return;
        }
        setSelection(selectionProp);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [selectionProp]);
    /**
     *  Adds the cursor position to the selection change event.
     */
    var addCursorPositionToSelectionChange = function (event) {
        var _a, _b, _c, _d;
        var webEvent = event;
        var sel = window.getSelection();
        if (shouldCalculateCaretPosition && isRendered && sel) {
            var range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
            var rect = range.getClientRects()[0] || ((_a = range.startContainer.parentElement) === null || _a === void 0 ? void 0 : _a.getClientRects()[0]);
            var containerRect = (_b = textInput.current) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
            var x = 0;
            var y = 0;
            if (rect && containerRect) {
                x = rect.left - containerRect.left;
                y = rect.top - containerRect.top + ((_d = (_c = textInput === null || textInput === void 0 ? void 0 : textInput.current) === null || _c === void 0 ? void 0 : _c.scrollTop) !== null && _d !== void 0 ? _d : 0) - rect.height / 2;
            }
            var selectionValue = {
                start: webEvent.nativeEvent.selection.start,
                end: webEvent.nativeEvent.selection.end,
                positionX: x - CONST_1.default.SPACE_CHARACTER_WIDTH,
                positionY: y,
            };
            onSelectionChange(__assign(__assign({}, webEvent), { nativeEvent: __assign(__assign({}, webEvent.nativeEvent), { selection: selectionValue }) }));
            setSelection(selectionValue);
        }
        else {
            onSelectionChange(webEvent);
            setSelection(webEvent.nativeEvent.selection);
        }
    };
    /**
     * Check the paste event for an attachment, parse the data and call onPasteFile from props with the selected file,
     * Otherwise, convert pasted HTML to Markdown and set it on the composer.
     */
    var handlePaste = (0, react_1.useCallback)(function (event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var isVisible = checkComposerVisibility();
        var isFocused = (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.isFocused();
        var isContenteditableDivFocused = ((_b = document.activeElement) === null || _b === void 0 ? void 0 : _b.nodeName) === 'DIV' && ((_c = document.activeElement) === null || _c === void 0 ? void 0 : _c.hasAttribute('contenteditable'));
        if (!(isVisible || isFocused)) {
            return true;
        }
        if (textInput.current !== event.target && !(isContenteditableDivFocused && !((_d = event.clipboardData) === null || _d === void 0 ? void 0 : _d.files.length))) {
            var eventTarget = event.target;
            // To make sure the composer does not capture paste events from other inputs, we check where the event originated
            // If it did originate in another input, we return early to prevent the composer from handling the paste
            var isTargetInput = (eventTarget === null || eventTarget === void 0 ? void 0 : eventTarget.nodeName) === CONST_1.default.ELEMENT_NAME.INPUT || (eventTarget === null || eventTarget === void 0 ? void 0 : eventTarget.nodeName) === CONST_1.default.ELEMENT_NAME.TEXTAREA || (eventTarget === null || eventTarget === void 0 ? void 0 : eventTarget.contentEditable) === 'true';
            if (isTargetInput || (!isFocused && isContenteditableDivFocused && ((_e = event.clipboardData) === null || _e === void 0 ? void 0 : _e.files.length))) {
                return true;
            }
            (_f = textInput.current) === null || _f === void 0 ? void 0 : _f.focus();
        }
        event.preventDefault();
        var TEXT_HTML = 'text/html';
        var clipboardDataHtml = (_h = (_g = event.clipboardData) === null || _g === void 0 ? void 0 : _g.getData(TEXT_HTML)) !== null && _h !== void 0 ? _h : '';
        // If paste contains files, then trigger file management
        if (((_j = event.clipboardData) === null || _j === void 0 ? void 0 : _j.files.length) && event.clipboardData.files.length > 0) {
            // Prevent the default so we do not post the file name into the text box
            onPasteFile(event.clipboardData.files[0]);
            return true;
        }
        // If paste contains base64 image
        if (clipboardDataHtml === null || clipboardDataHtml === void 0 ? void 0 : clipboardDataHtml.includes(CONST_1.default.IMAGE_BASE64_MATCH)) {
            var domparser = new DOMParser();
            var pastedHTML = clipboardDataHtml;
            var embeddedImages = (_k = domparser.parseFromString(pastedHTML, TEXT_HTML)) === null || _k === void 0 ? void 0 : _k.images;
            if (embeddedImages.length > 0 && embeddedImages[0].src) {
                var src = embeddedImages[0].src;
                var file = (0, FileUtils_1.base64ToFile)(src, 'image.png');
                onPasteFile(file);
                return true;
            }
        }
        // If paste contains image from Google Workspaces ex: Sheets, Docs, Slide, etc
        if (clipboardDataHtml === null || clipboardDataHtml === void 0 ? void 0 : clipboardDataHtml.includes(CONST_1.default.GOOGLE_DOC_IMAGE_LINK_MATCH)) {
            var domparser = new DOMParser();
            var pastedHTML = clipboardDataHtml;
            var embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML).images;
            if (embeddedImages.length > 0 && ((_l = embeddedImages[0]) === null || _l === void 0 ? void 0 : _l.src)) {
                var src = embeddedImages[0].src;
                if (src.includes(CONST_1.default.GOOGLE_DOC_IMAGE_LINK_MATCH)) {
                    fetch(src)
                        .then(function (response) { return response.blob(); })
                        .then(function (blob) {
                        var file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                        onPasteFile(file);
                    });
                    return true;
                }
            }
        }
        return false;
    }, [onPasteFile, checkComposerVisibility]);
    (0, react_1.useEffect)(function () {
        if (!textInput.current) {
            return;
        }
        var debouncedSetPrevScroll = (0, debounce_1.default)(function () {
            if (!textInput.current) {
                return;
            }
            setPrevScroll(textInput.current.scrollTop);
        }, 100);
        textInput.current.addEventListener('scroll', debouncedSetPrevScroll);
        return function () {
            var _a;
            (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('scroll', debouncedSetPrevScroll);
        };
    }, []);
    (0, react_1.useEffect)(function () {
        var scrollingListener = react_native_1.DeviceEventEmitter.addListener(CONST_1.default.EVENTS.SCROLLING, function (scrolling) {
            isReportFlatListScrolling.current = scrolling;
        });
        return function () { return scrollingListener.remove(); };
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        var handleWheel = function (e) {
            if (isReportFlatListScrolling.current) {
                e.preventDefault();
                return;
            }
            // When the composer has no scrollable content, the stopPropagation will prevent the inverted wheel event handler on the Chat body
            // which defaults to the browser wheel behavior. This causes the chat body to scroll in the opposite direction creating jerky behavior.
            if (textInput.current && textInput.current.scrollHeight <= textInput.current.clientHeight) {
                return;
            }
            e.stopPropagation();
        };
        (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', handleWheel, { passive: false });
        return function () {
            var _a;
            (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('wheel', handleWheel);
        };
    }, []);
    (0, react_1.useEffect)(function () {
        if (!textInput.current || prevScroll === undefined || prevHeight === undefined) {
            return;
        }
        // eslint-disable-next-line react-compiler/react-compiler
        textInput.current.scrollTop = prevScroll + prevHeight - textInput.current.clientHeight;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isComposerFullSize]);
    var isActive = (0, native_1.useIsFocused)();
    (0, useHtmlPaste_1.default)(textInput, handlePaste, isActive);
    (0, react_1.useEffect)(function () {
        setIsRendered(true);
    }, []);
    var clear = (0, react_1.useCallback)(function () {
        if (!textInput.current) {
            return;
        }
        var currentText = textInput.current.value;
        textInput.current.clear();
        // We need to reset the selection to 0,0 manually after clearing the text input on web
        var selectionEvent = {
            nativeEvent: {
                selection: {
                    start: 0,
                    end: 0,
                },
            },
        };
        onSelectionChange(selectionEvent);
        setSelection({ start: 0, end: 0 });
        onClear(currentText);
    }, [onClear, onSelectionChange]);
    (0, react_1.useImperativeHandle)(ref, function () {
        var textInputRef = textInput.current;
        if (!textInputRef) {
            throw new Error('textInputRef is not available. This should never happen and indicates a developer error.');
        }
        return __assign(__assign({}, textInputRef), { 
            // Overwrite clear with our custom implementation, which mimics how the native TextInput's clear method works
            clear: clear, 
            // We have to redefine these methods as they are inherited by prototype chain and are not accessible directly
            blur: function () { return textInputRef.blur(); }, focus: function () { return textInputRef.focus(); }, get scrollTop() {
                return textInputRef.scrollTop;
            } });
    }, [clear]);
    var handleKeyPress = (0, react_1.useCallback)(function (e) {
        // Prevent onKeyPress from being triggered if the Enter key is pressed while text is being composed
        if (!onKeyPress || (0, isEnterWhileComposition_1.default)(e)) {
            return;
        }
        onKeyPress(e);
    }, [onKeyPress]);
    var scrollStyleMemo = (0, react_1.useMemo)(function () {
        if (shouldContainScroll) {
            return isScrollBarVisible ? [styles.overflowScroll, styles.overscrollBehaviorContain] : styles.overflowHidden;
        }
        return styles.overflowAuto;
    }, [shouldContainScroll, styles.overflowAuto, styles.overflowScroll, styles.overscrollBehaviorContain, styles.overflowHidden, isScrollBarVisible]);
    var inputStyleMemo = (0, react_1.useMemo)(function () { return [
        react_native_1.StyleSheet.flatten([style, { outline: 'none' }]),
        StyleUtils.getComposeTextAreaPadding(isComposerFullSize, textContainsOnlyEmojis),
        (0, Browser_1.isMobileSafari)() || (0, Browser_1.isSafari)() ? styles.rtlTextRenderForSafari : {},
        scrollStyleMemo,
        StyleUtils.getComposerMaxHeightStyle(maxLines, isComposerFullSize),
        isComposerFullSize ? { height: '100%', maxHeight: 'none' } : undefined,
        textContainsOnlyEmojis ? styles.onlyEmojisTextLineHeight : {},
    ]; }, [style, styles.rtlTextRenderForSafari, styles.onlyEmojisTextLineHeight, scrollStyleMemo, StyleUtils, maxLines, isComposerFullSize, textContainsOnlyEmojis]);
    return (<RNMarkdownTextInput_1.default id={CONST_1.default.COMPOSER.NATIVE_ID} autoComplete="off" autoCorrect={!(0, Browser_1.isMobileSafari)()} placeholderTextColor={theme.placeholderText} ref={function (el) {
            textInput.current = el;
        }} selection={selection} style={[inputStyleMemo]} markdownStyle={markdownStyle} value={value} defaultValue={defaultValue} autoFocus={autoFocus} 
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    {...props} onSelectionChange={addCursorPositionToSelectionChange} onContentSizeChange={function (e) {
            setPrevHeight(e.nativeEvent.contentSize.height);
            onContentSizeChange === null || onContentSizeChange === void 0 ? void 0 : onContentSizeChange(e);
        }} disabled={isDisabled} onKeyPress={handleKeyPress} addAuthTokenToImageURLCallback={addEncryptedAuthTokenToURL_1.default} imagePreviewAuthRequiredURLs={imagePreviewAuthRequiredURLs}/>);
}
Composer.displayName = 'Composer';
exports.default = react_1.default.forwardRef(Composer);
