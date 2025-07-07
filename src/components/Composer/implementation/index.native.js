"use strict";
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
var mime_db_1 = require("mime-db");
var react_1 = require("react");
var react_native_1 = require("react-native");
var RNMarkdownTextInput_1 = require("@components/RNMarkdownTextInput");
var useMarkdownStyle_1 = require("@hooks/useMarkdownStyle");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var Parser_1 = require("@libs/Parser");
var CONST_1 = require("@src/CONST");
var excludeNoStyles = [];
var excludeReportMentionStyle = ['mentionReport'];
function Composer(_a, ref) {
    var _b = _a.onClear, onClearProp = _b === void 0 ? function () { } : _b, _c = _a.onPasteFile, onPasteFile = _c === void 0 ? function () { } : _c, _d = _a.isDisabled, isDisabled = _d === void 0 ? false : _d, maxLines = _a.maxLines, _e = _a.isComposerFullSize, isComposerFullSize = _e === void 0 ? false : _e, style = _a.style, 
    // On native layers we like to have the Text Input not focused so the
    // user can read new chats without the keyboard in the way of the view.
    // On Android the selection prop is required on the TextInput but this prop has issues on IOS
    selection = _a.selection, value = _a.value, _f = _a.isGroupPolicyReport, isGroupPolicyReport = _f === void 0 ? false : _f, props = __rest(_a, ["onClear", "onPasteFile", "isDisabled", "maxLines", "isComposerFullSize", "style", "selection", "value", "isGroupPolicyReport"]);
    var textInput = (0, react_1.useRef)(null);
    var textContainsOnlyEmojis = (0, react_1.useMemo)(function () { return (0, EmojiUtils_1.containsOnlyEmojis)(Parser_1.default.htmlToText(Parser_1.default.replace(value !== null && value !== void 0 ? value : ''))); }, [value]);
    var theme = (0, useTheme_1.default)();
    var markdownStyle = (0, useMarkdownStyle_1.default)(textContainsOnlyEmojis, !isGroupPolicyReport ? excludeReportMentionStyle : excludeNoStyles);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    (0, react_1.useEffect)(function () {
        if (!textInput.current || !textInput.current.setSelection || !selection || isComposerFullSize) {
            return;
        }
        // We need the delay for setSelection to properly work for IOS in bridgeless mode due to a react native
        // internal bug of dispatching the event before the component is ready for it.
        // (see https://github.com/Expensify/App/pull/50520#discussion_r1861960311 for more context)
        var timeoutID = setTimeout(function () {
            var _a, _b;
            // We are setting selection twice to trigger a scroll to the cursor on toggling to smaller composer size.
            (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.setSelection((selection.start || 1) - 1, selection.start);
            (_b = textInput.current) === null || _b === void 0 ? void 0 : _b.setSelection(selection.start, selection.start);
        }, 0);
        return function () { return clearTimeout(timeoutID); };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isComposerFullSize]);
    /**
     * Set the TextInput Ref
     * @param {Element} el
     */
    var setTextInputRef = (0, react_1.useCallback)(function (el) {
        // eslint-disable-next-line react-compiler/react-compiler
        textInput.current = el;
        if (typeof ref !== 'function' || textInput.current === null) {
            return;
        }
        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        ref(textInput.current);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var onClear = (0, react_1.useCallback)(function (_a) {
        var nativeEvent = _a.nativeEvent;
        onClearProp(nativeEvent.text);
    }, [onClearProp]);
    var pasteFile = (0, react_1.useCallback)(function (e) {
        var _a, _b, _c, _d;
        var clipboardContent = e.nativeEvent.items.at(0);
        if ((clipboardContent === null || clipboardContent === void 0 ? void 0 : clipboardContent.type) === 'text/plain') {
            return;
        }
        var mimeType = (_a = clipboardContent === null || clipboardContent === void 0 ? void 0 : clipboardContent.type) !== null && _a !== void 0 ? _a : '';
        var fileURI = clipboardContent === null || clipboardContent === void 0 ? void 0 : clipboardContent.data;
        var baseFileName = (_b = fileURI === null || fileURI === void 0 ? void 0 : fileURI.split('/').pop()) !== null && _b !== void 0 ? _b : 'file';
        var _e = (0, FileUtils_1.splitExtensionFromFileName)(baseFileName), stem = _e.fileName, originalFileExtension = _e.fileExtension;
        var fileExtension = originalFileExtension || ((_d = (_c = mime_db_1.default[mimeType].extensions) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 'bin');
        var fileName = "".concat(stem, ".").concat(fileExtension);
        var file = { uri: fileURI, name: fileName, type: mimeType };
        onPasteFile(file);
    }, [onPasteFile]);
    var maxHeightStyle = (0, react_1.useMemo)(function () { return StyleUtils.getComposerMaxHeightStyle(maxLines, isComposerFullSize); }, [StyleUtils, isComposerFullSize, maxLines]);
    var composerStyle = (0, react_1.useMemo)(function () { return react_native_1.StyleSheet.flatten([style, textContainsOnlyEmojis ? styles.onlyEmojisTextLineHeight : {}]); }, [style, textContainsOnlyEmojis, styles]);
    return (<RNMarkdownTextInput_1.default id={CONST_1.default.COMPOSER.NATIVE_ID} multiline autoComplete="off" placeholderTextColor={theme.placeholderText} ref={setTextInputRef} value={value} rejectResponderTermination={false} smartInsertDelete={false} textAlignVertical="center" style={[composerStyle, maxHeightStyle]} markdownStyle={markdownStyle} 
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    {...props} readOnly={isDisabled} onPaste={pasteFile} onClear={onClear}/>);
}
Composer.displayName = 'Composer';
exports.default = react_1.default.forwardRef(Composer);
