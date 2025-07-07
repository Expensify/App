"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var useLocalize_1 = require("@hooks/useLocalize");
var IOU_1 = require("@libs/actions/IOU");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var MoneyRequestAmountForm_1 = require("@pages/iou/MoneyRequestAmountForm");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function getTaxAmount(transaction, policy, currency, isEditing) {
    var _a, _b, _c, _d;
    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.amount) && !(transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount)) {
        return;
    }
    var transactionTaxAmount = (0, TransactionUtils_1.getAmount)(transaction);
    var transactionTaxCode = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) !== null && _a !== void 0 ? _a : '';
    var defaultTaxCode = (_b = (0, TransactionUtils_1.getDefaultTaxCode)(policy, transaction, currency)) !== null && _b !== void 0 ? _b : '';
    var getTaxValueByTaxCode = function (taxCode) { return (0, TransactionUtils_1.getTaxValue)(policy, transaction, taxCode); };
    var defaultTaxValue = getTaxValueByTaxCode(defaultTaxCode);
    var moneyRequestTaxPercentage = (_c = (transactionTaxCode ? getTaxValueByTaxCode(transactionTaxCode) : defaultTaxValue)) !== null && _c !== void 0 ? _c : '';
    var editingTaxPercentage = (_d = (transactionTaxCode ? getTaxValueByTaxCode(transactionTaxCode) : moneyRequestTaxPercentage)) !== null && _d !== void 0 ? _d : '';
    var taxPercentage = isEditing ? editingTaxPercentage : moneyRequestTaxPercentage;
    return (0, CurrencyUtils_1.convertToBackendAmount)((0, TransactionUtils_1.calculateTaxAmount)(taxPercentage, transactionTaxAmount, currency !== null && currency !== void 0 ? currency : CONST_1.default.CURRENCY.USD));
}
function IOURequestStepTaxAmountPage(_a) {
    var _b;
    var _c = _a.route.params, action = _c.action, iouType = _c.iouType, reportID = _c.reportID, transactionID = _c.transactionID, backTo = _c.backTo, _d = _c.currency, selectedCurrency = _d === void 0 ? '' : _d, transaction = _a.transaction, report = _a.report, policy = _a.policy, policyTags = _a.policyTags, policyCategories = _a.policyCategories, splitDraftTransaction = _a.splitDraftTransaction;
    var translate = (0, useLocalize_1.default)().translate;
    var textInput = (0, react_1.useRef)(null);
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var isEditingSplitBill = isEditing && iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var focusTimeoutRef = (0, react_1.useRef)(undefined);
    var currentTransaction = isEditingSplitBill && !(0, EmptyObject_1.isEmptyObject)(splitDraftTransaction) ? splitDraftTransaction : transaction;
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(currentTransaction);
    var currency = (0, CurrencyUtils_1.isValidCurrencyCode)(selectedCurrency) ? selectedCurrency : transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency;
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () { var _a; return (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.focus(); }, CONST_1.default.ANIMATED_TRANSITION);
        return function () {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, []));
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var navigateToCurrencySelectionPage = function () {
        // If the expense being created is a distance expense, don't allow the user to choose the currency.
        // Only USD is allowed for distance expenses.
        // Remove query from the route and encode it.
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CURRENCY.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID, backTo ? 'confirm' : '', currency, Navigation_1.default.getActiveRouteWithoutParams()));
    };
    var updateTaxAmount = function (currentAmount) {
        var taxAmountInSmallestCurrencyUnits = (0, CurrencyUtils_1.convertToBackendAmount)(Number.parseFloat(currentAmount.amount));
        if (isEditingSplitBill) {
            (0, IOU_1.setDraftSplitTransaction)(transactionID, { taxAmount: taxAmountInSmallestCurrencyUnits });
            navigateBack();
            return;
        }
        if (isEditing) {
            if (taxAmountInSmallestCurrencyUnits === (0, TransactionUtils_1.getTaxAmount)(currentTransaction, false)) {
                navigateBack();
                return;
            }
            (0, IOU_1.updateMoneyRequestTaxAmount)(transactionID, report === null || report === void 0 ? void 0 : report.reportID, taxAmountInSmallestCurrencyUnits, policy, policyTags, policyCategories);
            navigateBack();
            return;
        }
        (0, IOU_1.setMoneyRequestTaxAmount)(transactionID, taxAmountInSmallestCurrencyUnits);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (0, IOU_1.setMoneyRequestCurrency)(transactionID, currency || CONST_1.default.CURRENCY.USD);
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report === null || report === void 0 ? void 0 : report.reportID) {
            // TODO: Is this really needed at all?
            (0, IOU_1.setMoneyRequestParticipantsFromReport)(transactionID, report);
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            return;
        }
        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('iou.taxAmount')} onBackButtonPress={navigateBack} testID={IOURequestStepTaxAmountPage.displayName} shouldShowWrapper={!!(backTo || isEditing)} includeSafeAreaPaddingBottom>
            <MoneyRequestAmountForm_1.default isEditing={!!(backTo || isEditing)} currency={currency} amount={Math.abs((_b = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.taxAmount) !== null && _b !== void 0 ? _b : 0)} taxAmount={getTaxAmount(currentTransaction, policy, currency, !!(backTo || isEditing))} ref={function (e) {
            textInput.current = e;
        }} onCurrencyButtonPress={navigateToCurrencySelectionPage} onSubmitButtonPress={updateTaxAmount} isCurrencyPressable={false}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepTaxAmountPage.displayName = 'IOURequestStepTaxAmountPage';
var IOURequestStepTaxAmountPageWithOnyx = (0, react_native_onyx_1.withOnyx)({
    splitDraftTransaction: {
        key: function (_a) {
            var _b;
            var route = _a.route;
            var transactionID = (_b = route === null || route === void 0 ? void 0 : route.params.transactionID) !== null && _b !== void 0 ? _b : 0;
            return "".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID);
        },
    },
    policy: {
        key: function (_a) {
            var report = _a.report;
            return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report ? report.policyID : '-1');
        },
    },
    policyCategories: {
        key: function (_a) {
            var report = _a.report;
            return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(report ? report.policyID : '-1');
        },
    },
    policyTags: {
        key: function (_a) {
            var report = _a.report;
            return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report ? report.policyID : '-1');
        },
    },
})(IOURequestStepTaxAmountPage);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepTaxAmountPageWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepTaxAmountPageWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepTaxAmountPageWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepTaxAmountPageWithWritableReportOrNotFound);
exports.default = IOURequestStepTaxAmountPageWithFullTransactionOrNotFound;
