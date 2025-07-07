"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var Text_1 = require("@components/Text");
var ZeroWidthView_1 = require("@components/ZeroWidthView");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var convertToLTR_1 = require("@libs/convertToLTR");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var Parser_1 = require("@libs/Parser");
var Performance_1 = require("@libs/Performance");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var variables_1 = require("@styles/variables");
var Timing_1 = require("@userActions/Timing");
var CONST_1 = require("@src/CONST");
var RenderCommentHTML_1 = require("./RenderCommentHTML");
var shouldRenderAsText_1 = require("./shouldRenderAsText");
var TextWithEmojiFragment_1 = require("./TextWithEmojiFragment");
function TextCommentFragment(_a) {
    var fragment = _a.fragment, styleAsDeleted = _a.styleAsDeleted, reportActionID = _a.reportActionID, _b = _a.styleAsMuted, styleAsMuted = _b === void 0 ? false : _b, source = _a.source, style = _a.style, displayAsGroup = _a.displayAsGroup, _c = _a.iouMessage, iouMessage = _c === void 0 ? '' : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _d = (fragment !== null && fragment !== void 0 ? fragment : {}).html, html = _d === void 0 ? '' : _d;
    var text = (0, ReportActionsUtils_1.getTextFromHtml)(html);
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var message = (0, isEmpty_1.default)(iouMessage) ? text : iouMessage;
    var processedTextArray = (0, react_1.useMemo)(function () { return (0, EmojiUtils_1.splitTextWithEmojis)(message); }, [message]);
    (0, react_1.useEffect)(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.SEND_MESSAGE, { message: text });
        Timing_1.default.end(CONST_1.default.TIMING.SEND_MESSAGE);
    }, [text]);
    // If the only difference between fragment.text and fragment.html is <br /> tags and emoji tag
    // on native, we render it as text, not as html
    // on other device, only render it as text if the only difference is <br /> tag
    var containsOnlyEmojis = (0, EmojiUtils_1.containsOnlyEmojis)(text !== null && text !== void 0 ? text : '');
    var containsEmojis = CONST_1.default.REGEX.ALL_EMOJIS.test(text !== null && text !== void 0 ? text : '');
    if (!(0, shouldRenderAsText_1.default)(html, text !== null && text !== void 0 ? text : '') && !(containsOnlyEmojis && styleAsDeleted)) {
        var editedTag = (fragment === null || fragment === void 0 ? void 0 : fragment.isEdited) ? "<edited ".concat(styleAsDeleted ? 'deleted' : '', "></edited>") : '';
        var htmlWithDeletedTag = styleAsDeleted ? "<del>".concat(html, "</del>") : html;
        var htmlContent = htmlWithDeletedTag;
        if (containsOnlyEmojis) {
            htmlContent = expensify_common_1.Str.replaceAll(htmlContent, '<emoji>', '<emoji islarge>');
        }
        else if (containsEmojis) {
            htmlContent = htmlWithDeletedTag;
            if (!htmlContent.includes('<emoji>')) {
                htmlContent = Parser_1.default.replace(htmlContent, { filterRules: ['emoji'], shouldEscapeText: false });
            }
            htmlContent = expensify_common_1.Str.replaceAll(htmlContent, '<emoji>', '<emoji ismedium>');
        }
        var htmlWithTag = editedTag ? "".concat(htmlContent).concat(editedTag) : htmlContent;
        if (styleAsMuted) {
            htmlWithTag = "<muted-text>".concat(htmlWithTag, "<muted-text>");
        }
        htmlWithTag = (0, ReportActionsUtils_1.getHtmlWithAttachmentID)(htmlWithTag, reportActionID);
        return (<RenderCommentHTML_1.default containsOnlyEmojis={containsOnlyEmojis} source={source} html={htmlWithTag}/>);
    }
    return (<Text_1.default style={[containsOnlyEmojis && styles.onlyEmojisText, styles.ltr, style]}>
            <ZeroWidthView_1.default text={text} displayAsGroup={displayAsGroup}/>
            {processedTextArray.length !== 0 && !containsOnlyEmojis ? (<TextWithEmojiFragment_1.default message={message} style={[
                styles.ltr,
                style,
                styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                styleAsMuted ? styles.colorMuted : undefined,
                !(0, DeviceCapabilities_1.canUseTouchScreen)() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
            ]}/>) : (<Text_1.default style={[
                containsOnlyEmojis ? styles.onlyEmojisText : undefined,
                styles.ltr,
                style,
                styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                styleAsMuted ? styles.colorMuted : undefined,
                !(0, DeviceCapabilities_1.canUseTouchScreen)() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
            ]}>
                    {(0, convertToLTR_1.default)(message !== null && message !== void 0 ? message : '')}
                </Text_1.default>)}
            {!!(fragment === null || fragment === void 0 ? void 0 : fragment.isEdited) && (<>
                    <Text_1.default style={[containsOnlyEmojis && styles.onlyEmojisTextLineHeight]}> </Text_1.default>
                    <Text_1.default fontSize={variables_1.default.fontSizeSmall} color={theme.textSupporting} style={[styles.editedLabelStyles, styleAsDeleted && styles.offlineFeedback.deleted, style]}>
                        {translate('reportActionCompose.edited')}
                    </Text_1.default>
                </>)}
        </Text_1.default>);
}
TextCommentFragment.displayName = 'TextCommentFragment';
exports.default = (0, react_1.memo)(TextCommentFragment);
