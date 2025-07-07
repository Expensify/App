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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var DistanceRequestFooter_1 = require("@components/DistanceRequest/DistanceRequestFooter");
var DistanceRequestRenderItem_1 = require("@components/DistanceRequest/DistanceRequestRenderItem");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var DraggableList_1 = require("@components/DraggableList");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useFetchRoute_1 = require("@hooks/useFetchRoute");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var MapboxToken_1 = require("@libs/actions/MapboxToken");
var Report_1 = require("@libs/actions/Report");
var Transaction_1 = require("@libs/actions/Transaction");
var TransactionEdit_1 = require("@libs/actions/TransactionEdit");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepDistance(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var report = _a.report, _j = _a.route.params, action = _j.action, iouType = _j.iouType, reportID = _j.reportID, transactionID = _j.transactionID, backTo = _j.backTo, backToReport = _j.backToReport, transaction = _a.transaction, currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var transactionBackup = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP).concat(transactionID), { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: false })[0];
    var activePolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID), { canBeMissing: false })[0];
    var skipConfirmation = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SKIP_CONFIRMATION).concat(transactionID), { canBeMissing: false })[0];
    var _k = (0, react_1.useState)(null), optimisticWaypoints = _k[0], setOptimisticWaypoints = _k[1];
    var waypoints = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (_b = optimisticWaypoints !== null && optimisticWaypoints !== void 0 ? optimisticWaypoints : (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.waypoints) !== null && _b !== void 0 ? _b : {
            waypoint0: { keyForList: 'start_waypoint' },
            waypoint1: { keyForList: 'stop_waypoint' },
        };
    }, [optimisticWaypoints, transaction]);
    var backupWaypoints = ((_b = transactionBackup === null || transactionBackup === void 0 ? void 0 : transactionBackup.pendingFields) === null || _b === void 0 ? void 0 : _b.waypoints) ? (_c = transactionBackup === null || transactionBackup === void 0 ? void 0 : transactionBackup.comment) === null || _c === void 0 ? void 0 : _c.waypoints : undefined;
    // When online, fetch the backup route to ensure the map is populated even if the user does not save the transaction.
    // Fetch the backup route first to ensure the backup transaction map is updated before the main transaction map.
    // This prevents a scenario where the main map loads, the user dismisses the map editor, and the backup map has not yet loaded due to delay.
    (0, useFetchRoute_1.default)(transactionBackup, backupWaypoints, action, CONST_1.default.TRANSACTION.STATE.BACKUP);
    var _l = (0, useFetchRoute_1.default)(transaction, waypoints, action, (0, IOUUtils_1.shouldUseTransactionDraft)(action) ? CONST_1.default.TRANSACTION.STATE.DRAFT : CONST_1.default.TRANSACTION.STATE.CURRENT), shouldFetchRoute = _l.shouldFetchRoute, validatedWaypoints = _l.validatedWaypoints;
    var waypointsList = Object.keys(waypoints);
    var previousWaypoints = (0, usePrevious_1.default)(waypoints);
    var numberOfWaypoints = Object.keys(waypoints).length;
    var numberOfPreviousWaypoints = Object.keys(previousWaypoints).length;
    var scrollViewRef = (0, react_1.useRef)(null);
    var isLoadingRoute = (_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.isLoading) !== null && _e !== void 0 ? _e : false;
    var isLoading = (_f = transaction === null || transaction === void 0 ? void 0 : transaction.isLoading) !== null && _f !== void 0 ? _f : false;
    var isSplitRequest = iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var hasRouteError = !!((_g = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _g === void 0 ? void 0 : _g.route);
    var _m = (0, react_1.useState)(false), shouldShowAtLeastTwoDifferentWaypointsError = _m[0], setShouldShowAtLeastTwoDifferentWaypointsError = _m[1];
    var isWaypointEmpty = function (waypoint) {
        if (!waypoint) {
            return true;
        }
        var keyForList = waypoint.keyForList, waypointWithoutKey = __rest(waypoint, ["keyForList"]);
        return (0, isEmpty_1.default)(waypointWithoutKey);
    };
    var nonEmptyWaypointsCount = (0, react_1.useMemo)(function () { return Object.keys(waypoints).filter(function (key) { return !isWaypointEmpty(waypoints[key]); }).length; }, [waypoints]);
    var duplicateWaypointsError = (0, react_1.useMemo)(function () { return nonEmptyWaypointsCount >= 2 && Object.keys(validatedWaypoints).length !== nonEmptyWaypointsCount; }, [nonEmptyWaypointsCount, validatedWaypoints]);
    var atLeastTwoDifferentWaypointsError = (0, react_1.useMemo)(function () { return Object.keys(validatedWaypoints).length < 2; }, [validatedWaypoints]);
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var transactionWasSaved = (0, react_1.useRef)(false);
    var isCreatingNewRequest = !(backTo || isEditing);
    var _o = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS, { canBeMissing: true }), recentWaypoints = _o[0], recentWaypointsStatus = _o[1].status;
    var iouRequestType = (0, TransactionUtils_1.getRequestType)(transaction);
    var customUnitRateID = (0, TransactionUtils_1.getRateID)(transaction);
    // Sets `amount` and `split` share data before moving to the next step to avoid briefly showing `0.00` as the split share for participants
    var setDistanceRequestData = (0, react_1.useCallback)(function (participants) {
        var _a, _b, _c, _d, _e, _f, _g;
        // Get policy report based on transaction participants
        var isPolicyExpenseChat = participants === null || participants === void 0 ? void 0 : participants.some(function (participant) { return participant.isPolicyExpenseChat; });
        var selectedReportID = (participants === null || participants === void 0 ? void 0 : participants.length) === 1 ? ((_b = (_a = participants.at(0)) === null || _a === void 0 ? void 0 : _a.reportID) !== null && _b !== void 0 ? _b : reportID) : reportID;
        var policyReport = participants.at(0) ? allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selectedReportID)] : report;
        var IOUpolicyID = (0, IOU_1.getIOURequestPolicyID)(transaction, policyReport);
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var IOUpolicy = (0, PolicyUtils_1.getPolicy)((_c = report === null || report === void 0 ? void 0 : report.policyID) !== null && _c !== void 0 ? _c : IOUpolicyID);
        var policyCurrency = (_f = (_d = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _d !== void 0 ? _d : (_e = (0, PolicyUtils_1.getPersonalPolicy)()) === null || _e === void 0 ? void 0 : _e.outputCurrency) !== null && _f !== void 0 ? _f : CONST_1.default.CURRENCY.USD;
        var mileageRates = DistanceRequestUtils_1.default.getMileageRates(IOUpolicy);
        var defaultMileageRate = DistanceRequestUtils_1.default.getDefaultMileageRate(IOUpolicy);
        var mileageRate = (0, TransactionUtils_1.isCustomUnitRateIDForP2P)(transaction)
            ? DistanceRequestUtils_1.default.getRateForP2P(policyCurrency, transaction)
            : // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (customUnitRateID && (mileageRates === null || mileageRates === void 0 ? void 0 : mileageRates[customUnitRateID])) || defaultMileageRate;
        var _h = mileageRate !== null && mileageRate !== void 0 ? mileageRate : {}, unit = _h.unit, rate = _h.rate;
        var distance = (0, TransactionUtils_1.getDistanceInMeters)(transaction, unit);
        var currency = (_g = mileageRate === null || mileageRate === void 0 ? void 0 : mileageRate.currency) !== null && _g !== void 0 ? _g : policyCurrency;
        var amount = DistanceRequestUtils_1.default.getDistanceRequestAmount(distance, unit !== null && unit !== void 0 ? unit : CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate !== null && rate !== void 0 ? rate : 0);
        (0, IOU_1.setMoneyRequestAmount)(transactionID, amount, currency);
        var participantAccountIDs = participants === null || participants === void 0 ? void 0 : participants.map(function (participant) { var _a; return Number((_a = participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID); });
        if (isSplitRequest && amount && currency && !isPolicyExpenseChat) {
            (0, IOU_1.setSplitShares)(transaction, amount, currency !== null && currency !== void 0 ? currency : '', participantAccountIDs !== null && participantAccountIDs !== void 0 ? participantAccountIDs : []);
        }
    }, [report, allReports, transaction, transactionID, isSplitRequest, policy === null || policy === void 0 ? void 0 : policy.outputCurrency, reportID, customUnitRateID]);
    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    var shouldSkipConfirmation = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (!skipConfirmation || !(report === null || report === void 0 ? void 0 : report.reportID)) {
            return false;
        }
        return (iouType !== CONST_1.default.IOU.TYPE.SPLIT &&
            !(0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) &&
            !((0, ReportUtils_1.isPolicyExpenseChat)(report) && (((_a = policy === null || policy === void 0 ? void 0 : policy.requiresCategory) !== null && _a !== void 0 ? _a : false) || ((_b = policy === null || policy === void 0 ? void 0 : policy.requiresTag) !== null && _b !== void 0 ? _b : false))));
    }, [report, skipConfirmation, policy, reportNameValuePairs, iouType]);
    var buttonText = !isCreatingNewRequest ? translate('common.save') : translate('common.next');
    if (shouldSkipConfirmation) {
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT) {
            buttonText = translate('iou.split');
        }
        else {
            buttonText = translate('iou.createExpense');
        }
    }
    (0, react_1.useEffect)(function () {
        if (iouRequestType !== CONST_1.default.IOU.REQUEST_TYPE.DISTANCE || isOffline || recentWaypointsStatus === 'loading' || recentWaypoints !== undefined) {
            return;
        }
        // Only load the recent waypoints if they have been read from Onyx as undefined
        // If the account doesn't have recent waypoints they will be returned as an empty array
        (0, Transaction_1.openDraftDistanceExpense)();
    }, [iouRequestType, recentWaypointsStatus, recentWaypoints, isOffline]);
    (0, react_1.useEffect)(function () {
        (0, MapboxToken_1.init)();
        return MapboxToken_1.stop;
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        if (numberOfWaypoints <= numberOfPreviousWaypoints) {
            return;
        }
        (_a = scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated: true });
    }, [numberOfPreviousWaypoints, numberOfWaypoints]);
    (0, react_1.useEffect)(function () {
        if (nonEmptyWaypointsCount >= 2 && (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError || isLoadingRoute || isLoading)) {
            return;
        }
        setShouldShowAtLeastTwoDifferentWaypointsError(false);
    }, [atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, isLoading, isLoadingRoute, nonEmptyWaypointsCount, transaction]);
    // This effect runs when the component is mounted and unmounted. It's purpose is to be able to properly
    // discard changes if the user cancels out of making any changes. This is accomplished by backing up the
    // original transaction, letting the user modify the current transaction, and then if the user ever
    // cancels out of the modal without saving changes, the original transaction is restored from the backup.
    (0, react_1.useEffect)(function () {
        if (isCreatingNewRequest) {
            return function () { };
        }
        var isDraft = (0, IOUUtils_1.shouldUseTransactionDraft)(action);
        // On mount, create the backup transaction.
        (0, TransactionEdit_1.createBackupTransaction)(transaction, isDraft);
        return function () {
            // If the user cancels out of the modal without saving changes, then the original transaction
            // needs to be restored from the backup so that all changes are removed.
            if (transactionWasSaved.current) {
                (0, TransactionEdit_1.removeBackupTransaction)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
                return;
            }
            (0, TransactionEdit_1.restoreOriginalTransactionFromBackup)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, isDraft);
            // If the user opens IOURequestStepDistance in offline mode and then goes online, re-open the report to fill in missing fields from the transaction backup
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.reportID) || (0, TransactionUtils_1.hasRoute)(transaction, true)) {
                return;
            }
            (0, Report_1.openReport)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var navigateBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo);
    }, [backTo]);
    /**
     * Takes the user to the page for editing a specific waypoint
     * @param index of the waypoint to edit
     */
    var navigateToWaypointEditPage = (0, react_1.useCallback)(function (index) {
        var _a;
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_WAYPOINT.getRoute(action, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : reportID, index.toString(), Navigation_1.default.getActiveRoute()));
    }, [action, transactionID, report === null || report === void 0 ? void 0 : report.reportID, reportID]);
    var navigateToConfirmationPage = (0, react_1.useCallback)(function () {
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
    }, [backToReport, iouType, reportID, transactionID]);
    var navigateToNextStep = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d, _e, _f;
        if (transaction === null || transaction === void 0 ? void 0 : transaction.splitShares) {
            (0, IOU_1.resetSplitShares)(transaction);
        }
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        // If a reportID exists in the report object, it's because either:
        // - The user started this flow from using the + button in the composer inside a report.
        // - The user started this flow from using the global create menu by selecting the Track expense option.
        // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        // If the user started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
        if ((report === null || report === void 0 ? void 0 : report.reportID) && !(0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) && iouType !== CONST_1.default.IOU.TYPE.CREATE) {
            var selectedParticipants = (0, IOU_1.getMoneyRequestParticipantsFromReport)(report);
            var participants = selectedParticipants.map(function (participant) {
                var _a;
                var participantAccountID = (_a = participant === null || participant === void 0 ? void 0 : participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
                return participantAccountID ? (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails) : (0, OptionsListUtils_1.getReportOption)(participant);
            });
            setDistanceRequestData(participants);
            if (shouldSkipConfirmation) {
                (0, IOU_1.setMoneyRequestPendingFields)(transactionID, { waypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD });
                (0, IOU_1.setMoneyRequestMerchant)(transactionID, translate('iou.fieldPending'), false);
                var participant = participants.at(0);
                if (iouType === CONST_1.default.IOU.TYPE.TRACK && participant) {
                    (0, IOU_1.trackExpense)({
                        report: report,
                        isDraftPolicy: false,
                        participantParams: {
                            payeeEmail: currentUserPersonalDetails.login,
                            payeeAccountID: currentUserPersonalDetails.accountID,
                            participant: participant,
                        },
                        policyParams: {
                            policy: policy,
                        },
                        transactionParams: {
                            amount: 0,
                            currency: (_a = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _a !== void 0 ? _a : 'USD',
                            created: (_b = transaction === null || transaction === void 0 ? void 0 : transaction.created) !== null && _b !== void 0 ? _b : '',
                            merchant: translate('iou.fieldPending'),
                            receipt: {},
                            billable: false,
                            validWaypoints: (0, TransactionUtils_1.getValidWaypoints)(waypoints, true),
                            customUnitRateID: customUnitRateID,
                            attendees: (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.attendees,
                        },
                    });
                    return;
                }
                (0, IOU_1.createDistanceRequest)({
                    report: report,
                    participants: participants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    iouType: iouType,
                    existingTransaction: transaction,
                    transactionParams: {
                        amount: 0,
                        comment: '',
                        created: (_d = transaction === null || transaction === void 0 ? void 0 : transaction.created) !== null && _d !== void 0 ? _d : '',
                        currency: (_e = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _e !== void 0 ? _e : 'USD',
                        merchant: translate('iou.fieldPending'),
                        billable: !!(policy === null || policy === void 0 ? void 0 : policy.defaultBillable),
                        validWaypoints: (0, TransactionUtils_1.getValidWaypoints)(waypoints, true),
                        customUnitRateID: DistanceRequestUtils_1.default.getCustomUnitRateID(report.reportID),
                        splitShares: transaction === null || transaction === void 0 ? void 0 : transaction.splitShares,
                        attendees: (_f = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _f === void 0 ? void 0 : _f.attendees,
                    },
                    backToReport: backToReport,
                });
                return;
            }
            (0, IOU_1.setMoneyRequestParticipantsFromReport)(transactionID, report).then(function () {
                navigateToConfirmationPage();
            });
            return;
        }
        // If there was no reportID, then that means the user started this flow from the global menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        if (iouType === CONST_1.default.IOU.TYPE.CREATE && (0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy) && (activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.isPolicyExpenseChatEnabled) && !(0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(activePolicy.id)) {
            var activePolicyExpenseChat_1 = (0, ReportUtils_1.getPolicyExpenseChat)(currentUserPersonalDetails.accountID, activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.id);
            var rateID = DistanceRequestUtils_1.default.getCustomUnitRateID(activePolicyExpenseChat_1 === null || activePolicyExpenseChat_1 === void 0 ? void 0 : activePolicyExpenseChat_1.reportID);
            (0, IOU_1.setCustomUnitRateID)(transactionID, rateID);
            (0, IOU_1.setMoneyRequestParticipantsFromReport)(transactionID, activePolicyExpenseChat_1).then(function () {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType === CONST_1.default.IOU.TYPE.CREATE ? CONST_1.default.IOU.TYPE.SUBMIT : iouType, transactionID, activePolicyExpenseChat_1 === null || activePolicyExpenseChat_1 === void 0 ? void 0 : activePolicyExpenseChat_1.reportID));
            });
        }
        else {
            (0, IOUUtils_1.navigateToParticipantPage)(iouType, transactionID, reportID);
        }
    }, [
        transaction,
        backTo,
        report,
        reportID,
        reportNameValuePairs,
        iouType,
        activePolicy,
        setDistanceRequestData,
        shouldSkipConfirmation,
        transactionID,
        personalDetails,
        translate,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        policy,
        waypoints,
        backToReport,
        customUnitRateID,
        navigateToConfirmationPage,
    ]);
    var getError = function () {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return (0, ErrorUtils_1.getLatestErrorField)(transaction, 'route');
        }
        if (duplicateWaypointsError) {
            return { duplicateWaypointsError: translate('iou.error.duplicateWaypointsErrorMessage') };
        }
        if (atLeastTwoDifferentWaypointsError) {
            return { atLeastTwoDifferentWaypointsError: translate('iou.error.atLeastTwoDifferentWaypoints') };
        }
        return {};
    };
    var updateWaypoints = (0, react_1.useCallback)(function (_a) {
        var data = _a.data;
        if ((0, fast_equals_1.deepEqual)(waypointsList, data)) {
            return;
        }
        var newWaypoints = {};
        var emptyWaypointIndex = -1;
        data.forEach(function (waypoint, index) {
            var _a;
            newWaypoints["waypoint".concat(index)] = (_a = waypoints[waypoint]) !== null && _a !== void 0 ? _a : {};
            // Find waypoint that BECOMES empty after dragging
            if (isWaypointEmpty(newWaypoints["waypoint".concat(index)]) && !isWaypointEmpty(waypoints["waypoint".concat(index)])) {
                emptyWaypointIndex = index;
            }
        });
        setOptimisticWaypoints(newWaypoints);
        Promise.all([
            (0, Transaction_1.removeWaypoint)(transaction, emptyWaypointIndex.toString(), (0, IOUUtils_1.shouldUseTransactionDraft)(action)),
            (0, Transaction_1.updateWaypoints)(transactionID, newWaypoints, (0, IOUUtils_1.shouldUseTransactionDraft)(action)),
        ]).then(function () {
            setOptimisticWaypoints(null);
        });
    }, [transactionID, transaction, waypoints, waypointsList, action]);
    var submitWaypoints = (0, react_1.useCallback)(function () {
        var _a, _b;
        // If there is any error or loading state, don't let user go to next page.
        if (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError || isLoadingRoute || (!isEditing && isLoading)) {
            setShouldShowAtLeastTwoDifferentWaypointsError(true);
            return;
        }
        if (!isCreatingNewRequest && !isEditing) {
            transactionWasSaved.current = true;
        }
        if (isEditing) {
            // If nothing was changed, simply go to transaction thread
            // We compare only addresses because numbers are rounded while backup
            var oldWaypoints = (_b = (_a = transactionBackup === null || transactionBackup === void 0 ? void 0 : transactionBackup.comment) === null || _a === void 0 ? void 0 : _a.waypoints) !== null && _b !== void 0 ? _b : {};
            var oldAddresses = Object.fromEntries(Object.entries(oldWaypoints).map(function (_a) {
                var key = _a[0], waypoint = _a[1];
                return [key, 'address' in waypoint ? waypoint.address : {}];
            }));
            var addresses = Object.fromEntries(Object.entries(waypoints).map(function (_a) {
                var key = _a[0], waypoint = _a[1];
                return [key, 'address' in waypoint ? waypoint.address : {}];
            }));
            var hasRouteChanged = !(0, fast_equals_1.deepEqual)(transactionBackup === null || transactionBackup === void 0 ? void 0 : transactionBackup.routes, transaction === null || transaction === void 0 ? void 0 : transaction.routes);
            if ((0, fast_equals_1.deepEqual)(oldAddresses, addresses)) {
                navigateBack();
                return;
            }
            if ((transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) && (report === null || report === void 0 ? void 0 : report.reportID)) {
                (0, IOU_1.updateMoneyRequestDistance)(__assign(__assign({ transactionID: transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, transactionThreadReportID: report === null || report === void 0 ? void 0 : report.reportID, waypoints: waypoints }, (hasRouteChanged ? { routes: transaction === null || transaction === void 0 ? void 0 : transaction.routes } : {})), { policy: policy, transactionBackup: transactionBackup }));
            }
            transactionWasSaved.current = true;
            navigateBack();
            return;
        }
        navigateToNextStep();
    }, [
        navigateBack,
        duplicateWaypointsError,
        atLeastTwoDifferentWaypointsError,
        hasRouteError,
        isLoadingRoute,
        isLoading,
        isCreatingNewRequest,
        isEditing,
        navigateToNextStep,
        transactionBackup,
        waypoints,
        transaction === null || transaction === void 0 ? void 0 : transaction.transactionID,
        transaction === null || transaction === void 0 ? void 0 : transaction.routes,
        report === null || report === void 0 ? void 0 : report.reportID,
        policy,
    ]);
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, drag = _a.drag, isActive = _a.isActive, getIndex = _a.getIndex;
        return (<DistanceRequestRenderItem_1.default waypoints={waypoints} item={item} onSecondaryInteraction={drag} isActive={isActive} getIndex={getIndex} onPress={navigateToWaypointEditPage} disabled={isLoadingRoute}/>);
    }, [isLoadingRoute, navigateToWaypointEditPage, waypoints]);
    return (<StepScreenWrapper_1.default headerTitle={translate('common.distance')} onBackButtonPress={navigateBack} testID={IOURequestStepDistance.displayName} shouldShowNotFoundPage={isEditing && !((_h = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _h === void 0 ? void 0 : _h.waypoints)} shouldShowWrapper={!isCreatingNewRequest}>
            <>
                <react_native_1.View style={styles.flex1}>
                    <DraggableList_1.default data={waypointsList} keyExtractor={function (item) { var _a, _b, _c, _d; return ((_d = (_b = (_a = waypoints[item]) === null || _a === void 0 ? void 0 : _a.keyForList) !== null && _b !== void 0 ? _b : (_c = waypoints[item]) === null || _c === void 0 ? void 0 : _c.address) !== null && _d !== void 0 ? _d : '') + item; }} onDragEnd={updateWaypoints} ref={scrollViewRef} renderItem={renderItem} ListFooterComponent={<DistanceRequestFooter_1.default waypoints={waypoints} navigateToWaypointEditPage={navigateToWaypointEditPage} transaction={transaction} policy={policy}/>}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.w100, styles.pt2]}>
                    {/* Show error message if there is route error or there are less than 2 routes and user has tried submitting, */}
                    {((shouldShowAtLeastTwoDifferentWaypointsError && atLeastTwoDifferentWaypointsError) || duplicateWaypointsError || hasRouteError) && (<DotIndicatorMessage_1.default style={[styles.mh4, styles.mv3]} messages={getError()} type="error"/>)}
                    <Button_1.default success allowBubble pressOnEnter large style={[styles.w100, styles.mb5, styles.ph5, styles.flexShrink0]} onPress={submitWaypoints} text={buttonText} isLoading={!isOffline && (isLoadingRoute || shouldFetchRoute || isLoading)}/>
                </react_native_1.View>
            </>
        </StepScreenWrapper_1.default>);
}
IOURequestStepDistance.displayName = 'IOURequestStepDistance';
var IOURequestStepDistanceWithOnyx = IOURequestStepDistance;
var IOURequestStepDistanceWithCurrentUserPersonalDetails = (0, withCurrentUserPersonalDetails_1.default)(IOURequestStepDistanceWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDistanceWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepDistanceWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDistanceWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepDistanceWithWritableReportOrNotFound);
exports.default = IOURequestStepDistanceWithFullTransactionOrNotFound;
