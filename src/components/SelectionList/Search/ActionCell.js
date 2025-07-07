"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Badge_1 = require("@components/Badge");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var actionTranslationsMap = {
    view: 'common.view',
    review: 'common.review',
    submit: 'common.submit',
    approve: 'iou.approve',
    pay: 'iou.pay',
    done: 'common.done',
    paid: 'iou.settledExpensify',
};
function ActionCell(_a) {
    var _b = _a.action, action = _b === void 0 ? CONST_1.default.SEARCH.ACTION_TYPES.VIEW : _b, _c = _a.isLargeScreenWidth, isLargeScreenWidth = _c === void 0 ? true : _c, _d = _a.isSelected, isSelected = _d === void 0 ? false : _d, goToItem = _a.goToItem, _e = _a.isChildListItem, isChildListItem = _e === void 0 ? false : _e, _f = _a.parentAction, parentAction = _f === void 0 ? '' : _f, _g = _a.isLoading, isLoading = _g === void 0 ? false : _g;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var text = isChildListItem ? translate(actionTranslationsMap[CONST_1.default.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);
    var shouldUseViewAction = action === CONST_1.default.SEARCH.ACTION_TYPES.VIEW || (parentAction === CONST_1.default.SEARCH.ACTION_TYPES.PAID && action === CONST_1.default.SEARCH.ACTION_TYPES.PAID);
    if (!isChildListItem && ((parentAction !== CONST_1.default.SEARCH.ACTION_TYPES.PAID && action === CONST_1.default.SEARCH.ACTION_TYPES.PAID) || action === CONST_1.default.SEARCH.ACTION_TYPES.DONE)) {
        return (<react_native_1.View style={[StyleUtils.getHeight(variables_1.default.h28), styles.justifyContentCenter]}>
                <Badge_1.default text={text} icon={action === CONST_1.default.SEARCH.ACTION_TYPES.DONE ? Expensicons.Checkbox : Expensicons.Checkmark} badgeStyles={[
                styles.ml0,
                styles.ph2,
                styles.gap1,
                isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                StyleUtils.getHeight(variables_1.default.h20),
                StyleUtils.getMinimumHeight(variables_1.default.h20),
                isSelected ? StyleUtils.getBorderColorStyle(theme.buttonHoveredBG) : StyleUtils.getBorderColorStyle(theme.border),
            ]} textStyles={StyleUtils.getFontSizeStyle(variables_1.default.fontSizeExtraSmall)} iconStyles={styles.mr0} success/>
            </react_native_1.View>);
    }
    if (action === CONST_1.default.SEARCH.ACTION_TYPES.VIEW || action === CONST_1.default.SEARCH.ACTION_TYPES.REVIEW || shouldUseViewAction || isChildListItem) {
        var buttonInnerStyles = isSelected ? styles.buttonDefaultSelected : {};
        return isLargeScreenWidth ? (<Button_1.default text={text} onPress={goToItem} small style={[styles.w100]} innerStyles={buttonInnerStyles} link={isChildListItem} shouldUseDefaultHover={!isChildListItem} icon={!isChildListItem && action === CONST_1.default.SEARCH.ACTION_TYPES.REVIEW ? Expensicons.DotIndicator : undefined} iconFill={theme.danger} iconHoverFill={theme.dangerHover} isNested/>) : null;
    }
    return (<Button_1.default text={text} onPress={goToItem} small style={[styles.w100]} isLoading={isLoading} success isDisabled={isOffline} isNested/>);
}
ActionCell.displayName = 'ActionCell';
exports.default = ActionCell;
