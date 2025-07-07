"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var Provider_1 = require("@components/DragAndDrop/Provider");
var DropZoneUI_1 = require("@components/DropZone/DropZoneUI");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var LocationPermissionModal_1 = require("@components/LocationPermissionModal");
var MoneyRequestConfirmationList_1 = require("@components/MoneyRequestConfirmationList");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PrevNextButtons_1 = require("@components/PrevNextButtons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDeepCompareRef_1 = require("@hooks/useDeepCompareRef");
var useFetchRoute_1 = require("@hooks/useFetchRoute");
var useFilesValidation_1 = require("@hooks/useFilesValidation");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThreeDotsAnchorPosition_1 = require("@hooks/useThreeDotsAnchorPosition");
var Task_1 = require("@libs/actions/Task");
var DateUtils_1 = require("@libs/DateUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getCurrentPosition_1 = require("@libs/getCurrentPosition");
var IOUUtils_1 = require("@libs/IOUUtils");
var Log_1 = require("@libs/Log");
var navigateAfterInteraction_1 = require("@libs/Navigation/navigateAfterInteraction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NumberUtils_1 = require("@libs/NumberUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Performance_1 = require("@libs/Performance");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ReceiptDropUI_1 = require("@pages/iou/ReceiptDropUI");
var IOU_1 = require("@userActions/IOU");
var Policy_1 = require("@userActions/Policy/Policy");
var TransactionEdit_1 = require("@userActions/TransactionEdit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepConfirmation(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var reportReal = _a.report, reportDraft = _a.reportDraft, _s = _a.route.params, iouType = _s.iouType, reportID = _s.reportID, initialTransactionID = _s.transactionID, action = _s.action, participantsAutoAssignedFromRoute = _s.participantsAutoAssigned, backToReport = _s.backToReport, initialTransaction = _a.transaction, isLoadingTransaction = _a.isLoadingTransaction;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var optimisticTransactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT, {
        selector: function (items) { return Object.values(items !== null && items !== void 0 ? items : {}); },
        canBeMissing: true,
    })[0];
    var transactions = (0, react_1.useMemo)(function () {
        var allTransactions = initialTransactionID === CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID ? (optimisticTransactions !== null && optimisticTransactions !== void 0 ? optimisticTransactions : []) : [initialTransaction];
        return allTransactions.filter(function (transaction) { return !!transaction; });
    }, [initialTransaction, initialTransactionID, optimisticTransactions]);
    var hasMultipleTransactions = transactions.length > 1;
    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    var transactionIDs = (0, react_1.useMemo)(function () { return transactions === null || transactions === void 0 ? void 0 : transactions.map(function (transaction) { return transaction.transactionID; }); }, [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var _t = (0, react_1.useState)(initialTransactionID), currentTransactionID = _t[0], setCurrentTransactionID = _t[1];
    var currentTransactionIndex = (0, react_1.useMemo)(function () { return transactions.findIndex(function (transaction) { return transaction.transactionID === currentTransactionID; }); }, [transactions, currentTransactionID]);
    var _u = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(currentTransactionID), { canBeMissing: true }), existingTransaction = _u[0], existingTransactionResult = _u[1];
    var _v = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(currentTransactionID), { canBeMissing: true }), optimisticTransaction = _v[0], optimisticTransactionResult = _v[1];
    var isLoadingCurrentTransaction = (0, isLoadingOnyxValue_1.default)(existingTransactionResult, optimisticTransactionResult);
    var transaction = (0, react_1.useMemo)(function () { return (!isLoadingCurrentTransaction ? (optimisticTransaction !== null && optimisticTransaction !== void 0 ? optimisticTransaction : existingTransaction) : undefined); }, [existingTransaction, optimisticTransaction, isLoadingCurrentTransaction]);
    var transactionsCategories = (0, useDeepCompareRef_1.default)(transactions.map(function (_a) {
        var transactionID = _a.transactionID, category = _a.category;
        return ({
            transactionID: transactionID,
            category: category,
        });
    }));
    var realPolicyID = (0, IOU_1.getIOURequestPolicyID)(initialTransaction, reportReal);
    var draftPolicyID = (0, IOU_1.getIOURequestPolicyID)(initialTransaction, reportDraft);
    var policyDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat(draftPolicyID), { canBeMissing: true })[0];
    var policyReal = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(realPolicyID), { canBeMissing: true })[0];
    var policyCategoriesReal = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(realPolicyID), { canBeMissing: true })[0];
    var policyCategoriesDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES_DRAFT).concat(draftPolicyID), { canBeMissing: true })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(realPolicyID), { canBeMissing: true })[0];
    var userLocation = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_LOCATION, { canBeMissing: true })[0];
    /*
     * We want to use a report from the transaction if it exists
     * Also if the report was submitted and delayed submission is on, then we should use an initial report
     */
    var transactionReport = (0, ReportUtils_1.getReportOrDraftReport)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID);
    var shouldUseTransactionReport = transactionReport && !((0, ReportUtils_1.isProcessingReport)(transactionReport) && !((_b = policyReal === null || policyReal === void 0 ? void 0 : policyReal.harvesting) === null || _b === void 0 ? void 0 : _b.enabled)) && (0, ReportUtils_1.isReportOutstanding)(transactionReport, policyReal === null || policyReal === void 0 ? void 0 : policyReal.id);
    var report = shouldUseTransactionReport ? transactionReport : (reportReal !== null && reportReal !== void 0 ? reportReal : reportDraft);
    var policy = policyReal !== null && policyReal !== void 0 ? policyReal : policyDraft;
    var isDraftPolicy = policy === policyDraft;
    var policyCategories = policyCategoriesReal !== null && policyCategoriesReal !== void 0 ? policyCategoriesReal : policyCategoriesDraft;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var threeDotsAnchorPosition = (0, useThreeDotsAnchorPosition_1.default)(styles.threeDotsPopoverOffsetNoCloseButton);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _w = (0, react_1.useState)(false), startLocationPermissionFlow = _w[0], setStartLocationPermissionFlow = _w[1];
    var _x = (0, react_1.useState)([]), selectedParticipantList = _x[0], setSelectedParticipantList = _x[1];
    var _y = (0, react_1.useState)(false), isDraggingOver = _y[0], setIsDraggingOver = _y[1];
    var _z = (0, react_1.useState)({}), receiptFiles = _z[0], setReceiptFiles = _z[1];
    var requestType = (0, TransactionUtils_1.getRequestType)(transaction);
    var isDistanceRequest = requestType === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE;
    var isPerDiemRequest = requestType === CONST_1.default.IOU.REQUEST_TYPE.PER_DIEM;
    var lastLocationPermissionPrompt = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_LOCATION_PERMISSION_PROMPT, { canBeMissing: true })[0];
    var receiptFilename = transaction === null || transaction === void 0 ? void 0 : transaction.filename;
    var receiptPath = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _c === void 0 ? void 0 : _c.source;
    var isEditingReceipt = (0, TransactionUtils_1.hasReceipt)(transaction);
    var customUnitRateID = (_d = (0, TransactionUtils_1.getRateID)(transaction)) !== null && _d !== void 0 ? _d : '';
    var defaultTaxCode = (0, TransactionUtils_1.getDefaultTaxCode)(policy, transaction);
    var transactionTaxCode = (_e = ((transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) ? transaction === null || transaction === void 0 ? void 0 : transaction.taxCode : defaultTaxCode)) !== null && _e !== void 0 ? _e : '';
    var transactionTaxAmount = (_f = transaction === null || transaction === void 0 ? void 0 : transaction.taxAmount) !== null && _f !== void 0 ? _f : 0;
    var isSharingTrackExpense = action === CONST_1.default.IOU.ACTION.SHARE;
    var isCategorizingTrackExpense = action === CONST_1.default.IOU.ACTION.CATEGORIZE;
    var isMovingTransactionFromTrackExpense = (0, IOUUtils_1.isMovingTransactionFromTrackExpense)(action);
    var isTestTransaction = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _g === void 0 ? void 0 : _g.some(function (participant) { return (0, ReportUtils_1.isSelectedManagerMcTest)(participant.login); });
    var payeePersonalDetails = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs) === null || _a === void 0 ? void 0 : _a.at(0)) !== null && _b !== void 0 ? _b : -1]) {
            return personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs) === null || _c === void 0 ? void 0 : _c.at(0)) !== null && _d !== void 0 ? _d : -1];
        }
        var participant = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _e === void 0 ? void 0 : _e.find(function (val) { var _a, _b; return val.accountID === ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs) === null || _a === void 0 ? void 0 : _a.at(0)) !== null && _b !== void 0 ? _b : -1); });
        return {
            login: (_f = participant === null || participant === void 0 ? void 0 : participant.login) !== null && _f !== void 0 ? _f : '',
            accountID: (_g = participant === null || participant === void 0 ? void 0 : participant.accountID) !== null && _g !== void 0 ? _g : CONST_1.default.DEFAULT_NUMBER_ID,
            avatar: Expensicons.FallbackAvatar,
            displayName: (_h = participant === null || participant === void 0 ? void 0 : participant.login) !== null && _h !== void 0 ? _h : '',
            isOptimisticPersonalDetail: true,
        };
    }, [personalDetails, transaction === null || transaction === void 0 ? void 0 : transaction.participants, transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs]);
    var gpsRequired = (transaction === null || transaction === void 0 ? void 0 : transaction.amount) === 0 && iouType !== CONST_1.default.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && !isTestTransaction;
    var _0 = (0, react_1.useState)(false), isConfirmed = _0[0], setIsConfirmed = _0[1];
    var _1 = (0, react_1.useState)(false), isConfirming = _1[0], setIsConfirming = _1[1];
    // TODO: remove beta check after the feature is enabled
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: false })[0];
    var viewTourReportID = introSelected === null || introSelected === void 0 ? void 0 : introSelected.viewTour;
    var viewTourReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(viewTourReportID), { canBeMissing: true })[0];
    var headerTitle = (0, react_1.useMemo)(function () {
        if (isCategorizingTrackExpense) {
            return translate('iou.categorize');
        }
        if (isSharingTrackExpense) {
            return translate('iou.share');
        }
        if (iouType === CONST_1.default.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.confirmDetails');
    }, [iouType, translate, isSharingTrackExpense, isCategorizingTrackExpense]);
    var participants = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _a === void 0 ? void 0 : _a.map(function (participant) {
            if (participant.isSender && iouType === CONST_1.default.IOU.TYPE.INVOICE) {
                return participant;
            }
            return participant.accountID ? (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails) : (0, OptionsListUtils_1.getReportOption)(participant);
        })) !== null && _b !== void 0 ? _b : [];
    }, [transaction === null || transaction === void 0 ? void 0 : transaction.participants, personalDetails, iouType]);
    var isPolicyExpenseChat = (0, react_1.useMemo)(function () { return participants === null || participants === void 0 ? void 0 : participants.some(function (participant) { return participant.isPolicyExpenseChat; }); }, [participants]);
    var formHasBeenSubmitted = (0, react_1.useRef)(false);
    (0, useFetchRoute_1.default)(transaction, (_h = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _h === void 0 ? void 0 : _h.waypoints, action, (0, IOUUtils_1.shouldUseTransactionDraft)(action) ? CONST_1.default.TRANSACTION.STATE.DRAFT : CONST_1.default.TRANSACTION.STATE.CURRENT);
    (0, react_1.useEffect)(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE_APPROVE);
    }, []);
    (0, react_1.useEffect)(function () {
        var policyExpenseChat = participants === null || participants === void 0 ? void 0 : participants.find(function (participant) { return participant.isPolicyExpenseChat; });
        if ((policyExpenseChat === null || policyExpenseChat === void 0 ? void 0 : policyExpenseChat.policyID) && (policy === null || policy === void 0 ? void 0 : policy.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            (0, Policy_1.openDraftWorkspaceRequest)(policyExpenseChat.policyID);
        }
        var senderPolicyParticipant = participants === null || participants === void 0 ? void 0 : participants.find(function (participant) { return !!participant && 'isSender' in participant && participant.isSender; });
        if ((senderPolicyParticipant === null || senderPolicyParticipant === void 0 ? void 0 : senderPolicyParticipant.policyID) && (policy === null || policy === void 0 ? void 0 : policy.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            (0, Policy_1.openDraftWorkspaceRequest)(senderPolicyParticipant.policyID);
        }
    }, [isOffline, participants, policy === null || policy === void 0 ? void 0 : policy.pendingAction]);
    var defaultBillable = !!(policy === null || policy === void 0 ? void 0 : policy.defaultBillable);
    (0, react_1.useEffect)(function () {
        transactionIDs.forEach(function (transactionID) {
            (0, IOU_1.setMoneyRequestBillable)(transactionID, defaultBillable);
        });
    }, [transactionIDs, defaultBillable]);
    (0, react_1.useEffect)(function () {
        var _a, _b, _c, _d;
        // Exit early if the transaction is still loading
        if (isLoadingTransaction) {
            return;
        }
        // Check if the transaction belongs to the current report
        var isCurrentReportID = (transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate)
            ? ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.reportID) === reportID || (!((_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _c === void 0 ? void 0 : _c.at(0)) === null || _d === void 0 ? void 0 : _d.reportID) && (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === reportID)
            : (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === reportID;
        // Exit if the transaction already exists and is associated with the current report
        if ((transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) &&
            (!(transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate) || !(0, EmptyObject_1.isEmptyObject)(transaction === null || transaction === void 0 ? void 0 : transaction.participants)) &&
            (isCurrentReportID || isMovingTransactionFromTrackExpense || iouType === CONST_1.default.IOU.TYPE.INVOICE)) {
            return;
        }
        (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.CREATE, 
        // When starting to create an expense from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
        // for all of the routes in the creation flow.
        (0, ReportUtils_1.generateReportID)());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, [isLoadingTransaction, isMovingTransactionFromTrackExpense]);
    (0, react_1.useEffect)(function () {
        transactions.forEach(function (item) {
            if (!item.category) {
                return;
            }
            if ((policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[item.category]) && !policyCategories[item.category].enabled) {
                (0, IOU_1.setMoneyRequestCategory)(item.transactionID, '', policy === null || policy === void 0 ? void 0 : policy.id);
            }
        });
        // We don't want to clear out category every time the transactions change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policy === null || policy === void 0 ? void 0 : policy.id, policyCategories, transactionsCategories]);
    var policyDistance = Object.values((_j = policy === null || policy === void 0 ? void 0 : policy.customUnits) !== null && _j !== void 0 ? _j : {}).find(function (customUnit) { return customUnit.name === CONST_1.default.CUSTOM_UNITS.NAME_DISTANCE; });
    var defaultCategory = (_k = policyDistance === null || policyDistance === void 0 ? void 0 : policyDistance.defaultCategory) !== null && _k !== void 0 ? _k : '';
    (0, react_1.useEffect)(function () {
        transactions.forEach(function (item) {
            if (requestType !== CONST_1.default.IOU.REQUEST_TYPE.DISTANCE || !!(item === null || item === void 0 ? void 0 : item.category)) {
                return;
            }
            (0, IOU_1.setMoneyRequestCategory)(item.transactionID, defaultCategory, policy === null || policy === void 0 ? void 0 : policy.id);
        });
        // Prevent resetting to default when unselect category
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [transactionIDs, requestType, defaultCategory, policy === null || policy === void 0 ? void 0 : policy.id]);
    var navigateBack = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d, _e, _f;
        // If the action is categorize and there's no policies other than personal one, we simply call goBack(), i.e: dismiss the whole flow together
        // We don't need to subscribe to policy_ collection as we only need to check on the latest collection value
        if (action === CONST_1.default.IOU.ACTION.CATEGORIZE) {
            Navigation_1.default.goBack();
            return;
        }
        if (isPerDiemRequest) {
            if (isMovingTransactionFromTrackExpense) {
                Navigation_1.default.goBack();
                return;
            }
            Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, initialTransactionID, reportID));
            return;
        }
        if ((transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate) && !((_a = transaction.receipt) === null || _a === void 0 ? void 0 : _a.isTestReceipt)) {
            // If the participants weren't automatically added to the transaction, then we should go back to the IOURequestStepParticipants.
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.participantsAutoAssigned) && participantsAutoAssignedFromRoute !== 'true') {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, initialTransactionID, (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) || reportID, undefined, action), {
                    compareParams: false,
                });
                return;
            }
            // If the participant was auto-assigned, we need to keep the reportID that is already on the stack.
            // This will allow the user to edit the participant field after going back and forward.
            Navigation_1.default.goBack();
            return;
        }
        // If the user came from Test Drive modal, we need to take him back there
        if (((_b = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _b === void 0 ? void 0 : _b.isTestDriveReceipt) && ((_d = (_c = transaction.participants) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0) {
            Navigation_1.default.goBack(ROUTES_1.default.TEST_DRIVE_MODAL_ROOT.getRoute((_f = (_e = transaction.participants) === null || _e === void 0 ? void 0 : _e.at(0)) === null || _f === void 0 ? void 0 : _f.login));
            return;
        }
        // This has selected the participants from the beginning and the participant field shouldn't be editable.
        (0, IOUUtils_1.navigateToStartMoneyRequestStep)(requestType, iouType, initialTransactionID, reportID, action);
    }, [
        action,
        isPerDiemRequest,
        transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate,
        (_l = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _l === void 0 ? void 0 : _l.isTestReceipt,
        (_m = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _m === void 0 ? void 0 : _m.isTestDriveReceipt,
        transaction === null || transaction === void 0 ? void 0 : transaction.participantsAutoAssigned,
        transaction === null || transaction === void 0 ? void 0 : transaction.reportID,
        transaction === null || transaction === void 0 ? void 0 : transaction.participants,
        requestType,
        iouType,
        initialTransactionID,
        reportID,
        participantsAutoAssignedFromRoute,
        isMovingTransactionFromTrackExpense,
    ]);
    var navigateToAddReceipt = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(action, iouType, initialTransactionID, reportID, Navigation_1.default.getActiveRouteWithoutParams()));
    }, [iouType, initialTransactionID, reportID, action]);
    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    (0, react_1.useEffect)(function () {
        var newReceiptFiles = {};
        var isScanFilesCanBeRead = true;
        Promise.all(transactions.map(function (item) {
            var _a;
            var _b, _c;
            var itemReceiptFilename = item.filename;
            var itemReceiptPath = (_b = item.receipt) === null || _b === void 0 ? void 0 : _b.source;
            var itemReceiptType = (_c = item.receipt) === null || _c === void 0 ? void 0 : _c.type;
            var isLocalFile = (0, FileUtils_1.isLocalFile)(itemReceiptPath);
            if (!isLocalFile) {
                newReceiptFiles = __assign(__assign({}, newReceiptFiles), (_a = {}, _a[item.transactionID] = item.receipt, _a));
                return;
            }
            var onSuccess = function (file) {
                var _a;
                var _b, _c;
                var receipt = file;
                if ((_b = item === null || item === void 0 ? void 0 : item.receipt) === null || _b === void 0 ? void 0 : _b.isTestReceipt) {
                    receipt.isTestReceipt = true;
                    receipt.state = CONST_1.default.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                }
                else if ((_c = item === null || item === void 0 ? void 0 : item.receipt) === null || _c === void 0 ? void 0 : _c.isTestDriveReceipt) {
                    receipt.isTestDriveReceipt = true;
                    receipt.state = CONST_1.default.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                }
                else {
                    receipt.state = file && requestType === CONST_1.default.IOU.REQUEST_TYPE.MANUAL ? CONST_1.default.IOU.RECEIPT_STATE.OPEN : CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY;
                }
                newReceiptFiles = __assign(__assign({}, newReceiptFiles), (_a = {}, _a[item.transactionID] = receipt, _a));
            };
            var onFailure = function () {
                isScanFilesCanBeRead = false;
                if (initialTransactionID === item.transactionID) {
                    (0, IOU_1.setMoneyRequestReceipt)(item.transactionID, '', '', true);
                }
            };
            return (0, IOU_1.checkIfScanFileCanBeRead)(itemReceiptFilename, itemReceiptPath, itemReceiptType, onSuccess, onFailure);
        })).then(function () {
            if (isScanFilesCanBeRead) {
                setReceiptFiles(newReceiptFiles);
                return;
            }
            if (requestType === CONST_1.default.IOU.REQUEST_TYPE.MANUAL) {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, initialTransactionID, reportID, Navigation_1.default.getActiveRouteWithoutParams()));
                return;
            }
            (0, TransactionEdit_1.removeDraftTransactions)(true).then(function () { return (0, IOUUtils_1.navigateToStartMoneyRequestStep)(requestType, iouType, initialTransactionID, reportID); });
        });
    }, [requestType, iouType, initialTransactionID, reportID, action, report, transactions, participants]);
    var requestMoney = (0, react_1.useCallback)(function (selectedParticipants, gpsPoints) {
        if (!transactions.length) {
            return;
        }
        var participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }
        var optimisticChatReportID = (0, ReportUtils_1.generateReportID)();
        var optimisticCreatedReportActionID = (0, NumberUtils_1.rand64)();
        var optimisticIOUReportID = (0, ReportUtils_1.generateReportID)();
        var optimisticReportPreviewActionID = (0, NumberUtils_1.rand64)();
        transactions.forEach(function (item, index) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            var receipt = receiptFiles[item.transactionID];
            var isTestReceipt = (_a = receipt === null || receipt === void 0 ? void 0 : receipt.isTestReceipt) !== null && _a !== void 0 ? _a : false;
            var isTestDriveReceipt = (_b = receipt === null || receipt === void 0 ? void 0 : receipt.isTestDriveReceipt) !== null && _b !== void 0 ? _b : false;
            if (isTestDriveReceipt) {
                (0, Task_1.completeTestDriveTask)(viewTourReport, viewTourReportID);
            }
            (0, IOU_1.requestMoney)({
                report: report,
                optimisticChatReportID: optimisticChatReportID,
                optimisticCreatedReportActionID: optimisticCreatedReportActionID,
                optimisticIOUReportID: optimisticIOUReportID,
                optimisticReportPreviewActionID: optimisticReportPreviewActionID,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant: participant,
                },
                policyParams: {
                    policy: policy,
                    policyTagList: policyTags,
                    policyCategories: policyCategories,
                },
                gpsPoints: gpsPoints,
                action: action,
                transactionParams: {
                    amount: isTestReceipt ? CONST_1.default.TEST_RECEIPT.AMOUNT : item.amount,
                    attendees: (_c = item.comment) === null || _c === void 0 ? void 0 : _c.attendees,
                    currency: isTestReceipt ? CONST_1.default.TEST_RECEIPT.CURRENCY : item.currency,
                    created: item.created,
                    merchant: isTestReceipt ? CONST_1.default.TEST_RECEIPT.MERCHANT : item.merchant,
                    comment: (_f = (_e = (_d = item === null || item === void 0 ? void 0 : item.comment) === null || _d === void 0 ? void 0 : _d.comment) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '',
                    receipt: receipt,
                    category: item.category,
                    tag: item.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    billable: item.billable,
                    actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                    waypoints: Object.keys((_h = (_g = item.comment) === null || _g === void 0 ? void 0 : _g.waypoints) !== null && _h !== void 0 ? _h : {}).length ? (0, TransactionUtils_1.getValidWaypoints)((_j = item.comment) === null || _j === void 0 ? void 0 : _j.waypoints, true) : undefined,
                    customUnitRateID: customUnitRateID,
                    isTestDrive: (_k = item.receipt) === null || _k === void 0 ? void 0 : _k.isTestDriveReceipt,
                    originalTransactionID: (_l = item.comment) === null || _l === void 0 ? void 0 : _l.originalTransactionID,
                    source: (_m = item.comment) === null || _m === void 0 ? void 0 : _m.source,
                },
                shouldHandleNavigation: index === transactions.length - 1,
                backToReport: backToReport,
            });
        });
    }, [
        report,
        transactions,
        receiptFiles,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        policy,
        policyTags,
        policyCategories,
        action,
        transactionTaxCode,
        transactionTaxAmount,
        customUnitRateID,
        backToReport,
        viewTourReport,
        viewTourReportID,
    ]);
    var submitPerDiemExpense = (0, react_1.useCallback)(function (selectedParticipants, trimmedComment) {
        var _a, _b;
        if (!transaction) {
            return;
        }
        var participant = selectedParticipants.at(0);
        if (!participant || (0, EmptyObject_1.isEmptyObject)(transaction.comment) || (0, EmptyObject_1.isEmptyObject)(transaction.comment.customUnit)) {
            return;
        }
        (0, IOU_1.submitPerDiemExpense)({
            report: report,
            participantParams: {
                payeeEmail: currentUserPersonalDetails.login,
                payeeAccountID: currentUserPersonalDetails.accountID,
                participant: participant,
            },
            policyParams: {
                policy: policy,
                policyTagList: policyTags,
                policyCategories: policyCategories,
            },
            transactionParams: {
                currency: transaction.currency,
                created: transaction.created,
                comment: trimmedComment,
                category: transaction.category,
                tag: transaction.tag,
                customUnit: (_a = transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit,
                billable: transaction.billable,
                attendees: (_b = transaction.comment) === null || _b === void 0 ? void 0 : _b.attendees,
            },
        });
    }, [report, transaction, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, policy, policyTags, policyCategories]);
    var trackExpense = (0, react_1.useCallback)(function (selectedParticipants, gpsPoints) {
        if (!report || !transactions.length) {
            return;
        }
        var participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }
        transactions.forEach(function (item, index) {
            var _a, _b, _c, _d, _e, _f, _g;
            (0, IOU_1.trackExpense)({
                report: report,
                isDraftPolicy: isDraftPolicy,
                action: action,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant: participant,
                },
                policyParams: {
                    policy: policy,
                    policyCategories: policyCategories,
                    policyTagList: policyTags,
                },
                transactionParams: {
                    amount: item.amount,
                    currency: item.currency,
                    created: item.created,
                    merchant: item.merchant,
                    comment: (_c = (_b = (_a = item === null || item === void 0 ? void 0 : item.comment) === null || _a === void 0 ? void 0 : _a.comment) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '',
                    receipt: receiptFiles[item.transactionID],
                    category: item.category,
                    tag: item.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    billable: item.billable,
                    gpsPoints: gpsPoints,
                    validWaypoints: Object.keys((_e = (_d = item === null || item === void 0 ? void 0 : item.comment) === null || _d === void 0 ? void 0 : _d.waypoints) !== null && _e !== void 0 ? _e : {}).length ? (0, TransactionUtils_1.getValidWaypoints)((_f = item.comment) === null || _f === void 0 ? void 0 : _f.waypoints, true) : undefined,
                    actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                    customUnitRateID: customUnitRateID,
                    attendees: (_g = item.comment) === null || _g === void 0 ? void 0 : _g.attendees,
                },
                accountantParams: {
                    accountant: item.accountant,
                },
                shouldHandleNavigation: index === transactions.length - 1,
            });
        });
    }, [
        report,
        transactions,
        receiptFiles,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        transactionTaxCode,
        transactionTaxAmount,
        policy,
        policyTags,
        policyCategories,
        action,
        customUnitRateID,
        isDraftPolicy,
    ]);
    var createDistanceRequest = (0, react_1.useCallback)(function (selectedParticipants, trimmedComment) {
        var _a, _b;
        if (!transaction) {
            return;
        }
        (0, IOU_1.createDistanceRequest)({
            report: report,
            participants: selectedParticipants,
            currentUserLogin: currentUserPersonalDetails.login,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            iouType: iouType,
            existingTransaction: transaction,
            policyParams: {
                policy: policy,
                policyCategories: policyCategories,
                policyTagList: policyTags,
            },
            transactionParams: {
                amount: transaction.amount,
                comment: trimmedComment,
                created: transaction.created,
                currency: transaction.currency,
                merchant: transaction.merchant,
                category: transaction.category,
                tag: transaction.tag,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                customUnitRateID: customUnitRateID,
                splitShares: transaction.splitShares,
                validWaypoints: (0, TransactionUtils_1.getValidWaypoints)((_a = transaction.comment) === null || _a === void 0 ? void 0 : _a.waypoints, true),
                billable: transaction.billable,
                attendees: (_b = transaction.comment) === null || _b === void 0 ? void 0 : _b.attendees,
            },
            backToReport: backToReport,
        });
    }, [
        transaction,
        report,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        iouType,
        policy,
        policyCategories,
        policyTags,
        transactionTaxCode,
        transactionTaxAmount,
        customUnitRateID,
        backToReport,
    ]);
    var createTransaction = (0, react_1.useCallback)(function (selectedParticipants, locationPermissionGranted) {
        var _a, _b, _c, _d, _e;
        if (locationPermissionGranted === void 0) { locationPermissionGranted = false; }
        setIsConfirmed(true);
        var splitParticipants = selectedParticipants;
        // Filter out participants with an amount equal to O
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT && (transaction === null || transaction === void 0 ? void 0 : transaction.splitShares)) {
            var participantsWithAmount_1 = Object.keys((_a = transaction.splitShares) !== null && _a !== void 0 ? _a : {})
                .filter(function (accountID) { var _a, _b, _c; return ((_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitShares) === null || _a === void 0 ? void 0 : _a[Number(accountID)]) === null || _b === void 0 ? void 0 : _b.amount) !== null && _c !== void 0 ? _c : 0) > 0; })
                .map(function (accountID) { return Number(accountID); });
            splitParticipants = selectedParticipants.filter(function (participant) {
                var _a, _b;
                return participantsWithAmount_1.includes(participant.isPolicyExpenseChat ? ((_a = participant === null || participant === void 0 ? void 0 : participant.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID) : ((_b = participant.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID));
            });
        }
        var trimmedComment = (_d = (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.comment) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
        // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
        if (formHasBeenSubmitted.current) {
            return;
        }
        formHasBeenSubmitted.current = true;
        if (iouType !== CONST_1.default.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense) {
            createDistanceRequest(iouType === CONST_1.default.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipants, trimmedComment);
            return;
        }
        var currentTransactionReceiptFile = (transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) ? receiptFiles[transaction.transactionID] : undefined;
        // If we have a receipt let's start the split expense by creating only the action, the transaction, and the group DM if needed
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT && currentTransactionReceiptFile) {
            if (currentUserPersonalDetails.login && !!transaction) {
                (0, IOU_1.startSplitBill)({
                    participants: selectedParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    comment: trimmedComment,
                    receipt: currentTransactionReceiptFile,
                    existingSplitChatReportID: report === null || report === void 0 ? void 0 : report.reportID,
                    billable: transaction.billable,
                    category: transaction.category,
                    tag: transaction.tag,
                    currency: transaction.currency,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                });
            }
            return;
        }
        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT && !(transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate)) {
            if (currentUserPersonalDetails.login && !!transaction) {
                (0, IOU_1.splitBill)({
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    existingSplitChatReportID: report === null || report === void 0 ? void 0 : report.reportID,
                    billable: transaction.billable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    splitPayerAccountIDs: (_e = transaction.splitPayerAccountIDs) !== null && _e !== void 0 ? _e : [],
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                });
            }
            return;
        }
        // If the split expense is created from the global create menu, we also navigate the user to the group report
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT) {
            if (currentUserPersonalDetails.login && !!transaction) {
                (0, IOU_1.splitBillAndOpenReport)({
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    billable: !!transaction.billable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    splitPayerAccountIDs: transaction.splitPayerAccountIDs,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                });
            }
            return;
        }
        if (iouType === CONST_1.default.IOU.TYPE.INVOICE) {
            (0, IOU_1.sendInvoice)(currentUserPersonalDetails.accountID, transaction, report, currentTransactionReceiptFile, policy, policyTags, policyCategories);
            return;
        }
        if (iouType === CONST_1.default.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense) {
            if (Object.values(receiptFiles).filter(function (receipt) { return !!receipt; }).length && transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                    if (userLocation) {
                        trackExpense(selectedParticipants, {
                            lat: userLocation.latitude,
                            long: userLocation.longitude,
                        });
                        return;
                    }
                    (0, getCurrentPosition_1.default)(function (successData) {
                        trackExpense(selectedParticipants, {
                            lat: successData.coords.latitude,
                            long: successData.coords.longitude,
                        });
                    }, function (errorData) {
                        Log_1.default.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                        // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                        trackExpense(selectedParticipants);
                    }, {
                        maximumAge: CONST_1.default.GPS.MAX_AGE,
                        timeout: CONST_1.default.GPS.TIMEOUT,
                    });
                    return;
                }
                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                trackExpense(selectedParticipants);
                return;
            }
            trackExpense(selectedParticipants);
            return;
        }
        if (isPerDiemRequest) {
            submitPerDiemExpense(selectedParticipants, trimmedComment);
            return;
        }
        if (Object.values(receiptFiles).filter(function (receipt) { return !!receipt; }).length && !!transaction) {
            // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
            if (transaction.amount === 0 &&
                !isSharingTrackExpense &&
                !isCategorizingTrackExpense &&
                locationPermissionGranted &&
                !selectedParticipants.some(function (participant) { return (0, ReportUtils_1.isSelectedManagerMcTest)(participant.login); })) {
                if (userLocation) {
                    requestMoney(selectedParticipants, {
                        lat: userLocation.latitude,
                        long: userLocation.longitude,
                    });
                    return;
                }
                (0, getCurrentPosition_1.default)(function (successData) {
                    requestMoney(selectedParticipants, {
                        lat: successData.coords.latitude,
                        long: successData.coords.longitude,
                    });
                }, function (errorData) {
                    Log_1.default.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                    // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                    requestMoney(selectedParticipants);
                }, {
                    maximumAge: CONST_1.default.GPS.MAX_AGE,
                    timeout: CONST_1.default.GPS.TIMEOUT,
                });
                return;
            }
            // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
            requestMoney(selectedParticipants);
            return;
        }
        requestMoney(selectedParticipants);
    }, [
        iouType,
        transaction,
        isDistanceRequest,
        isMovingTransactionFromTrackExpense,
        receiptFiles,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isPerDiemRequest,
        requestMoney,
        createDistanceRequest,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        report,
        transactionTaxCode,
        transactionTaxAmount,
        policy,
        policyTags,
        policyCategories,
        trackExpense,
        submitPerDiemExpense,
        userLocation,
    ]);
    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     */
    var sendMoney = (0, react_1.useCallback)(function (paymentMethod) {
        var _a, _b, _c;
        var currency = transaction === null || transaction === void 0 ? void 0 : transaction.currency;
        var trimmedComment = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.comment) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
        var participant = participants === null || participants === void 0 ? void 0 : participants.at(0);
        if (!participant || !(transaction === null || transaction === void 0 ? void 0 : transaction.amount) || !currency) {
            return;
        }
        if (paymentMethod === CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE) {
            setIsConfirmed(true);
            (0, IOU_1.sendMoneyElsewhere)(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
            return;
        }
        if (paymentMethod === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY) {
            setIsConfirmed(true);
            (0, IOU_1.sendMoneyWithWallet)(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
        }
    }, [transaction === null || transaction === void 0 ? void 0 : transaction.amount, transaction === null || transaction === void 0 ? void 0 : transaction.comment, transaction === null || transaction === void 0 ? void 0 : transaction.currency, participants, currentUserPersonalDetails.accountID, report]);
    var setBillable = (0, react_1.useCallback)(function (billable) {
        (0, IOU_1.setMoneyRequestBillable)(currentTransactionID, billable);
    }, [currentTransactionID]);
    // This loading indicator is shown because the transaction originalCurrency is being updated later than the component mounts.
    // To prevent the component from rendering with the wrong currency, we show a loading indicator until the correct currency is set.
    var isLoading = !!(transaction === null || transaction === void 0 ? void 0 : transaction.originalCurrency);
    var onConfirm = function (listOfParticipants) {
        setIsConfirming(true);
        setSelectedParticipantList(listOfParticipants);
        if (gpsRequired) {
            var shouldStartLocationPermissionFlow = !lastLocationPermissionPrompt ||
                (DateUtils_1.default.isValidDateString(lastLocationPermissionPrompt !== null && lastLocationPermissionPrompt !== void 0 ? lastLocationPermissionPrompt : '') &&
                    DateUtils_1.default.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt !== null && lastLocationPermissionPrompt !== void 0 ? lastLocationPermissionPrompt : '')) > CONST_1.default.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);
            if (shouldStartLocationPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
        }
        createTransaction(listOfParticipants);
        setIsConfirming(false);
    };
    /**
     * Sets the Receipt object when dragging and dropping a file
     */
    var setReceiptOnDrop = function (files) {
        var _a;
        var file = files.at(0);
        if (!file) {
            return;
        }
        var source = URL.createObjectURL(file);
        (0, IOU_1.setMoneyRequestReceipt)(currentTransactionID, source, (_a = file.name) !== null && _a !== void 0 ? _a : '', true);
    };
    var _2 = (0, useFilesValidation_1.default)(setReceiptOnDrop), validateFiles = _2.validateFiles, PDFValidationComponent = _2.PDFValidationComponent, ErrorModal = _2.ErrorModal;
    var handleDroppingReceipt = function (e) {
        var _a;
        var file = (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files[0];
        if (file) {
            file.uri = URL.createObjectURL(file);
            validateFiles([file]);
        }
    };
    if (isLoadingTransaction) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    var showNextTransaction = function () {
        var nextTransaction = transactions.at(currentTransactionIndex + 1);
        if (nextTransaction) {
            setCurrentTransactionID(nextTransaction.transactionID);
        }
    };
    var showPreviousTransaction = function () {
        var previousTransaction = transactions.at(currentTransactionIndex - 1);
        if (previousTransaction) {
            setCurrentTransactionID(previousTransaction.transactionID);
        }
    };
    var shouldShowThreeDotsButton = requestType === CONST_1.default.IOU.REQUEST_TYPE.MANUAL && (iouType === CONST_1.default.IOU.TYPE.SUBMIT || iouType === CONST_1.default.IOU.TYPE.TRACK) && !isMovingTransactionFromTrackExpense;
    var shouldShowSmartScanFields = !!((_o = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _o === void 0 ? void 0 : _o.isTestDriveReceipt) || (isMovingTransactionFromTrackExpense ? (transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== 0 : requestType !== CONST_1.default.IOU.REQUEST_TYPE.SCAN);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={IOURequestStepConfirmation.displayName} headerGapStyles={isDraggingOver ? [isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? styles.dropWrapper : styles.isDraggingOver] : []}>
            <Provider_1.default setIsDraggingOver={setIsDraggingOver} isDisabled={!shouldShowThreeDotsButton}>
                <react_native_1.View style={styles.flex1}>
                    <HeaderWithBackButton_1.default title={headerTitle} subtitle={hasMultipleTransactions ? "".concat(currentTransactionIndex + 1, " ").concat(translate('common.of'), " ").concat(transactions.length) : undefined} onBackButtonPress={navigateBack} shouldShowThreeDotsButton={shouldShowThreeDotsButton} threeDotsAnchorPosition={threeDotsAnchorPosition} threeDotsMenuItems={[
            {
                icon: Expensicons.Receipt,
                text: translate('receipt.addReceipt'),
                onSelected: navigateToAddReceipt,
            },
        ]} shouldDisplayHelpButton={!hasMultipleTransactions}>
                        {hasMultipleTransactions ? (<PrevNextButtons_1.default isPrevButtonDisabled={currentTransactionIndex === 0} isNextButtonDisabled={currentTransactionIndex === transactions.length - 1} onNext={showNextTransaction} onPrevious={showPreviousTransaction}/>) : null}
                    </HeaderWithBackButton_1.default>
                    {(isLoading || ((0, TransactionUtils_1.isScanRequest)(transaction) && !Object.values(receiptFiles).length)) && <FullscreenLoadingIndicator_1.default />}
                    {PDFValidationComponent}
                    {/* TODO: remove beta check after the feature is enabled */}
                    {isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? (<Consumer_1.default onDrop={handleDroppingReceipt}>
                            <DropZoneUI_1.default icon={isEditingReceipt ? Expensicons.ReplaceReceipt : Expensicons.SmartScan} dropStyles={styles.receiptDropOverlay(true)} dropTitle={translate(isEditingReceipt ? 'dropzone.replaceReceipt' : 'quickAction.scanReceipt')} dropTextStyles={styles.receiptDropText} dropInnerWrapperStyles={styles.receiptDropInnerWrapper(true)}/>
                        </Consumer_1.default>) : (<ReceiptDropUI_1.default onDrop={handleDroppingReceipt}/>)}
                    {ErrorModal}
                    {!!gpsRequired && (<LocationPermissionModal_1.default startPermissionFlow={startLocationPermissionFlow} resetPermissionFlow={function () { return setStartLocationPermissionFlow(false); }} onGrant={function () {
                (0, navigateAfterInteraction_1.default)(function () {
                    createTransaction(selectedParticipantList, true);
                });
            }} onDeny={function () {
                (0, IOU_1.updateLastLocationPermissionPrompt)();
                (0, navigateAfterInteraction_1.default)(function () {
                    createTransaction(selectedParticipantList, false);
                });
            }} onInitialGetLocationCompleted={function () {
                setIsConfirming(false);
            }}/>)}
                    <MoneyRequestConfirmationList_1.default transaction={transaction} selectedParticipants={participants} iouAmount={(_p = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _p !== void 0 ? _p : 0} iouAttendees={(0, TransactionUtils_1.getAttendees)(transaction)} iouComment={(_r = (_q = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _q === void 0 ? void 0 : _q.comment) !== null && _r !== void 0 ? _r : ''} iouCurrencyCode={transaction === null || transaction === void 0 ? void 0 : transaction.currency} iouIsBillable={transaction === null || transaction === void 0 ? void 0 : transaction.billable} onToggleBillable={setBillable} iouCategory={transaction === null || transaction === void 0 ? void 0 : transaction.category} onConfirm={onConfirm} onSendMoney={sendMoney} receiptPath={receiptPath} receiptFilename={receiptFilename} iouType={iouType} reportID={reportID} shouldDisplayReceipt={!isMovingTransactionFromTrackExpense && !isDistanceRequest && !isPerDiemRequest} isPolicyExpenseChat={isPolicyExpenseChat} policyID={(0, IOU_1.getIOURequestPolicyID)(transaction, report)} bankAccountRoute={(0, ReportUtils_1.getBankAccountRoute)(report)} iouMerchant={transaction === null || transaction === void 0 ? void 0 : transaction.merchant} iouCreated={transaction === null || transaction === void 0 ? void 0 : transaction.created} isDistanceRequest={isDistanceRequest} isPerDiemRequest={isPerDiemRequest} shouldShowSmartScanFields={shouldShowSmartScanFields} action={action} payeePersonalDetails={payeePersonalDetails} isConfirmed={isConfirmed} isConfirming={isConfirming} expensesNumber={transactions.length} isReceiptEditable/>
                </react_native_1.View>
            </Provider_1.default>
        </ScreenWrapper_1.default>);
}
IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepConfirmationWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepConfirmation);
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepConfirmationWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepConfirmationWithFullTransactionOrNotFound);
exports.default = IOURequestStepConfirmationWithWritableReportOrNotFound;
