"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var ValidationUtils = require("@libs/ValidationUtils");
var FormActions = require("@userActions/FormActions");
var IOU = require("@userActions/IOU");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MoneyRequestHoldReasonForm_1 = require("@src/types/form/MoneyRequestHoldReasonForm");
var HoldReasonFormView_1 = require("./HoldReasonFormView");
function HoldReasonPage(_a) {
    var _b, _c;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = route.params, transactionID = _d.transactionID, reportID = _d.reportID, backTo = _d.backTo, searchHash = _d.searchHash;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID || -1))[0];
    // We first check if the report is part of a policy - if not, then it's a personal request (1:1 request)
    // For personal requests, we need to allow both users to put the request on hold
    var isWorkspaceRequest = ReportUtils.isReportInGroupPolicy(report);
    var parentReportAction = ReportActionsUtils.getReportAction((_b = report === null || report === void 0 ? void 0 : report.parentReportID) !== null && _b !== void 0 ? _b : '-1', (_c = report === null || report === void 0 ? void 0 : report.parentReportActionID) !== null && _c !== void 0 ? _c : '-1');
    var onSubmit = function (values) {
        // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
        // as we do not allow requestee to edit fields like description and amount.
        // But, we still want the requestee to be able to put the request on hold
        if (ReportActionsUtils.isMoneyRequestAction(parentReportAction) && !ReportUtils.canEditMoneyRequest(parentReportAction) && isWorkspaceRequest) {
            return;
        }
        IOU.putOnHold(transactionID, values.comment, reportID, searchHash);
        Navigation_1.default.goBack(backTo);
    };
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = ValidationUtils.getFieldRequiredErrors(values, [MoneyRequestHoldReasonForm_1.default.COMMENT]);
        if (!values.comment) {
            errors.comment = translate('common.error.fieldRequired');
        }
        // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
        // as we do not allow requestee to edit fields like description and amount.
        // But, we still want the requestee to be able to put the request on hold
        if (ReportActionsUtils.isMoneyRequestAction(parentReportAction) && !ReportUtils.canEditMoneyRequest(parentReportAction) && isWorkspaceRequest) {
            var formErrors = {};
            ErrorUtils.addErrorMessage(formErrors, 'reportModified', translate('common.error.requestModified'));
            FormActions.setErrors(ONYXKEYS_1.default.FORMS.MONEY_REQUEST_HOLD_FORM, formErrors);
        }
        return errors;
    }, [parentReportAction, isWorkspaceRequest, translate]);
    (0, react_1.useEffect)(function () {
        FormActions.clearErrors(ONYXKEYS_1.default.FORMS.MONEY_REQUEST_HOLD_FORM);
        FormActions.clearErrorFields(ONYXKEYS_1.default.FORMS.MONEY_REQUEST_HOLD_FORM);
    }, []);
    return (<HoldReasonFormView_1.default onSubmit={onSubmit} validate={validate} backTo={backTo}/>);
}
HoldReasonPage.displayName = 'MoneyRequestHoldReasonPage';
exports.default = HoldReasonPage;
