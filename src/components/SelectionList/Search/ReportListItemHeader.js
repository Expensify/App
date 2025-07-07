"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Checkbox_1 = require("@components/Checkbox");
var ReportSearchHeader_1 = require("@components/ReportSearchHeader");
var SearchContext_1 = require("@components/Search/SearchContext");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Search_1 = require("@userActions/Search");
var CONST_1 = require("@src/CONST");
var ActionCell_1 = require("./ActionCell");
var UserInfoAndActionButtonRow_1 = require("./UserInfoAndActionButtonRow");
function TotalCell(_a) {
    var _b;
    var showTooltip = _a.showTooltip, isLargeScreenWidth = _a.isLargeScreenWidth, reportItem = _a.reportItem;
    var styles = (0, useThemeStyles_1.default)();
    var total = (_b = reportItem === null || reportItem === void 0 ? void 0 : reportItem.total) !== null && _b !== void 0 ? _b : 0;
    if (total) {
        if ((reportItem === null || reportItem === void 0 ? void 0 : reportItem.type) === CONST_1.default.REPORT.TYPE.IOU) {
            total = Math.abs(total !== null && total !== void 0 ? total : 0);
        }
        else {
            total *= (reportItem === null || reportItem === void 0 ? void 0 : reportItem.type) === CONST_1.default.REPORT.TYPE.EXPENSE || (reportItem === null || reportItem === void 0 ? void 0 : reportItem.type) === CONST_1.default.REPORT.TYPE.INVOICE ? -1 : 1;
        }
    }
    return (<TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={(0, CurrencyUtils_1.convertToDisplayString)(total, reportItem === null || reportItem === void 0 ? void 0 : reportItem.currency)} style={[styles.optionDisplayName, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? styles.textNormal : [styles.textBold, styles.textAlignRight]]}/>);
}
function HeaderFirstRow(_a) {
    var _b;
    var policy = _a.policy, reportItem = _a.report, onCheckboxPress = _a.onCheckboxPress, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, _c = _a.handleOnButtonPress, handleOnButtonPress = _c === void 0 ? function () { } : _c, _d = _a.shouldShowAction, shouldShowAction = _d === void 0 ? false : _d, avatarBorderColor = _a.avatarBorderColor;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart, styles.pr3, styles.pl3]}>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                {!!canSelectMultiple && (<Checkbox_1.default onPress={function () { return onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(reportItem); }} isChecked={reportItem.isSelected} containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!reportItem.isSelected, !!reportItem.isDisabled)]} disabled={!!isDisabled || reportItem.isDisabledCheckbox} accessibilityLabel={(_b = reportItem.text) !== null && _b !== void 0 ? _b : ''} shouldStopMouseDownPropagation style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), reportItem.isDisabledCheckbox && styles.cursorDisabled]}/>)}
                <react_native_1.View style={[{ flexShrink: 1, flexGrow: 1, minWidth: 0 }, styles.mr2]}>
                    <ReportSearchHeader_1.default report={reportItem} policy={policy} style={[{ maxWidth: 700 }]} transactions={reportItem.transactions} avatarBorderColor={avatarBorderColor}/>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[styles.flexShrink0, shouldShowAction && styles.mr3]}>
                <TotalCell showTooltip isLargeScreenWidth={false} reportItem={reportItem}/>
            </react_native_1.View>
            {shouldShowAction && (<react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    <ActionCell_1.default action={reportItem.action} goToItem={handleOnButtonPress} isSelected={reportItem.isSelected} isLoading={reportItem.isActionLoading}/>
                </react_native_1.View>)}
        </react_native_1.View>);
}
function ReportListItemHeader(_a) {
    var _b, _c;
    var policy = _a.policy, reportItem = _a.report, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, isDisabled = _a.isDisabled, isHovered = _a.isHovered, isFocused = _a.isFocused, canSelectMultiple = _a.canSelectMultiple;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var theme = (0, useTheme_1.default)();
    var currentSearchHash = (0, SearchContext_1.useSearchContext)().currentSearchHash;
    var _d = (0, useResponsiveLayout_1.default)(), isLargeScreenWidth = _d.isLargeScreenWidth, shouldUseNarrowLayout = _d.shouldUseNarrowLayout;
    var thereIsFromAndTo = !!(reportItem === null || reportItem === void 0 ? void 0 : reportItem.from) && !!(reportItem === null || reportItem === void 0 ? void 0 : reportItem.to);
    var showUserInfo = (reportItem.type === CONST_1.default.REPORT.TYPE.IOU && thereIsFromAndTo) || (reportItem.type === CONST_1.default.REPORT.TYPE.EXPENSE && !!(reportItem === null || reportItem === void 0 ? void 0 : reportItem.from));
    var avatarBorderColor = (_c = (_b = StyleUtils.getItemBackgroundColorStyle(!!reportItem.isSelected, !!isFocused || !!isHovered, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)) === null || _b === void 0 ? void 0 : _b.backgroundColor) !== null && _c !== void 0 ? _c : theme.highlightBG;
    var handleOnButtonPress = function () {
        (0, Search_1.handleActionButtonPress)(currentSearchHash, reportItem, function () { return onSelectRow(reportItem); }, shouldUseNarrowLayout && !!canSelectMultiple);
    };
    return !isLargeScreenWidth ? (<react_native_1.View>
            <HeaderFirstRow report={reportItem} policy={policy} onCheckboxPress={onCheckboxPress} isDisabled={isDisabled} canSelectMultiple={canSelectMultiple} avatarBorderColor={avatarBorderColor}/>
            <UserInfoAndActionButtonRow_1.default item={reportItem} handleActionButtonPress={handleOnButtonPress} shouldShowUserInfo={showUserInfo}/>
        </react_native_1.View>) : (<react_native_1.View>
            <HeaderFirstRow report={reportItem} policy={policy} onCheckboxPress={onCheckboxPress} isDisabled={isDisabled} canSelectMultiple={canSelectMultiple} shouldShowAction handleOnButtonPress={handleOnButtonPress} avatarBorderColor={avatarBorderColor}/>
            <react_native_1.View style={[styles.pv2, styles.ph3]}>
                <react_native_1.View style={[styles.borderBottom]}/>
            </react_native_1.View>
        </react_native_1.View>);
}
ReportListItemHeader.displayName = 'ReportListItemHeader';
exports.default = ReportListItemHeader;
