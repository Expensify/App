"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShareTabParticipantsSelector;
var react_1 = require("react");
var Share_1 = require("@libs/actions/Share");
var Navigation_1 = require("@libs/Navigation/Navigation");
var MoneyRequestParticipantsSelector_1 = require("@pages/iou/request/MoneyRequestParticipantsSelector");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
function ShareTabParticipantsSelector(_a) {
    var detailsPageRouteObject = _a.detailsPageRouteObject;
    return (<MoneyRequestParticipantsSelector_1.default iouType={CONST_1.default.IOU.TYPE.SUBMIT} onParticipantsAdded={function (value) {
            var _a;
            var participant = value.at(0);
            var reportID = (_a = participant === null || participant === void 0 ? void 0 : participant.reportID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
            var accountID = participant === null || participant === void 0 ? void 0 : participant.accountID;
            if (accountID && !reportID) {
                (0, Share_1.saveUnknownUserDetails)(participant);
                var optimisticReport = (0, Report_1.getOptimisticChatReport)(accountID);
                reportID = optimisticReport.reportID;
                (0, Report_1.saveReportDraft)(reportID, optimisticReport).then(function () {
                    Navigation_1.default.navigate(detailsPageRouteObject.getRoute(reportID.toString()));
                });
            }
            else {
                Navigation_1.default.navigate(detailsPageRouteObject.getRoute(reportID.toString()));
            }
        }} action="create"/>);
}
