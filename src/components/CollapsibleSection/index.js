"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Collapsible_1 = require("./Collapsible");
function CollapsibleSection(_a) {
    var _b;
    var title = _a.title, children = _a.children, titleStyle = _a.titleStyle, textStyle = _a.textStyle, wrapperStyle = _a.wrapperStyle, shouldShowSectionBorder = _a.shouldShowSectionBorder;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    /**
     * Expands/collapses the section
     */
    var toggleSection = function () {
        setIsExpanded(!isExpanded);
    };
    var src = isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow;
    return (<react_native_1.View style={[styles.mt4, wrapperStyle]}>
            <PressableWithFeedback_1.default onPress={toggleSection} style={[styles.pb4, styles.flexRow]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={title} hoverDimmingValue={1} pressDimmingValue={0.2}>
                <Text_1.default style={textStyle !== null && textStyle !== void 0 ? textStyle : [styles.flex1, styles.textStrong, styles.userSelectNone, titleStyle]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                    {title}
                </Text_1.default>
                <Icon_1.default fill={theme.icon} src={src}/>
            </PressableWithFeedback_1.default>
            {!!shouldShowSectionBorder && <react_native_1.View style={styles.collapsibleSectionBorder}/>}
            <Collapsible_1.default isOpened={isExpanded}>
                <react_native_1.View>{children}</react_native_1.View>
            </Collapsible_1.default>
        </react_native_1.View>);
}
exports.default = CollapsibleSection;
