"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isReportUnread = function (_a) {
    var _b = _a.lastReadTime, lastReadTime = _b === void 0 ? '' : _b, _c = _a.lastVisibleActionCreated, lastVisibleActionCreated = _c === void 0 ? '' : _c, _d = _a.lastMentionedTime, lastMentionedTime = _d === void 0 ? '' : _d;
    return lastReadTime < lastVisibleActionCreated || lastReadTime < (lastMentionedTime !== null && lastMentionedTime !== void 0 ? lastMentionedTime : '');
};
function ChatBubbleCell(_a) {
    var transaction = _a.transaction, containerStyles = _a.containerStyles, isInSingleTransactionReport = _a.isInSingleTransactionReport;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var iouReportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transaction.reportID), {
        selector: function (reportActions) { return (0, ReportActionsUtils_1.getIOUActionForTransactionID)(Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}), transaction.transactionID); },
        canBeMissing: true,
    })[0];
    var childReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportAction === null || iouReportAction === void 0 ? void 0 : iouReportAction.childReportID), {
        canBeMissing: true,
    })[0];
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction.reportID), {
        canBeMissing: false,
    })[0];
    var transactionReport = isInSingleTransactionReport ? parentReport : childReport;
    var threadMessages = (0, react_1.useMemo)(function () {
        var _a;
        return ({
            count: (_a = (iouReportAction && (iouReportAction === null || iouReportAction === void 0 ? void 0 : iouReportAction.childVisibleActionCount))) !== null && _a !== void 0 ? _a : 0,
            isUnread: (0, ReportUtils_1.isChatThread)(transactionReport) && isReportUnread(transactionReport),
        });
    }, [iouReportAction, transactionReport]);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var iconSize = shouldUseNarrowLayout ? variables_1.default.iconSizeSmall : variables_1.default.iconSizeNormal;
    var fontSize = shouldUseNarrowLayout ? variables_1.default.fontSizeXXSmall : variables_1.default.fontSizeExtraSmall;
    return (threadMessages.count > 0 && (<react_native_1.View style={[styles.dFlex, styles.alignItemsCenter, styles.justifyContentCenter, styles.textAlignCenter, StyleUtils.getWidthAndHeightStyle(iconSize), containerStyles]}>
                <Icon_1.default src={Expensicons_1.ChatBubbleCounter} additionalStyles={[styles.pAbsolute]} fill={threadMessages.isUnread ? theme.iconMenu : theme.icon} width={iconSize} height={iconSize}/>
                <Text_1.default style={[
            styles.textBold,
            StyleUtils.getLineHeightStyle(variables_1.default.lineHeightXSmall),
            StyleUtils.getColorStyle(theme.appBG),
            StyleUtils.getFontSizeStyle(fontSize),
            { top: -1 },
        ]}>
                    {threadMessages.count > 99 ? '99+' : threadMessages.count}
                </Text_1.default>
            </react_native_1.View>));
}
ChatBubbleCell.displayName = 'ChatBubbleCell';
exports.default = ChatBubbleCell;
