"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ReportUtils_1 = require("@libs/ReportUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var ShareCodePage_1 = require("@pages/ShareCodePage");
var withReportOrNotFound_1 = require("./withReportOrNotFound");
function ReportDetailsShareCodePage(_a) {
    var _b;
    var report = _a.report, policy = _a.policy, route = _a.route;
    if ((0, ReportUtils_1.isSelfDM)(report)) {
        return <NotFoundPage_1.default />;
    }
    return (<ShareCodePage_1.default backTo={(_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo} report={report} policy={policy}/>);
}
exports.default = (0, withReportOrNotFound_1.default)()(ReportDetailsShareCodePage);
