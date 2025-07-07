"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@react-navigation/core");
var react_1 = require("react");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Transaction_1 = require("@libs/actions/Transaction");
var types_1 = require("@libs/API/types");
var Browser_1 = require("@libs/Browser");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var getPlatform_1 = require("@libs/getPlatform");
var HttpUtils_1 = require("@libs/HttpUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var MoneyRequestParticipantsSelector_1 = require("@pages/iou/request/MoneyRequestParticipantsSelector");
var IOU_1 = require("@userActions/IOU");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var keyboard_1 = require("@src/utils/keyboard");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepParticipants(_a) {
    var _b, _c, _d;
    var _e = _a.route.params, iouType = _e.iouType, reportID = _e.reportID, initialTransactionID = _e.transactionID, action = _e.action, backTo = _e.backTo, initialTransaction = _a.transaction;
    var participants = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.participants;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isFocused = (0, core_1.useIsFocused)();
    var skipConfirmation = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SKIP_CONFIRMATION).concat(initialTransactionID), { canBeMissing: true })[0];
    var optimisticTransactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT, {
        selector: function (items) { return Object.values(items !== null && items !== void 0 ? items : {}); },
        canBeMissing: true,
    })[0];
    var transactions = (0, react_1.useMemo)(function () {
        var allTransactions = initialTransactionID === CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID ? (optimisticTransactions !== null && optimisticTransactions !== void 0 ? optimisticTransactions : []) : [initialTransaction];
        return allTransactions.filter(function (transaction) { return !!transaction; });
    }, [initialTransaction, initialTransactionID, optimisticTransactions]);
    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    var transactionIDs = (0, react_1.useMemo)(function () { return transactions === null || transactions === void 0 ? void 0 : transactions.map(function (transaction) { return transaction.transactionID; }); }, [transactions.length]);
    // We need to set selectedReportID if user has navigated back from confirmation page and navigates to confirmation page with already selected participant
    var selectedReportID = (0, react_1.useRef)((participants === null || participants === void 0 ? void 0 : participants.length) === 1 ? ((_c = (_b = participants.at(0)) === null || _b === void 0 ? void 0 : _b.reportID) !== null && _c !== void 0 ? _c : reportID) : reportID);
    var numberOfParticipants = (0, react_1.useRef)((_d = participants === null || participants === void 0 ? void 0 : participants.length) !== null && _d !== void 0 ? _d : 0);
    var iouRequestType = (0, TransactionUtils_1.getRequestType)(initialTransaction);
    var isSplitRequest = iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var isMovingTransactionFromTrackExpense = (0, IOUUtils_1.isMovingTransactionFromTrackExpense)(action);
    var headerTitle = (0, react_1.useMemo)(function () {
        if (action === CONST_1.default.IOU.ACTION.CATEGORIZE) {
            return translate('iou.categorize');
        }
        if (action === CONST_1.default.IOU.ACTION.SHARE) {
            return translate('iou.share');
        }
        if (isSplitRequest) {
            return translate('iou.splitExpense');
        }
        if (iouType === CONST_1.default.IOU.TYPE.PAY) {
            return translate('iou.paySomeone', {});
        }
        if (iouType === CONST_1.default.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.chooseRecipient');
    }, [iouType, translate, isSplitRequest, action]);
    var selfDMReportID = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.findSelfDMReportID)(); }, []);
    var selfDMReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReportID), { canBeMissing: true })[0];
    var isAndroidNative = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.ANDROID;
    var isMobileSafari = (0, Browser_1.isMobileSafari)();
    (0, react_1.useEffect)(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE_CONTACT);
    }, []);
    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the expense is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the expense process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    (0, react_1.useEffect)(function () {
        var _a, _b, _c, _d, _e;
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        var firstReceiptFilename = (_a = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.filename) !== null && _a !== void 0 ? _a : '';
        var firstReceiptPath = (_c = (_b = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.receipt) === null || _b === void 0 ? void 0 : _b.source) !== null && _c !== void 0 ? _c : '';
        var firstReceiptType = (_e = (_d = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.receipt) === null || _d === void 0 ? void 0 : _d.type) !== null && _e !== void 0 ? _e : '';
        (0, IOU_1.navigateToStartStepIfScanFileCannotBeRead)(firstReceiptFilename, firstReceiptPath, function () { }, iouRequestType, iouType, initialTransactionID, reportID, firstReceiptType);
    }, [iouRequestType, iouType, initialTransaction, initialTransactionID, reportID, isMovingTransactionFromTrackExpense]);
    // When the step opens, reset the draft transaction's custom unit if moved from Track Expense.
    // This resets the custom unit to the p2p rate when the destination workspace changes,
    // because we want to first check if the p2p rate exists on the workspace.
    // If it doesn't exist - we'll show an error message to force the user to choose a valid rate from the workspace.
    (0, react_1.useEffect)(function () {
        if (!isMovingTransactionFromTrackExpense) {
            return;
        }
        transactionIDs.forEach(function (transactionID) { return (0, IOU_1.resetDraftTransactionsCustomUnit)(transactionID); });
    }, [isFocused, isMovingTransactionFromTrackExpense, transactionIDs]);
    var waitForKeyboardDismiss = (0, react_1.useCallback)(function (callback) {
        if (isAndroidNative || isMobileSafari) {
            keyboard_1.default.dismiss().then(function () {
                callback();
            });
        }
        else {
            callback();
        }
    }, [isAndroidNative, isMobileSafari]);
    var trackExpense = (0, react_1.useCallback)(function () {
        // If coming from the combined submit/track flow and the user proceeds to just track the expense,
        // we will use the track IOU type in the confirmation flow.
        if (!selfDMReportID) {
            return;
        }
        var rateID = DistanceRequestUtils_1.default.getCustomUnitRateID(selfDMReportID);
        transactions.forEach(function (transaction) {
            (0, IOU_1.setCustomUnitRateID)(transaction.transactionID, rateID);
            (0, IOU_1.setMoneyRequestParticipantsFromReport)(transaction.transactionID, selfDMReport);
        });
        var iouConfirmationPageRoute = ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST_1.default.IOU.TYPE.TRACK, initialTransactionID, selfDMReportID);
        waitForKeyboardDismiss(function () {
            // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
            if (backTo) {
                // We don't want to compare params because we just changed the participants.
                Navigation_1.default.goBack(iouConfirmationPageRoute, { compareParams: false });
            }
            else {
                Navigation_1.default.navigate(iouConfirmationPageRoute);
            }
        });
    }, [action, backTo, selfDMReport, selfDMReportID, transactions, initialTransactionID, waitForKeyboardDismiss]);
    var addParticipant = (0, react_1.useCallback)(function (val) {
        var _a;
        HttpUtils_1.default.cancelPendingRequests(types_1.READ_COMMANDS.SEARCH_FOR_REPORTS);
        var firstParticipant = val.at(0);
        if (firstParticipant === null || firstParticipant === void 0 ? void 0 : firstParticipant.isSelfDM) {
            trackExpense();
            return;
        }
        var firstParticipantReportID = (_a = val.at(0)) === null || _a === void 0 ? void 0 : _a.reportID;
        var isInvoice = iouType === CONST_1.default.IOU.TYPE.INVOICE && (0, ReportUtils_1.isInvoiceRoomWithID)(firstParticipantReportID);
        numberOfParticipants.current = val.length;
        transactions.forEach(function (transaction) {
            (0, IOU_1.setMoneyRequestParticipants)(transaction.transactionID, val);
        });
        if (!isMovingTransactionFromTrackExpense) {
            // If not moving the transaction from track expense, select the default rate automatically.
            // Otherwise, keep the original p2p rate and let the user manually change it to the one they want from the workspace.
            var rateID_1 = DistanceRequestUtils_1.default.getCustomUnitRateID(firstParticipantReportID);
            transactions.forEach(function (transaction) {
                (0, IOU_1.setCustomUnitRateID)(transaction.transactionID, rateID_1);
            });
        }
        // When multiple participants are selected, the reportID is generated at the end of the confirmation step.
        // So we are resetting selectedReportID ref to the reportID coming from params.
        if (val.length !== 1 && !isInvoice) {
            selectedReportID.current = reportID;
            return;
        }
        // When a participant is selected, the reportID needs to be saved because that's the reportID that will be used in the confirmation step.
        // We use || to be sure that if the first participant doesn't have a reportID, we generate a new one.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        selectedReportID.current = firstParticipantReportID || (0, ReportUtils_1.generateReportID)();
    }, [iouType, transactions, isMovingTransactionFromTrackExpense, reportID, trackExpense]);
    var goToNextStep = (0, react_1.useCallback)(function () {
        var isCategorizing = action === CONST_1.default.IOU.ACTION.CATEGORIZE;
        var isShareAction = action === CONST_1.default.IOU.ACTION.SHARE;
        var isPolicyExpenseChat = participants === null || participants === void 0 ? void 0 : participants.some(function (participant) { return participant.isPolicyExpenseChat; });
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT && !isPolicyExpenseChat && (initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.amount) && (initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.currency)) {
            var participantAccountIDs = participants === null || participants === void 0 ? void 0 : participants.map(function (participant) { return participant.accountID; });
            (0, IOU_1.setSplitShares)(initialTransaction, initialTransaction.amount, initialTransaction.currency, participantAccountIDs);
        }
        var newReportID = selectedReportID.current;
        transactions.forEach(function (transaction) {
            var _a;
            (0, IOU_1.setMoneyRequestTag)(transaction.transactionID, '');
            (0, IOU_1.setMoneyRequestCategory)(transaction.transactionID, '');
            if (((_a = participants === null || participants === void 0 ? void 0 : participants.at(0)) === null || _a === void 0 ? void 0 : _a.reportID) !== newReportID) {
                (0, Transaction_1.setTransactionReport)(transaction.transactionID, newReportID, true);
            }
        });
        if ((isCategorizing || isShareAction) && numberOfParticipants.current === 0) {
            var _a = (0, Policy_1.createDraftWorkspace)(), expenseChatReportID_1 = _a.expenseChatReportID, policyID_1 = _a.policyID, policyName_1 = _a.policyName;
            transactions.forEach(function (transaction) {
                (0, IOU_1.setMoneyRequestParticipants)(transaction.transactionID, [
                    {
                        selected: true,
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: expenseChatReportID_1,
                        policyID: policyID_1,
                        searchText: policyName_1,
                    },
                ]);
            });
            if (isCategorizing) {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST_1.default.IOU.TYPE.SUBMIT, initialTransactionID, expenseChatReportID_1));
            }
            else {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST_1.default.IOU.TYPE.SUBMIT, initialTransactionID, expenseChatReportID_1, undefined, true));
            }
            return;
        }
        // If coming from the combined submit/track flow and the user proceeds to submit the expense
        // we will use the submit IOU type in the confirmation flow.
        var iouConfirmationPageRoute = ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType === CONST_1.default.IOU.TYPE.CREATE ? CONST_1.default.IOU.TYPE.SUBMIT : iouType, initialTransactionID, newReportID);
        var route = isCategorizing
            ? ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, initialTransactionID, selectedReportID.current || reportID, iouConfirmationPageRoute)
            : iouConfirmationPageRoute;
        Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE_APPROVE);
        waitForKeyboardDismiss(function () {
            // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
            if (backTo) {
                // We don't want to compare params because we just changed the participants.
                Navigation_1.default.goBack(route, { compareParams: false });
            }
            else {
                Navigation_1.default.navigate(route);
            }
        });
    }, [action, participants, iouType, initialTransaction, transactions, initialTransactionID, reportID, waitForKeyboardDismiss, backTo]);
    var navigateBack = (0, react_1.useCallback)(function () {
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        (0, IOUUtils_1.navigateToStartMoneyRequestStep)(iouRequestType, iouType, initialTransactionID, reportID, action);
    }, [backTo, iouRequestType, iouType, initialTransactionID, reportID, action]);
    (0, react_1.useEffect)(function () {
        var isCategorizing = action === CONST_1.default.IOU.ACTION.CATEGORIZE;
        var isShareAction = action === CONST_1.default.IOU.ACTION.SHARE;
        if (isFocused && (isCategorizing || isShareAction)) {
            transactions.forEach(function (transaction) {
                (0, IOU_1.setMoneyRequestParticipants)(transaction.transactionID, []);
            });
            numberOfParticipants.current = 0;
        }
        // We don't want to clear out participants every time the transactions change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isFocused, action]);
    var isWorkspacesOnly = (0, react_1.useMemo)(function () {
        return !!((initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.amount) && (initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.amount) < 0);
    }, [initialTransaction]);
    return (<StepScreenWrapper_1.default headerTitle={headerTitle} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepParticipants.displayName}>
            {!!skipConfirmation && (<FormHelpMessage_1.default style={[styles.ph4, styles.mb4]} isError={false} shouldShowRedDotIndicator={false} message={translate('quickAction.noLongerHaveReportAccess')}/>)}
            {transactions.length > 0 && (<MoneyRequestParticipantsSelector_1.default participants={isSplitRequest ? participants : []} onParticipantsAdded={addParticipant} onFinish={goToNextStep} iouType={iouType} action={action} isPerDiemRequest={(0, TransactionUtils_1.isPerDiemRequest)(initialTransaction)} isWorkspacesOnly={isWorkspacesOnly}/>)}
        </StepScreenWrapper_1.default>);
}
IOURequestStepParticipants.displayName = 'IOURequestStepParticipants';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepParticipants));
