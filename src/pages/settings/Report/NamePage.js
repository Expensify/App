"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ReportUtils_1 = require("@libs/ReportUtils");
var GroupChatNameEditPage_1 = require("@pages/GroupChatNameEditPage");
var withReportOrNotFound_1 = require("@pages/home/report/withReportOrNotFound");
var TripChatNameEditPage_1 = require("@pages/TripChatNameEditPage");
var RoomNamePage_1 = require("./RoomNamePage");
function NamePage(_a) {
    var report = _a.report;
    if ((0, ReportUtils_1.isTripRoom)(report)) {
        return <TripChatNameEditPage_1.default report={report}/>;
    }
    if ((0, ReportUtils_1.isGroupChat)(report)) {
        return <GroupChatNameEditPage_1.default report={report}/>;
    }
    return <RoomNamePage_1.default report={report}/>;
}
NamePage.displayName = 'NamePage';
exports.default = (0, withReportOrNotFound_1.default)()(NamePage);
