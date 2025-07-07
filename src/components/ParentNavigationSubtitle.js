"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var useHover_1 = require("@hooks/useHover");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useRootNavigationState_1 = require("@hooks/useRootNavigationState");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
function ParentNavigationSubtitle(_a) {
    var parentNavigationSubtitleData = _a.parentNavigationSubtitleData, parentReportActionID = _a.parentReportActionID, _b = _a.parentReportID, parentReportID = _b === void 0 ? '' : _b, pressableStyles = _a.pressableStyles, _c = _a.openParentReportInCurrentTab, openParentReportInCurrentTab = _c === void 0 ? false : _c;
    var currentRoute = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _d = (0, useHover_1.default)(), hovered = _d.hovered, _e = _d.bind, onMouseEnter = _e.onMouseEnter, onMouseLeave = _e.onMouseLeave;
    var workspaceName = parentNavigationSubtitleData.workspaceName, reportName = parentNavigationSubtitleData.reportName;
    var translate = (0, useLocalize_1.default)().translate;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID), { canBeMissing: false })[0];
    var canUserPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
    var isReportInRHP = currentRoute.name === SCREENS_1.default.SEARCH.REPORT_RHP;
    var currentFullScreenRoute = (0, useRootNavigationState_1.default)(function (state) { var _a; return (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0 ? void 0 : _a.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); }); });
    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }
    var onPress = function () {
        var _a, _b, _c;
        var parentAction = (0, ReportActionsUtils_1.getReportAction)(parentReportID, parentReportActionID);
        var isVisibleAction = (0, ReportActionsUtils_1.shouldReportActionBeVisible)(parentAction, (_a = parentAction === null || parentAction === void 0 ? void 0 : parentAction.reportActionID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID, canUserPerformWriteAction);
        if (openParentReportInCurrentTab && isReportInRHP) {
            // If the report is displayed in RHP in Reports tab, we want to stay in the current tab after opening the parent report
            if ((currentFullScreenRoute === null || currentFullScreenRoute === void 0 ? void 0 : currentFullScreenRoute.name) === NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR) {
                var lastRoute = (_b = currentFullScreenRoute === null || currentFullScreenRoute === void 0 ? void 0 : currentFullScreenRoute.state) === null || _b === void 0 ? void 0 : _b.routes.at(-1);
                if ((lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) === SCREENS_1.default.SEARCH.MONEY_REQUEST_REPORT) {
                    var moneyRequestReportID = (_c = lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.params) === null || _c === void 0 ? void 0 : _c.reportID;
                    // If the parent report is already displayed underneath RHP, simply dismiss the modal
                    if (moneyRequestReportID === parentReportID) {
                        Navigation_1.default.dismissModal();
                        return;
                    }
                }
                Navigation_1.default.navigate(ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: parentReportID }));
                return;
            }
            // If the parent report is already displayed underneath RHP, simply dismiss the modal
            if (Navigation_1.default.getTopmostReportId() === parentReportID) {
                Navigation_1.default.dismissModal();
                return;
            }
        }
        if (isVisibleAction) {
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(parentReportID, parentReportActionID));
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(parentReportID));
        }
    };
    return (<Text_1.default style={[styles.optionAlternateText, styles.textLabelSupporting]} numberOfLines={1}>
            {!!reportName && (<>
                    <Text_1.default style={[styles.optionAlternateText, styles.textLabelSupporting]}>{"".concat(translate('threads.from'), " ")}</Text_1.default>
                    <TextLink_1.default onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onPress={onPress} accessibilityLabel={translate('threads.parentNavigationSummary', { reportName: reportName, workspaceName: workspaceName })} style={[pressableStyles, styles.optionAlternateText, styles.textLabelSupporting, hovered ? StyleUtils.getColorStyle(theme.linkHover) : styles.link]}>
                        {reportName}
                    </TextLink_1.default>
                </>)}
            {!!workspaceName && workspaceName !== reportName && (<Text_1.default style={[styles.optionAlternateText, styles.textLabelSupporting]}>{" ".concat(translate('threads.in'), " ").concat(workspaceName)}</Text_1.default>)}
        </Text_1.default>);
}
ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
exports.default = ParentNavigationSubtitle;
