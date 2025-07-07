"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FileUtils = require("@libs/fileDownload/FileUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Report = require("@userActions/Report");
var ROUTES_1 = require("@src/ROUTES");
var BaseShareLogList_1 = require("./BaseShareLogList");
function ShareLogList(_a) {
    var logSource = _a.logSource;
    var onAttachLogToReport = function (reportID, filename) {
        FileUtils.readFileAsync(logSource, filename, function (file) {
            Report.addAttachment(reportID, file);
            var routeToNavigate = ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID);
            Navigation_1.default.navigate(routeToNavigate);
        }, function () { });
    };
    return <BaseShareLogList_1.default onAttachLogToReport={onAttachLogToReport}/>;
}
exports.default = ShareLogList;
