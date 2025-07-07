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
var react_native_live_markdown_1 = require("@expensify/react-native-live-markdown");
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useShortMentionsList_1 = require("@hooks/useShortMentionsList");
var useTheme_1 = require("@hooks/useTheme");
var FormatSelectionUtils_1 = require("@libs/FormatSelectionUtils");
var ParsingUtils_1 = require("@libs/ParsingUtils");
var runOnLiveMarkdownRuntime_1 = require("@libs/runOnLiveMarkdownRuntime");
var CONST_1 = require("@src/CONST");
// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
var AnimatedMarkdownTextInput = react_native_reanimated_1.default.createAnimatedComponent(react_native_live_markdown_1.MarkdownTextInput);
function RNMarkdownTextInputWithRef(_a, ref) {
    var maxLength = _a.maxLength, parser = _a.parser, props = __rest(_a, ["maxLength", "parser"]);
    var theme = (0, useTheme_1.default)();
    var _b = (0, useShortMentionsList_1.default)(), mentionsList = _b.mentionsList, currentUserMentions = _b.currentUserMentions;
    var mentionsSharedVal = (0, react_native_reanimated_1.useSharedValue)(mentionsList);
    var inputRef = (0, react_1.useRef)(null);
    // Expose the ref to the parent component
    react_1.default.useImperativeHandle(ref, function () { return inputRef.current; });
    // Check if the cursor is at the end of the text
    var isCursorAtEnd = props.selection && props.value && props.selection.start === props.value.length;
    // Automatically scroll to the end if the cursor was at the end after value changes
    (0, react_1.useEffect)(function () {
        if (!inputRef.current || !isCursorAtEnd) {
            return;
        }
        if ('scrollTop' in inputRef.current && 'scrollHeight' in inputRef.current) {
            var currentRef = inputRef.current;
            currentRef.scrollTop = currentRef.scrollHeight;
        }
    }, [props.value, isCursorAtEnd]);
    // If `parser` prop was passed down we use it directly, otherwise we default to parsing with ExpensiMark
    var parserWorklet = (0, react_1.useCallback)(function (text) {
        'worklet';
        if (parser) {
            return parser(text);
        }
        return (0, ParsingUtils_1.parseExpensiMarkWithShortMentions)(text, mentionsSharedVal.get(), currentUserMentions);
    }, [currentUserMentions, mentionsSharedVal, parser]);
    (0, react_1.useEffect)(function () {
        (0, runOnLiveMarkdownRuntime_1.default)(function () {
            'worklet';
            mentionsSharedVal.set(mentionsList);
        })();
    }, [mentionsList, mentionsSharedVal]);
    return (<AnimatedMarkdownTextInput allowFontScaling={false} textBreakStrategy="simple" keyboardAppearance={theme.colorScheme} parser={parserWorklet} ref={inputRef} formatSelection={FormatSelectionUtils_1.default} 
    // eslint-disable-next-line
    {...props} 
    /**
     * If maxLength is not set, we should set it to CONST.MAX_COMMENT_LENGTH + 1, to avoid parsing markdown for large text
     */
    maxLength={maxLength !== null && maxLength !== void 0 ? maxLength : CONST_1.default.MAX_COMMENT_LENGTH + 1}/>);
}
RNMarkdownTextInputWithRef.displayName = 'RNTextInputWithRef';
exports.default = (0, react_1.forwardRef)(RNMarkdownTextInputWithRef);
