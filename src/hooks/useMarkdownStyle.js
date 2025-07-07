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
var react_1 = require("react");
var FontUtils_1 = require("@styles/utils/FontUtils");
var variables_1 = require("@styles/variables");
var useTheme_1 = require("./useTheme");
var defaultEmptyArray = [];
function useMarkdownStyle(hasMessageOnlyEmojis, excludeStyles) {
    if (excludeStyles === void 0) { excludeStyles = defaultEmptyArray; }
    var theme = (0, useTheme_1.default)();
    var emojiFontSize = hasMessageOnlyEmojis ? variables_1.default.fontSizeOnlyEmojis : variables_1.default.fontSizeEmojisWithinText;
    // this map is used to reset the styles that are not needed - passing undefined value can break the native side
    var nonStylingDefaultValues = (0, react_1.useMemo)(function () { return ({
        color: theme.text,
        backgroundColor: 'transparent',
        marginLeft: 0,
        paddingLeft: 0,
        borderColor: 'transparent',
        borderWidth: 0,
    }); }, [theme]);
    var markdownStyle = (0, react_1.useMemo)(function () {
        var styling = {
            syntax: {
                color: theme.syntax,
            },
            link: {
                color: theme.link,
            },
            h1: {
                fontSize: variables_1.default.fontSizeLarge,
            },
            emoji: {
                fontSize: emojiFontSize,
                lineHeight: variables_1.default.lineHeightXLarge,
            },
            blockquote: {
                borderColor: theme.border,
                borderWidth: 4,
                marginLeft: 0,
                paddingLeft: 6,
                /**
                 * since blockquote has `inline-block` display -> padding-right is needed to prevent cursor overlapping
                 * with last character of the text node.
                 * As long as paddingRight > cursor.width, cursor will be displayed correctly.
                 */
                paddingRight: 1,
            },
            code: {
                fontFamily: FontUtils_1.default.fontFamily.platform.MONOSPACE.fontFamily,
                fontSize: 13, // TODO: should be 15 if inside h1, see StyleUtils.getCodeFontSize
                color: theme.text,
                backgroundColor: 'transparent',
            },
            pre: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.MONOSPACE), { fontSize: 13, color: theme.text, backgroundColor: 'transparent' }),
            mentionHere: {
                color: theme.ourMentionText,
                backgroundColor: theme.ourMentionBG,
                borderRadius: variables_1.default.componentBorderRadiusSmall,
            },
            mentionUser: {
                color: theme.mentionText,
                backgroundColor: theme.mentionBG,
                borderRadius: variables_1.default.componentBorderRadiusSmall,
            },
            mentionReport: {
                color: theme.mentionText,
                backgroundColor: theme.mentionBG,
            },
            inlineImage: {
                minWidth: variables_1.default.inlineImagePreviewMinSize,
                minHeight: variables_1.default.inlineImagePreviewMinSize,
                maxWidth: variables_1.default.inlineImagePreviewMaxSize,
                maxHeight: variables_1.default.inlineImagePreviewMaxSize,
                borderRadius: variables_1.default.componentBorderRadius,
                marginTop: 4,
            },
            loadingIndicator: {
                primaryColor: theme.spinner,
                secondaryColor: "".concat(theme.spinner, "33"),
            },
            loadingIndicatorContainer: {},
        };
        if (excludeStyles.length) {
            excludeStyles.forEach(function (key) {
                var style = styling[key];
                if (style) {
                    Object.keys(style).forEach(function (styleKey) {
                        var _a;
                        style[styleKey] = (_a = nonStylingDefaultValues[styleKey]) !== null && _a !== void 0 ? _a : style[styleKey];
                    });
                }
            });
        }
        return styling;
    }, [theme, emojiFontSize, excludeStyles, nonStylingDefaultValues]);
    return markdownStyle;
}
exports.default = useMarkdownStyle;
