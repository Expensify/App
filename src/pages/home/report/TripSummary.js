"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var TripDetailsView_1 = require("@components/ReportActionItem/TripDetailsView");
var useOnyx_1 = require("@hooks/useOnyx");
var useTripTransactions_1 = require("@hooks/useTripTransactions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function TripSummary(_a) {
    var reportID = _a.reportID;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID !== null && reportID !== void 0 ? reportID : CONST_1.default.DEFAULT_NUMBER_ID))[0];
    var tripTransactions = (0, useTripTransactions_1.default)(reportID);
    if (!reportID) {
        return null;
    }
    return (<OfflineWithFeedback_1.default pendingAction={report === null || report === void 0 ? void 0 : report.pendingAction}>
            <TripDetailsView_1.default tripRoomReport={report} tripTransactions={tripTransactions} shouldShowHorizontalRule={false}/>
        </OfflineWithFeedback_1.default>);
}
TripSummary.displayName = 'TripSummary';
exports.default = TripSummary;
