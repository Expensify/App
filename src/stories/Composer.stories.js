"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = Default;
// eslint-disable-next-line no-restricted-imports
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Composer_1 = require("@components/Composer");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var withNavigationFallback_1 = require("@components/withNavigationFallback");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
// eslint-disable-next-line no-restricted-imports
var theme_1 = require("@styles/theme");
var styles_1 = require("@src/styles");
var ComposerWithNavigation = (0, withNavigationFallback_1.default)(Composer_1.default);
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Composer',
    component: ComposerWithNavigation,
};
var parser = new expensify_common_1.ExpensiMark();
var DEFAULT_VALUE = "Composer can do the following:\n\n     * It can contain MD e.g. *bold* _italic_\n     * Supports Pasted Images via Ctrl+V";
function Default(props) {
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _a = (0, react_1.useState)(null), pastedFile = _a[0], setPastedFile = _a[1];
    var _b = (0, react_1.useState)(DEFAULT_VALUE), comment = _b[0], setComment = _b[1];
    var renderedHTML = parser.replace(comment !== null && comment !== void 0 ? comment : '');
    var _c = (0, react_1.useState)(function () { return ({ start: DEFAULT_VALUE.length, end: DEFAULT_VALUE.length, positionX: 0, positionY: 0 }); }), selection = _c[0], setSelection = _c[1];
    return (<react_native_1.View>
            <react_native_1.View style={[styles_1.defaultStyles.border, styles_1.defaultStyles.p4]}>
                <ComposerWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} multiline value={comment} onChangeText={setComment} onPasteFile={setPastedFile} selection={selection} onSelectionChange={function (e) {
            setSelection(e.nativeEvent.selection);
        }} style={[styles_1.defaultStyles.textInputCompose, styles_1.defaultStyles.w100, styles_1.defaultStyles.verticalAlignTop]}/>
            </react_native_1.View>
            <react_native_1.View style={[styles_1.defaultStyles.flexRow, styles_1.defaultStyles.mv5, styles_1.defaultStyles.flexWrap, styles_1.defaultStyles.w100]}>
                <react_native_1.View style={[styles_1.defaultStyles.border, styles_1.defaultStyles.noLeftBorderRadius, styles_1.defaultStyles.noRightBorderRadius, styles_1.defaultStyles.p5, styles_1.defaultStyles.flex1]}>
                    <Text_1.default style={[styles_1.defaultStyles.mb2, styles_1.defaultStyles.textLabelSupporting]}>Entered Comment (Drop Enabled)</Text_1.default>
                    <Text_1.default>{comment}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles_1.defaultStyles.p5, styles_1.defaultStyles.borderBottom, styles_1.defaultStyles.borderRight, styles_1.defaultStyles.borderTop, styles_1.defaultStyles.flex1]}>
                    <Text_1.default style={[styles_1.defaultStyles.mb2, styles_1.defaultStyles.textLabelSupporting]}>Rendered Comment</Text_1.default>
                    {!!renderedHTML && <RenderHTML_1.default html={renderedHTML}/>}
                    {!!pastedFile && pastedFile instanceof File && (<react_native_1.View style={styles_1.defaultStyles.mv3}>
                            <react_native_1.Image source={{ uri: URL.createObjectURL(pastedFile) }} resizeMode="contain" style={StyleUtils.getWidthAndHeightStyle(250, 250)}/>
                        </react_native_1.View>)}
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
Default.args = {
    autoFocus: true,
    placeholder: 'Compose Text Here',
    placeholderTextColor: theme_1.defaultTheme.placeholderText,
    isDisabled: false,
    maxLines: 16,
};
exports.default = story;
