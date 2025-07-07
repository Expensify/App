"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MoneyRequestDateForm_1 = require("@src/types/form/MoneyRequestDateForm");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepDate(_a) {
    var _b = _a.route.params, action = _b.action, iouType = _b.iouType, reportID = _b.reportID, backTo = _b.backTo, reportActionID = _b.reportActionID, transactionID = _b.transactionID, transaction = _a.transaction, report = _a.report;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: false })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: false })[0];
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
    var reportActionsReportID = (0, react_1.useMemo)(function () {
        var actionsReportID;
        if (action === CONST_1.default.IOU.ACTION.EDIT) {
            actionsReportID = iouType === CONST_1.default.IOU.TYPE.SPLIT ? report === null || report === void 0 ? void 0 : report.reportID : report === null || report === void 0 ? void 0 : report.parentReportID;
        }
        return actionsReportID;
    }, [action, iouType, report === null || report === void 0 ? void 0 : report.reportID, report === null || report === void 0 ? void 0 : report.parentReportID]);
    var reportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportActionsReportID), {
        canEvict: false,
        canBeMissing: true,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        selector: function (reportActions) { return reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat((report === null || report === void 0 ? void 0 : report.parentReportActionID) || reportActionID)]; },
    })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var isSplitBill = iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var isSplitExpense = iouType === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    var isEditingSplit = (isSplitBill || isSplitExpense) && isEditing;
    var currentCreated = isEditingSplit && !(0, isEmpty_1.default)(splitDraftTransaction) ? (0, TransactionUtils_1.getFormattedCreated)(splitDraftTransaction) : (0, TransactionUtils_1.getFormattedCreated)(transaction);
    var canEditingSplitBill = isEditingSplit && session && reportAction && session.accountID === reportAction.actorAccountID && (0, TransactionUtils_1.areRequiredFieldsEmpty)(transaction);
    var canEditMoneyRequest = isEditing && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(reportAction, CONST_1.default.EDIT_REQUEST_FIELD.DATE);
    var canEditSplitExpense = isSplitExpense && !!transaction;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFound = false;
    if (!(0, IOUUtils_1.isValidMoneyRequestType)(iouType)) {
        shouldShowNotFound = true;
    }
    else if (isEditing) {
        if (isSplitBill) {
            shouldShowNotFound = !canEditMoneyRequest && !canEditingSplitBill;
        }
        else if (isSplitExpense) {
            shouldShowNotFound = !canEditSplitExpense;
        }
    }
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var updateDate = function (value) {
        var newCreated = value.moneyRequestCreated;
        // Only update created if it has changed
        if (newCreated === currentCreated) {
            navigateBack();
            return;
        }
        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplit) {
            (0, IOU_1.setDraftSplitTransaction)(transactionID, { created: newCreated });
            navigateBack();
            return;
        }
        var isTransactionDraft = (0, IOUUtils_1.shouldUseTransactionDraft)(action);
        (0, IOU_1.setMoneyRequestCreated)(transactionID, newCreated, isTransactionDraft);
        if (isEditing) {
            (0, IOU_1.updateMoneyRequestDate)(transactionID, reportID, newCreated, policy, policyTags, policyCategories);
        }
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('common.date')} onBackButtonPress={navigateBack} shouldShowNotFoundPage={shouldShowNotFound} shouldShowWrapper testID={IOURequestStepDate.displayName} includeSafeAreaPaddingBottom>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.MONEY_REQUEST_DATE_FORM} onSubmit={updateDate} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={MoneyRequestDateForm_1.default.MONEY_REQUEST_CREATED} label={translate('common.date')} defaultValue={currentCreated} maxDate={CONST_1.default.CALENDAR_PICKER.MAX_DATE} minDate={CONST_1.default.CALENDAR_PICKER.MIN_DATE} autoFocus/>
            </FormProvider_1.default>
        </StepScreenWrapper_1.default>);
}
IOURequestStepDate.displayName = 'IOURequestStepDate';
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDateWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepDate);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDateWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepDateWithFullTransactionOrNotFound);
exports.default = IOURequestStepDateWithWritableReportOrNotFound;
