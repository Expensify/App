"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var Provider_1 = require("@components/DragAndDrop/Provider");
var MoneyRequestReportView_1 = require("@components/MoneyRequestReportView/MoneyRequestReportView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useIsReportReadyToDisplay_1 = require("@hooks/useIsReportReadyToDisplay");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getNonEmptyStringOnyxID_1 = require("@libs/getNonEmptyStringOnyxID");
var ReportUtils_1 = require("@libs/ReportUtils");
var Navigation_1 = require("@navigation/Navigation");
var ReactionListWrapper_1 = require("@pages/home/ReactionListWrapper");
var Report_1 = require("@userActions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReportScreenContext_1 = require("@src/pages/home/ReportScreenContext");
var defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};
function SearchMoneyRequestReportPage(_a) {
    var _b;
    var route = _a.route;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var reportIDFromRoute = (0, getNonEmptyStringOnyxID_1.default)((_b = route.params) === null || _b === void 0 ? void 0 : _b.reportID);
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportIDFromRoute), { allowStaleData: true, canBeMissing: true })[0];
    var _c = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportIDFromRoute), { canBeMissing: true, allowStaleData: true })[0], reportMetadata = _c === void 0 ? defaultReportMetadata : _c;
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { allowStaleData: true, initialValue: {}, canBeMissing: false })[0];
    var policy = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0];
    var _d = (0, useIsReportReadyToDisplay_1.default)(report, reportIDFromRoute), isEditingDisabled = _d.isEditingDisabled, isCurrentReportLoadedFromOnyx = _d.isCurrentReportLoadedFromOnyx;
    var _e = (0, react_1.useState)({}), scrollPosition = _e[0], setScrollPosition = _e[1];
    var flatListRef = (0, react_1.useRef)(null);
    var actionListValue = (0, react_1.useMemo)(function () { return ({ flatListRef: flatListRef, scrollPosition: scrollPosition, setScrollPosition: setScrollPosition }); }, [flatListRef, scrollPosition, setScrollPosition]);
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    (0, react_1.useEffect)(function () {
        (0, Report_1.openReport)(reportIDFromRoute, '', [], undefined, undefined, false, [], undefined, true);
    }, [reportIDFromRoute]);
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = (0, react_1.useMemo)(function () {
        if (isLoadingApp !== false) {
            return false;
        }
        // eslint-disable-next-line react-compiler/react-compiler
        if (!reportID && !(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions)) {
            // eslint-disable-next-line react-compiler/react-compiler
            return true;
        }
        return !!reportID && !(0, ReportUtils_1.isValidReportIDFromPath)(reportID);
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [reportID, reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions]);
    if (shouldUseNarrowLayout) {
        return (<ReportScreenContext_1.ActionListContext.Provider value={actionListValue}>
                <ReactionListWrapper_1.default>
                    <ScreenWrapper_1.default testID={SearchMoneyRequestReportPage.displayName} shouldEnableMaxHeight offlineIndicatorStyle={styles.mtAuto} headerGapStyles={styles.searchHeaderGap}>
                        <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundPage} subtitleKey="notFound.noAccess" subtitleStyle={[styles.textSupporting]} shouldDisplaySearchRouter shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={Navigation_1.default.goBack}>
                            <Provider_1.default isDisabled={isEditingDisabled}>
                                <MoneyRequestReportView_1.default report={report} reportMetadata={reportMetadata} policy={policy} shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx} backToRoute={route.params.backTo}/>
                            </Provider_1.default>
                        </FullPageNotFoundView_1.default>
                    </ScreenWrapper_1.default>
                </ReactionListWrapper_1.default>
            </ReportScreenContext_1.ActionListContext.Provider>);
    }
    return (<ReportScreenContext_1.ActionListContext.Provider value={actionListValue}>
            <ReactionListWrapper_1.default>
                <ScreenWrapper_1.default testID={SearchMoneyRequestReportPage.displayName} shouldEnableMaxHeight offlineIndicatorStyle={styles.mtAuto} headerGapStyles={[styles.searchHeaderGap, styles.h0]}>
                    <react_native_1.View style={[styles.searchSplitContainer, styles.flexColumn, styles.flex1]}>
                        <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundPage} subtitleKey="notFound.noAccess" subtitleStyle={[styles.textSupporting]} shouldDisplaySearchRouter shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={Navigation_1.default.goBack}>
                            <Provider_1.default isDisabled={isEditingDisabled}>
                                <react_native_1.View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                                    <MoneyRequestReportView_1.default report={report} reportMetadata={reportMetadata} policy={policy} shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx} backToRoute={route.params.backTo}/>
                                </react_native_1.View>
                                <portal_1.PortalHost name="suggestions"/>
                            </Provider_1.default>
                        </FullPageNotFoundView_1.default>
                    </react_native_1.View>
                </ScreenWrapper_1.default>
            </ReactionListWrapper_1.default>
        </ReportScreenContext_1.ActionListContext.Provider>);
}
SearchMoneyRequestReportPage.displayName = 'SearchMoneyRequestReportPage';
exports.default = SearchMoneyRequestReportPage;
