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
var react_native_render_html_1 = require("react-native-render-html");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var convertToLTR_1 = require("@libs/convertToLTR");
var FontUtils_1 = require("@styles/utils/FontUtils");
var htmlEngineUtils_1 = require("./htmlEngineUtils");
var HTMLRenderers_1 = require("./HTMLRenderers");
// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// Beware that each prop should be referentially stable between renders to avoid
// costly invalidations and commits.
function BaseHTMLEngineProvider(_a) {
    var _b = _a.textSelectable, textSelectable = _b === void 0 ? false : _b, children = _a.children, _c = _a.enableExperimentalBRCollapsing, enableExperimentalBRCollapsing = _c === void 0 ? false : _c;
    var styles = (0, useThemeStyles_1.default)();
    // Declare nonstandard tags and their content model here
    /* eslint-disable @typescript-eslint/naming-convention */
    var customHTMLElementModels = (0, react_1.useMemo)(function () { return ({
        edited: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'edited',
            contentModel: react_native_render_html_1.HTMLContentModel.textual,
        }),
        'task-title': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'task-title',
            contentModel: react_native_render_html_1.HTMLContentModel.block,
            mixedUAStyles: __assign({}, styles.taskTitleMenuItem),
        }),
        'alert-text': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'alert-text',
            mixedUAStyles: __assign(__assign({}, styles.formError), styles.mb0),
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        'deleted-action': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'alert-text',
            mixedUAStyles: __assign(__assign({}, styles.formError), styles.mb0),
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        rbr: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'rbr',
            getMixedUAStyles: function (tnode) {
                if (tnode.attributes.issmall === undefined) {
                    return __assign(__assign({}, styles.formError), styles.mb0);
                }
                return __assign(__assign(__assign({}, styles.formError), styles.mb0), styles.textMicro);
            },
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        'muted-text': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'muted-text',
            mixedUAStyles: __assign(__assign({}, styles.colorMuted), styles.mb0),
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        'muted-text-label': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'muted-text-label',
            mixedUAStyles: __assign(__assign({}, styles.mutedNormalTextLabel), styles.mb0),
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        comment: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'comment',
            getMixedUAStyles: function (tnode) {
                if (tnode.attributes.islarge === undefined) {
                    if (tnode.attributes.center === undefined) {
                        return { whiteSpace: 'pre' };
                    }
                    return { whiteSpace: 'pre', flex: 1, justifyContent: 'center' };
                }
                return __assign({ whiteSpace: 'pre' }, styles.onlyEmojisText);
            },
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        'email-comment': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'email-comment',
            getMixedUAStyles: function (tnode) {
                if (tnode.attributes.islarge === undefined) {
                    return { whiteSpace: 'normal' };
                }
                return __assign({ whiteSpace: 'normal' }, styles.onlyEmojisText);
            },
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        strong: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'strong',
            getMixedUAStyles: function (tnode) { return ((0, htmlEngineUtils_1.isChildOfTaskTitle)(tnode) ? {} : styles.strong); },
            contentModel: react_native_render_html_1.HTMLContentModel.textual,
        }),
        em: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'em',
            getMixedUAStyles: function (tnode) { return ((0, htmlEngineUtils_1.isChildOfTaskTitle)(tnode) ? styles.taskTitleMenuItemItalic : styles.em); },
            contentModel: react_native_render_html_1.HTMLContentModel.textual,
        }),
        h1: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'h1',
            getMixedUAStyles: function (tnode) { return ((0, htmlEngineUtils_1.isChildOfTaskTitle)(tnode) ? {} : styles.h1); },
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        'mention-user': react_native_render_html_1.HTMLElementModel.fromCustomModel({ tagName: 'mention-user', contentModel: react_native_render_html_1.HTMLContentModel.textual }),
        'mention-report': react_native_render_html_1.HTMLElementModel.fromCustomModel({ tagName: 'mention-report', contentModel: react_native_render_html_1.HTMLContentModel.textual }),
        'mention-here': react_native_render_html_1.HTMLElementModel.fromCustomModel({ tagName: 'mention-here', contentModel: react_native_render_html_1.HTMLContentModel.textual }),
        'mention-short': react_native_render_html_1.HTMLElementModel.fromCustomModel({ tagName: 'mention-short', contentModel: react_native_render_html_1.HTMLContentModel.textual }),
        'next-step': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'next-step',
            mixedUAStyles: __assign(__assign({}, styles.textLabelSupporting), styles.lh16),
            contentModel: react_native_render_html_1.HTMLContentModel.textual,
        }),
        'next-step-email': react_native_render_html_1.HTMLElementModel.fromCustomModel({ tagName: 'next-step-email', contentModel: react_native_render_html_1.HTMLContentModel.textual }),
        video: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'video',
            mixedUAStyles: { whiteSpace: 'pre' },
            contentModel: react_native_render_html_1.HTMLContentModel.block,
        }),
        emoji: react_native_render_html_1.HTMLElementModel.fromCustomModel({ tagName: 'emoji', contentModel: react_native_render_html_1.HTMLContentModel.textual }),
        'completed-task': react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'completed-task',
            mixedUAStyles: __assign(__assign({}, styles.textSupporting), styles.textLineThrough),
            contentModel: react_native_render_html_1.HTMLContentModel.textual,
        }),
        blockquote: react_native_render_html_1.HTMLElementModel.fromCustomModel({
            tagName: 'blockquote',
            contentModel: react_native_render_html_1.HTMLContentModel.block,
            getMixedUAStyles: function (tnode) {
                if (tnode.attributes.isemojisonly === undefined) {
                    return (0, htmlEngineUtils_1.isChildOfTaskTitle)(tnode) ? {} : styles.blockquote;
                }
                return (0, htmlEngineUtils_1.isChildOfTaskTitle)(tnode) ? {} : __assign(__assign({}, styles.blockquote), styles.onlyEmojisTextLineHeight);
            },
        }),
    }); }, [
        styles.taskTitleMenuItem,
        styles.formError,
        styles.mb0,
        styles.colorMuted,
        styles.mutedNormalTextLabel,
        styles.textLabelSupporting,
        styles.lh16,
        styles.textSupporting,
        styles.textLineThrough,
        styles.textMicro,
        styles.onlyEmojisText,
        styles.strong,
        styles.taskTitleMenuItemItalic,
        styles.em,
        styles.h1,
        styles.blockquote,
        styles.onlyEmojisTextLineHeight,
    ]);
    /* eslint-enable @typescript-eslint/naming-convention */
    // We need to memoize this prop to make it referentially stable.
    var defaultTextProps = (0, react_1.useMemo)(function () { return ({ selectable: textSelectable, allowFontScaling: false, textBreakStrategy: 'simple' }); }, [textSelectable]);
    var defaultViewProps = { style: [styles.alignItemsStart, styles.userSelectText, styles.mw100] };
    return (<react_native_render_html_1.TRenderEngineProvider customHTMLElementModels={customHTMLElementModels} baseStyle={styles.webViewStyles.baseFontStyle} tagsStyles={styles.webViewStyles.tagStyles} enableCSSInlineProcessing={false} systemFonts={Object.values(FontUtils_1.default.fontFamily.single).map(function (font) { return font.fontFamily; })} htmlParserOptions={{
            recognizeSelfClosing: true,
        }} domVisitors={{
            // eslint-disable-next-line no-param-reassign
            onText: function (text) { return (text.data = (0, convertToLTR_1.default)(text.data)); },
        }}>
            <react_native_render_html_1.RenderHTMLConfigProvider defaultTextProps={defaultTextProps} defaultViewProps={defaultViewProps} renderers={HTMLRenderers_1.default} computeEmbeddedMaxWidth={htmlEngineUtils_1.computeEmbeddedMaxWidth} enableExperimentalBRCollapsing={enableExperimentalBRCollapsing}>
                {children}
            </react_native_render_html_1.RenderHTMLConfigProvider>
        </react_native_render_html_1.TRenderEngineProvider>);
}
BaseHTMLEngineProvider.displayName = 'BaseHTMLEngineProvider';
exports.default = BaseHTMLEngineProvider;
