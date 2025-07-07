"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var ReportActionItem_1 = require("@pages/home/report/ReportActionItem");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BaseListItem_1 = require("./BaseListItem");
function ChatListItem(_a) {
    var _b, _c, _d;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onDismissError = _a.onDismissError, onFocus = _a.onFocus, onLongPressRow = _a.onLongPressRow, shouldSyncFocus = _a.shouldSyncFocus, policies = _a.policies, allReports = _a.allReports;
    var reportActionItem = item;
    var reportID = Number((_b = reportActionItem === null || reportActionItem === void 0 ? void 0 : reportActionItem.reportID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID);
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
        canBeMissing: true,
    })[0];
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var animatedHighlightStyle = (0, useAnimatedHighlightStyle_1.default)({
        borderRadius: variables_1.default.componentBorderRadius,
        shouldHighlight: (_c = item === null || item === void 0 ? void 0 : item.shouldAnimateInHighlight) !== null && _c !== void 0 ? _c : false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    var pressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.p0,
        styles.textAlignLeft,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
        item.cursorStyle,
    ];
    return (<BaseListItem_1.default item={item} pressableStyle={pressableStyle} wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone]} containerStyle={styles.mb2} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onLongPressRow={onLongPressRow} onSelectRow={onSelectRow} onDismissError={onDismissError} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus} pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]} hoverStyle={item.isSelected && styles.activeComponentBG}>
            <ReportActionItem_1.default allReports={allReports} action={reportActionItem} report={report} reportActions={[]} onPress={function () { return onSelectRow(item); }} parentReportAction={undefined} displayAsGroup={false} isMostRecentIOUReportAction={false} shouldDisplayNewMarker={false} index={(_d = item.index) !== null && _d !== void 0 ? _d : 0} isFirstVisibleReportAction={false} shouldDisplayContextMenu={false} shouldShowDraftMessage={false} shouldShowSubscriptAvatar={((0, ReportUtils_1.isPolicyExpenseChat)(report) || (0, ReportUtils_1.isInvoiceRoom)(report)) &&
            [
                CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED,
                CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED,
                CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED,
            ].some(function (type) { return type === reportActionItem.actionName; })} policies={policies} shouldShowBorder/>
        </BaseListItem_1.default>);
}
ChatListItem.displayName = 'ChatListItem';
exports.default = ChatListItem;
