"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var Transaction_1 = require("@libs/actions/Transaction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var IOURequestEditReportCommon_1 = require("./IOURequestEditReportCommon");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepReport(_a) {
    var _b, _c;
    var route = _a.route, transaction = _a.transaction;
    var _d = route.params, backTo = _d.backTo, action = _d.action;
    var reportID = (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === '0' ? (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _b === void 0 ? void 0 : _b.at(0)) === null || _c === void 0 ? void 0 : _c.reportID : transaction === null || transaction === void 0 ? void 0 : transaction.reportID;
    var transactionReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var selectReport = function (item) {
        if (!transaction) {
            return;
        }
        if (item.value !== transaction.reportID) {
            (0, Transaction_1.setTransactionReport)(transaction.transactionID, item.value, !isEditing);
            if (isEditing) {
                (0, Transaction_1.changeTransactionsReport)([transaction.transactionID], item.value);
            }
        }
        if (isEditing) {
            Navigation_1.default.dismissModalWithReport({ reportID: item.value });
        }
        else {
            Navigation_1.default.goBack(backTo);
        }
    };
    return (<IOURequestEditReportCommon_1.default backTo={backTo} transactionsReports={transactionReport ? [transactionReport] : []} selectReport={selectReport}/>);
}
IOURequestStepReport.displayName = 'IOURequestStepReport';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepReport));
