"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var TransactionEdit_1 = require("@libs/actions/TransactionEdit");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var MoneyRequestAmountForm_1 = require("@pages/iou/MoneyRequestAmountForm");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepAmount(_a) {
    var _b, _c;
    var report = _a.report, _d = _a.route.params, iouType = _d.iouType, reportID = _d.reportID, _e = _d.transactionID, transactionID = _e === void 0 ? '-1' : _e, backTo = _d.backTo, pageIndex = _d.pageIndex, action = _d.action, _f = _d.currency, selectedCurrency = _f === void 0 ? '' : _f, backToReport = _d.backToReport, transaction = _a.transaction, currentUserPersonalDetails = _a.currentUserPersonalDetails, _g = _a.shouldKeepUserInput, shouldKeepUserInput = _g === void 0 ? false : _g;
    var translate = (0, useLocalize_1.default)().translate;
    var textInput = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var isSaveButtonPressed = (0, react_1.useRef)(false);
    var iouRequestType = (0, TransactionUtils_1.getRequestType)(transaction);
    var policyID = report === null || report === void 0 ? void 0 : report.policyID;
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var draftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: false })[0];
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
    var skipConfirmation = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SKIP_CONFIRMATION).concat(transactionID), { canBeMissing: true })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var activePolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID), { canBeMissing: true })[0];
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var isSplitBill = iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var isCreateAction = action === CONST_1.default.IOU.ACTION.CREATE;
    var isEditingSplitBill = isEditing && isSplitBill;
    var currentTransaction = isEditingSplitBill && !(0, EmptyObject_1.isEmptyObject)(splitDraftTransaction) ? splitDraftTransaction : transaction;
    var allowNegative = (0, ReportUtils_1.shouldEnableNegative)(report, policy, iouType);
    var transactionAmount = ((_b = (0, ReportUtils_1.getTransactionDetails)(currentTransaction, undefined, undefined, allowNegative, isCreateAction)) !== null && _b !== void 0 ? _b : { amount: 0 }).amount;
    var originalCurrency = ((_c = (0, ReportUtils_1.getTransactionDetails)(isEditing && !(0, EmptyObject_1.isEmptyObject)(draftTransaction) ? draftTransaction : transaction)) !== null && _c !== void 0 ? _c : { currency: CONST_1.default.CURRENCY.USD }).currency;
    var currency = (0, CurrencyUtils_1.isValidCurrencyCode)(selectedCurrency) ? selectedCurrency : originalCurrency;
    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace request, as
    // the user will have to add a merchant.
    var shouldSkipConfirmation = (0, react_1.useMemo)(function () {
        if (isSplitBill || !skipConfirmation || !(report === null || report === void 0 ? void 0 : report.reportID)) {
            return false;
        }
        return !((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) || (0, ReportUtils_1.isPolicyExpenseChat)(report));
    }, [report, isSplitBill, skipConfirmation, reportNameValuePairs]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () { var _a; return (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.focus(); }, CONST_1.default.ANIMATED_TRANSITION);
        return function () {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, []));
    (0, react_1.useEffect)(function () {
        if (!isEditing) {
            return;
        }
        // A temporary solution to not prevent users from editing the currency
        // We create a backup transaction and use it to save the currency and remove this transaction backup if we don't save the amount
        // It should be removed after this issue https://github.com/Expensify/App/issues/34607 is fixed
        (0, TransactionEdit_1.createDraftTransaction)(isEditingSplitBill && !(0, EmptyObject_1.isEmptyObject)(splitDraftTransaction) ? splitDraftTransaction : transaction);
        return function () {
            if (isSaveButtonPressed.current) {
                return;
            }
            (0, TransactionEdit_1.removeDraftTransaction)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var navigateToCurrencySelectionPage = function () {
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CURRENCY.getRoute(action, iouType, transactionID, reportID, pageIndex, currency, Navigation_1.default.getActiveRoute()));
    };
    var navigateToConfirmationPage = function () {
        switch (iouType) {
            case CONST_1.default.IOU.TYPE.REQUEST:
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            case CONST_1.default.IOU.TYPE.SEND:
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    };
    var navigateToNextPage = function (_a) {
        var _b, _c, _d, _e, _f, _g;
        var amount = _a.amount, paymentMethod = _a.paymentMethod;
        isSaveButtonPressed.current = true;
        var amountInSmallestCurrencyUnits = (0, CurrencyUtils_1.convertToBackendAmount)(Number.parseFloat(amount));
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (0, IOU_1.setMoneyRequestAmount)(transactionID, amountInSmallestCurrencyUnits, currency || CONST_1.default.CURRENCY.USD, shouldKeepUserInput);
        // Initially when we're creating money request, we do not know the participant and hence if the request is with workspace with tax tracking enabled
        // So, we reset the taxAmount here and calculate it in the hook in MoneyRequestConfirmationList component
        (0, IOU_1.setMoneyRequestTaxAmount)(transactionID, null);
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        // If a reportID exists in the report object, it's because either:
        // - The user started this flow from using the + button in the composer inside a report.
        // - The user started this flow from using the global create menu by selecting the Track expense option.
        // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
        if ((report === null || report === void 0 ? void 0 : report.reportID) && !(0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) && iouType !== CONST_1.default.IOU.TYPE.CREATE) {
            var selectedParticipants = (0, IOU_1.getMoneyRequestParticipantsFromReport)(report);
            var participants = selectedParticipants.map(function (participant) {
                var _a;
                var participantAccountID = (_a = participant === null || participant === void 0 ? void 0 : participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
                return participantAccountID ? (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails) : (0, OptionsListUtils_1.getReportOption)(participant);
            });
            var backendAmount = (0, CurrencyUtils_1.convertToBackendAmount)(Number.parseFloat(amount));
            if (shouldSkipConfirmation) {
                if (iouType === CONST_1.default.IOU.TYPE.PAY || iouType === CONST_1.default.IOU.TYPE.SEND) {
                    if (paymentMethod && paymentMethod === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY) {
                        (0, IOU_1.sendMoneyWithWallet)(report, backendAmount, currency, '', currentUserPersonalDetails.accountID, (_b = participants.at(0)) !== null && _b !== void 0 ? _b : {});
                        return;
                    }
                    (0, IOU_1.sendMoneyElsewhere)(report, backendAmount, currency, '', currentUserPersonalDetails.accountID, (_c = participants.at(0)) !== null && _c !== void 0 ? _c : {});
                    return;
                }
                if (iouType === CONST_1.default.IOU.TYPE.SUBMIT || iouType === CONST_1.default.IOU.TYPE.REQUEST) {
                    (0, IOU_1.requestMoney)({
                        report: report,
                        participantParams: {
                            participant: (_d = participants.at(0)) !== null && _d !== void 0 ? _d : {},
                            payeeEmail: currentUserPersonalDetails.login,
                            payeeAccountID: currentUserPersonalDetails.accountID,
                        },
                        transactionParams: {
                            amount: backendAmount,
                            currency: currency,
                            created: (_e = transaction === null || transaction === void 0 ? void 0 : transaction.created) !== null && _e !== void 0 ? _e : '',
                            merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                            attendees: (_f = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _f === void 0 ? void 0 : _f.attendees,
                        },
                        backToReport: backToReport,
                    });
                    return;
                }
                if (iouType === CONST_1.default.IOU.TYPE.TRACK) {
                    (0, IOU_1.trackExpense)({
                        report: report,
                        isDraftPolicy: false,
                        participantParams: {
                            payeeEmail: currentUserPersonalDetails.login,
                            payeeAccountID: currentUserPersonalDetails.accountID,
                            participant: (_g = participants.at(0)) !== null && _g !== void 0 ? _g : {},
                        },
                        transactionParams: {
                            amount: backendAmount,
                            currency: currency !== null && currency !== void 0 ? currency : 'USD',
                            created: transaction === null || transaction === void 0 ? void 0 : transaction.created,
                            merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                        },
                    });
                    return;
                }
            }
            if (isSplitBill && !report.isOwnPolicyExpenseChat && report.participants) {
                var participantAccountIDs = Object.keys(report.participants).map(function (accountID) { return Number(accountID); });
                (0, IOU_1.setSplitShares)(transaction, amountInSmallestCurrencyUnits, currency || CONST_1.default.CURRENCY.USD, participantAccountIDs);
            }
            (0, IOU_1.setMoneyRequestParticipantsFromReport)(transactionID, report).then(function () {
                navigateToConfirmationPage();
            });
            return;
        }
        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        if (iouType === CONST_1.default.IOU.TYPE.CREATE && (0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy) && (activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.isPolicyExpenseChatEnabled) && !(0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(activePolicy.id)) {
            var activePolicyExpenseChat_1 = (0, ReportUtils_1.getPolicyExpenseChat)(currentUserPersonalDetails.accountID, activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.id);
            (0, IOU_1.setMoneyRequestParticipantsFromReport)(transactionID, activePolicyExpenseChat_1).then(function () {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType === CONST_1.default.IOU.TYPE.CREATE ? CONST_1.default.IOU.TYPE.SUBMIT : iouType, transactionID, activePolicyExpenseChat_1 === null || activePolicyExpenseChat_1 === void 0 ? void 0 : activePolicyExpenseChat_1.reportID));
            });
        }
        else {
            (0, IOUUtils_1.navigateToParticipantPage)(iouType, transactionID, reportID);
        }
    };
    var saveAmountAndCurrency = function (_a) {
        var _b, _c, _d, _e;
        var amount = _a.amount, paymentMethod = _a.paymentMethod;
        var newAmount = (0, CurrencyUtils_1.convertToBackendAmount)(Number.parseFloat(amount));
        // Edits to the amount from the splits page should reset the split shares.
        if (transaction === null || transaction === void 0 ? void 0 : transaction.splitShares) {
            (0, IOU_1.resetSplitShares)(transaction, newAmount, currency);
        }
        if (!isEditing) {
            navigateToNextPage({ amount: amount, paymentMethod: paymentMethod });
            return;
        }
        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        var transactionCurrency = (0, TransactionUtils_1.getCurrency)(currentTransaction);
        if (newAmount === (0, TransactionUtils_1.getAmount)(currentTransaction, false, false, true, !allowNegative) && currency === transactionCurrency) {
            navigateBack();
            return;
        }
        // If currency has changed, then we get the default tax rate based on currency, otherwise we use the current tax rate selected in transaction, if we have it.
        var transactionTaxCode = (_b = (0, ReportUtils_1.getTransactionDetails)(currentTransaction)) === null || _b === void 0 ? void 0 : _b.taxCode;
        var defaultTaxCode = (_c = (0, TransactionUtils_1.getDefaultTaxCode)(policy, currentTransaction, currency)) !== null && _c !== void 0 ? _c : '';
        var taxCode = (_d = (currency !== transactionCurrency ? defaultTaxCode : transactionTaxCode)) !== null && _d !== void 0 ? _d : defaultTaxCode;
        var taxPercentage = (_e = (0, TransactionUtils_1.getTaxValue)(policy, currentTransaction, taxCode)) !== null && _e !== void 0 ? _e : '';
        var taxAmount = (0, CurrencyUtils_1.convertToBackendAmount)((0, TransactionUtils_1.calculateTaxAmount)(taxPercentage, newAmount, currency !== null && currency !== void 0 ? currency : CONST_1.default.CURRENCY.USD));
        if (isSplitBill) {
            (0, IOU_1.setDraftSplitTransaction)(transactionID, { amount: newAmount, currency: currency, taxCode: taxCode, taxAmount: taxAmount });
            navigateBack();
            return;
        }
        (0, IOU_1.updateMoneyRequestAmountAndCurrency)({
            transactionID: transactionID,
            transactionThreadReportID: reportID,
            currency: currency,
            amount: newAmount,
            taxAmount: taxAmount,
            policy: policy,
            taxCode: taxCode,
            policyCategories: policyCategories,
        });
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('iou.amount')} onBackButtonPress={navigateBack} testID={IOURequestStepAmount.displayName} shouldShowWrapper={!!backTo || isEditing} includeSafeAreaPaddingBottom>
            <MoneyRequestAmountForm_1.default isEditing={!!backTo || isEditing} currency={currency} amount={transactionAmount} skipConfirmation={shouldSkipConfirmation !== null && shouldSkipConfirmation !== void 0 ? shouldSkipConfirmation : false} iouType={iouType} policyID={policy === null || policy === void 0 ? void 0 : policy.id} bankAccountRoute={(0, ReportUtils_1.getBankAccountRoute)(report)} ref={function (e) {
            textInput.current = e;
        }} shouldKeepUserInput={transaction === null || transaction === void 0 ? void 0 : transaction.shouldShowOriginalAmount} onCurrencyButtonPress={navigateToCurrencySelectionPage} onSubmitButtonPress={saveAmountAndCurrency} selectedTab={iouRequestType} allowFlippingAmount={!isSplitBill && allowNegative}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepAmount.displayName = 'IOURequestStepAmount';
var IOURequestStepAmountWithCurrentUserPersonalDetails = (0, withCurrentUserPersonalDetails_1.default)(IOURequestStepAmount);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepAmountWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepAmountWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepAmountWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepAmountWithWritableReportOrNotFound);
exports.default = IOURequestStepAmountWithFullTransactionOrNotFound;
