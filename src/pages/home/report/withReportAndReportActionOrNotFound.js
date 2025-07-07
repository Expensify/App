"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Report_1 = require("@libs/actions/Report");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
var getNonEmptyStringOnyxID_1 = require("@libs/getNonEmptyStringOnyxID");
var ReportUtils_1 = require("@libs/ReportUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function default_1(WrappedComponent) {
    function WithReportOrNotFound(props, ref) {
        var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(props.route.params.reportID), { canBeMissing: true })[0];
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID)), { canBeMissing: true })[0];
        var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(props.route.params.reportID), { canBeMissing: true })[0];
        var isLoadingReportData = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { canBeMissing: true })[0];
        var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: false })[0];
        var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(props.route.params.reportID), { canEvict: false, canBeMissing: true })[0];
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var parentReportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID)), {
            selector: function (parentReportActions) {
                var _a;
                var parentReportActionID = report === null || report === void 0 ? void 0 : report.parentReportActionID;
                if (!parentReportActionID) {
                    return null;
                }
                return (_a = parentReportActions === null || parentReportActions === void 0 ? void 0 : parentReportActions[parentReportActionID]) !== null && _a !== void 0 ? _a : null;
            },
            canEvict: false,
            canBeMissing: true,
        })[0];
        var linkedReportAction = (0, react_1.useMemo)(function () {
            var reportAction = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(props.route.params.reportActionID)];
            // Handle threads if needed
            if (!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID)) {
                reportAction = parentReportAction !== null && parentReportAction !== void 0 ? parentReportAction : undefined;
            }
            return reportAction;
        }, [reportActions, props.route.params.reportActionID, parentReportAction]);
        var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
        // For small screen, we don't call openReport API when we go to a sub report page by deeplink
        // So we need to call openReport here for small screen
        (0, react_1.useEffect)(function () {
            if (!shouldUseNarrowLayout || (!(0, EmptyObject_1.isEmptyObject)(report) && !(0, EmptyObject_1.isEmptyObject)(linkedReportAction))) {
                return;
            }
            (0, Report_1.openReport)(props.route.params.reportID);
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, [shouldUseNarrowLayout, props.route.params.reportID]);
        // Perform all the loading checks
        var isLoadingReport = isLoadingReportData && !(report === null || report === void 0 ? void 0 : report.reportID);
        var isLoadingReportAction = (0, EmptyObject_1.isEmptyObject)(reportActions) || ((reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions) && (0, EmptyObject_1.isEmptyObject)(linkedReportAction));
        var shouldHideReport = !isLoadingReport && (!(report === null || report === void 0 ? void 0 : report.reportID) || !(0, ReportUtils_1.canAccessReport)(report, betas));
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((isLoadingReport || isLoadingReportAction) && !shouldHideReport) {
            return <FullscreenLoadingIndicator_1.default />;
        }
        // Perform the access/not found checks
        // Be sure to avoid showing the not-found page while the parent report actions are still being read from Onyx. The parentReportAction will be undefined while it's being read from Onyx
        // and then linkedReportAction will either be a valid parentReportAction or an empty object. In the case of an empty object, then it's OK to show the not-found page.
        if (shouldHideReport || (parentReportAction !== undefined && (0, EmptyObject_1.isEmptyObject)(linkedReportAction))) {
            return <NotFoundPage_1.default />;
        }
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} report={report} parentReport={parentReport} reportAction={linkedReportAction} parentReportAction={parentReportAction} ref={ref}/>);
    }
    WithReportOrNotFound.displayName = "withReportOrNotFound(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
    return react_1.default.forwardRef(WithReportOrNotFound);
}
