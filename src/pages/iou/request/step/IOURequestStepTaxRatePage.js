"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TaxPicker_1 = require("@components/TaxPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var CurrencyUtils = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var TransactionUtils = require("@libs/TransactionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function getTaxAmount(policy, transaction, selectedTaxCode, amount) {
    var getTaxValue = function (taxCode) { return TransactionUtils.getTaxValue(policy, transaction, taxCode); };
    var taxPercentage = getTaxValue(selectedTaxCode);
    if (taxPercentage) {
        return TransactionUtils.calculateTaxAmount(taxPercentage, amount, (0, TransactionUtils_1.getCurrency)(transaction));
    }
}
function IOURequestStepTaxRatePage(_a) {
    var _b, _c, _d;
    var _e = _a.route.params, action = _e.action, backTo = _e.backTo, iouType = _e.iouType, transactionID = _e.transactionID, transaction = _a.transaction, report = _a.report;
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_b = report === null || report === void 0 ? void 0 : report.policyID) !== null && _b !== void 0 ? _b : '-1'))[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat((_c = report === null || report === void 0 ? void 0 : report.policyID) !== null && _c !== void 0 ? _c : '-1'))[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat((_d = report === null || report === void 0 ? void 0 : report.policyID) !== null && _d !== void 0 ? _d : '-1'))[0];
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID !== null && transactionID !== void 0 ? transactionID : '-1'))[0];
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var isEditingSplitBill = isEditing && iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var currentTransaction = isEditingSplitBill && !(0, EmptyObject_1.isEmptyObject)(splitDraftTransaction) ? splitDraftTransaction : transaction;
    var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var taxRateTitle = TransactionUtils.getTaxName(policy, currentTransaction);
    var updateTaxRates = function (taxes) {
        var _a, _b, _c;
        if (!currentTransaction || !taxes.code || !taxRates) {
            Navigation_1.default.goBack();
            return;
        }
        var taxAmount = getTaxAmount(policy, currentTransaction, taxes.code, TransactionUtils.getAmount(currentTransaction, false, true));
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(currentTransaction.transactionID, {
                taxAmount: CurrencyUtils.convertToBackendAmount(taxAmount !== null && taxAmount !== void 0 ? taxAmount : 0),
                taxCode: taxes.code,
            });
            navigateBack();
            return;
        }
        if (isEditing) {
            var newTaxCode = taxes.code;
            IOU.updateMoneyRequestTaxRate({
                transactionID: (_a = currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.transactionID) !== null && _a !== void 0 ? _a : '-1',
                optimisticReportActionID: (_b = report === null || report === void 0 ? void 0 : report.reportID) !== null && _b !== void 0 ? _b : '-1',
                taxCode: newTaxCode,
                taxAmount: CurrencyUtils.convertToBackendAmount(taxAmount !== null && taxAmount !== void 0 ? taxAmount : 0),
                policy: policy,
                policyTagList: policyTags,
                policyCategories: policyCategories,
            });
            navigateBack();
            return;
        }
        if (taxAmount === undefined) {
            navigateBack();
            return;
        }
        var amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(taxAmount);
        IOU.setMoneyRequestTaxRate(currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.transactionID, (_c = taxes === null || taxes === void 0 ? void 0 : taxes.code) !== null && _c !== void 0 ? _c : '');
        IOU.setMoneyRequestTaxAmount(currentTransaction.transactionID, amountInSmallestCurrencyUnits);
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('iou.taxRate')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepTaxRatePage.displayName}>
            <TaxPicker_1.default selectedTaxRate={taxRateTitle} policyID={report === null || report === void 0 ? void 0 : report.policyID} transactionID={currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.transactionID} onSubmit={updateTaxRates} action={action} iouType={iouType} onDismiss={navigateBack}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepTaxRatePage.displayName = 'IOURequestStepTaxRatePage';
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepTaxRatePageWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepTaxRatePage);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepTaxRatePageWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepTaxRatePageWithWritableReportOrNotFound);
exports.default = IOURequestStepTaxRatePageWithFullTransactionOrNotFound;
