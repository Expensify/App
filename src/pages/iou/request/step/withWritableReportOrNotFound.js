"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function default_1(WrappedComponent, shouldIncludeDeprecatedIOUType) {
    if (shouldIncludeDeprecatedIOUType === void 0) { shouldIncludeDeprecatedIOUType = false; }
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithWritableReportOrNotFound(props, ref) {
        var _a, _b;
        var route = props.route;
        var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(route.params.reportID), { canBeMissing: true })[0];
        var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0], isLoadingApp = _c === void 0 ? true : _c;
        var reportDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(route.params.reportID), { canBeMissing: true })[0];
        var iouTypeParamIsInvalid = !Object.values(CONST_1.default.IOU.TYPE)
            .filter(function (type) { return shouldIncludeDeprecatedIOUType || (type !== CONST_1.default.IOU.TYPE.REQUEST && type !== CONST_1.default.IOU.TYPE.SEND); })
            .includes((_a = route.params) === null || _a === void 0 ? void 0 : _a.iouType);
        var isEditing = 'action' in route.params && ((_b = route.params) === null || _b === void 0 ? void 0 : _b.action) === CONST_1.default.IOU.ACTION.EDIT;
        (0, react_1.useEffect)(function () {
            if (!!(report === null || report === void 0 ? void 0 : report.reportID) || !route.params.reportID || !!reportDraft || !isEditing) {
                return;
            }
            (0, Report_1.openReport)(route.params.reportID);
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, []);
        if (isEditing && isLoadingApp) {
            return <FullscreenLoadingIndicator_1.default />;
        }
        if (iouTypeParamIsInvalid || !(0, ReportUtils_1.canUserPerformWriteAction)(report !== null && report !== void 0 ? report : { reportID: '' })) {
            return <FullPageNotFoundView_1.default shouldShow/>;
        }
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} report={report} reportDraft={reportDraft} ref={ref}/>);
    }
    WithWritableReportOrNotFound.displayName = "withWritableReportOrNotFound(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
    return (0, react_1.forwardRef)(WithWritableReportOrNotFound);
}
