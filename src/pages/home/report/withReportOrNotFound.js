"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
/* eslint-disable rulesdir/no-negated-variables */
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var Report_1 = require("@libs/actions/Report");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
var ReportUtils_1 = require("@libs/ReportUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function default_1(shouldRequireReportID) {
    if (shouldRequireReportID === void 0) { shouldRequireReportID = true; }
    return function (WrappedComponent) {
        function WithReportOrNotFound(props, ref) {
            var _a;
            var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: false })[0];
            var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(props.route.params.reportID), { canBeMissing: true })[0];
            var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
            var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(props.route.params.reportID), { canBeMissing: true })[0];
            var isLoadingReportData = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { canBeMissing: true })[0];
            var isFocused = (0, native_1.useIsFocused)();
            var contentShown = react_1.default.useRef(false);
            var isReportIdInRoute = !!((_a = props.route.params.reportID) === null || _a === void 0 ? void 0 : _a.length);
            var isReportLoaded = !(0, EmptyObject_1.isEmptyObject)(report) && !!(report === null || report === void 0 ? void 0 : report.reportID);
            // The `isLoadingInitialReportActions` value will become `false` only after the first OpenReport API call is finished (either succeeded or failed)
            var shouldFetchReport = isReportIdInRoute && (reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions) !== false;
            // When accessing certain report-dependant pages (e.g. Task Title) by deeplink, the OpenReport API is not called,
            // So we need to call OpenReport API here to make sure the report data is loaded if it exists on the Server
            (0, react_1.useEffect)(function () {
                if (isReportLoaded || !shouldFetchReport) {
                    // If the report is not required or is already loaded, we don't need to call the API
                    return;
                }
                (0, Report_1.openReport)(props.route.params.reportID);
                // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
            }, [shouldFetchReport, isReportLoaded, props.route.params.reportID]);
            if (shouldRequireReportID || isReportIdInRoute) {
                var shouldShowFullScreenLoadingIndicator = !isReportLoaded && (isLoadingReportData !== false || shouldFetchReport);
                var shouldShowNotFoundPage = !isReportLoaded || !(0, ReportUtils_1.canAccessReport)(report, betas);
                // If the content was shown, but it's not anymore, that means the report was deleted, and we are probably navigating out of this screen.
                // Return null for this case to avoid rendering FullScreenLoadingIndicator or NotFoundPage when animating transition.
                // eslint-disable-next-line react-compiler/react-compiler
                if (shouldShowNotFoundPage && contentShown.current && !isFocused) {
                    return null;
                }
                if (shouldShowFullScreenLoadingIndicator) {
                    return <FullscreenLoadingIndicator_1.default />;
                }
                if (shouldShowNotFoundPage) {
                    return <NotFoundPage_1.default isReportRelatedPage/>;
                }
            }
            // eslint-disable-next-line react-compiler/react-compiler
            if (!contentShown.current) {
                // eslint-disable-next-line react-compiler/react-compiler
                contentShown.current = true;
            }
            return (<WrappedComponent 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props} report={report} betas={betas} policy={policy} reportMetadata={reportMetadata} isLoadingReportData={isLoadingReportData} ref={ref}/>);
        }
        WithReportOrNotFound.displayName = "withReportOrNotFound(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
        return react_1.default.forwardRef(WithReportOrNotFound);
    };
}
