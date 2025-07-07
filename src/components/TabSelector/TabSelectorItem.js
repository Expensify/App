"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Tooltip_1 = require("@components/Tooltip");
var EducationalTooltip_1 = require("@components/Tooltip/EducationalTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var TabIcon_1 = require("./TabIcon");
var TabLabel_1 = require("./TabLabel");
var AnimatedPressableWithFeedback = react_native_1.Animated.createAnimatedComponent(PressableWithFeedback_1.default);
function TabSelectorItem(_a) {
    var _b;
    var icon = _a.icon, _c = _a.title, title = _c === void 0 ? '' : _c, _d = _a.onPress, onPress = _d === void 0 ? function () { } : _d, _e = _a.backgroundColor, backgroundColor = _e === void 0 ? '' : _e, _f = _a.activeOpacity, activeOpacity = _f === void 0 ? 0 : _f, _g = _a.inactiveOpacity, inactiveOpacity = _g === void 0 ? 1 : _g, _h = _a.isActive, isActive = _h === void 0 ? false : _h, _j = _a.shouldShowLabelWhenInactive, shouldShowLabelWhenInactive = _j === void 0 ? true : _j, testID = _a.testID, _k = _a.shouldShowProductTrainingTooltip, shouldShowProductTrainingTooltip = _k === void 0 ? false : _k, renderProductTrainingTooltip = _a.renderProductTrainingTooltip;
    var styles = (0, useThemeStyles_1.default)();
    var _l = (0, react_1.useState)(false), isHovered = _l[0], setIsHovered = _l[1];
    var shouldShowEducationalTooltip = shouldShowProductTrainingTooltip && isActive;
    var children = (<AnimatedPressableWithFeedback accessibilityLabel={title} style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, backgroundColor), styles.userSelectNone]} wrapperStyle={[styles.flexGrow1]} onPress={onPress} onHoverIn={function () { return setIsHovered(true); }} onHoverOut={function () { return setIsHovered(false); }} role={CONST_1.default.ROLE.BUTTON} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b} testID={testID}>
            <TabIcon_1.default icon={icon} activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity} inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}/>
            {(shouldShowLabelWhenInactive || isActive) && (<TabLabel_1.default title={title} activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity} inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}/>)}
        </AnimatedPressableWithFeedback>);
    return shouldShowEducationalTooltip ? (<EducationalTooltip_1.default shouldRender renderTooltipContent={renderProductTrainingTooltip} shouldHideOnNavigate anchorAlignment={{
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }} wrapperStyle={[styles.productTrainingTooltipWrapper, styles.pAbsolute]} computeHorizontalShiftForNative>
            {children}
        </EducationalTooltip_1.default>) : (<Tooltip_1.default shouldRender={!shouldShowLabelWhenInactive && !isActive} text={title}>
            {children}
        </Tooltip_1.default>);
}
TabSelectorItem.displayName = 'TabSelectorItem';
exports.default = TabSelectorItem;
