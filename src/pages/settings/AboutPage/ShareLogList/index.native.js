"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Report = require("@userActions/Report");
var ROUTES_1 = require("@src/ROUTES");
var BaseShareLogList_1 = require("./BaseShareLogList");
function ShareLogList(_a) {
    var logSource = _a.logSource;
    var onAttachLogToReport = function (reportID, filename) {
        if (!reportID || !logSource) {
            return;
        }
        var src = "file://".concat(logSource);
        Report.addAttachment(reportID, { name: filename, source: src, uri: src, type: 'text/plain' });
        var routeToNavigate = ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID);
        Navigation_1.default.navigate(routeToNavigate);
    };
    return <BaseShareLogList_1.default onAttachLogToReport={onAttachLogToReport}/>;
}
exports.default = ShareLogList;
