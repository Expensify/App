"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var DestinationPicker_1 = require("@components/DestinationPicker");
var FixedFooter_1 = require("@components/FixedFooter");
var Illustrations = require("@components/Icon/Illustrations");
var WorkspaceEmptyStateSection_1 = require("@components/WorkspaceEmptyStateSection");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepDestination(_a) {
    var _b;
    var _c, _d;
    var report = _a.report, _e = _a.route.params, transactionID = _e.transactionID, backTo = _e.backTo, action = _e.action, iouType = _e.iouType, reportID = _e.reportID, transaction = _a.transaction, _f = _a.openedFromStartPage, openedFromStartPage = _f === void 0 ? false : _f, explicitPolicyID = _a.explicitPolicyID;
    var _g = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(explicitPolicyID !== null && explicitPolicyID !== void 0 ? explicitPolicyID : (0, IOU_1.getIOURequestPolicyID)(transaction, report)), { canBeMissing: false }), policy = _g[0], policyMetadata = _g[1];
    var accountID = (0, useCurrentUserPersonalDetails_1.default)().accountID;
    var policyExpenseReport = (policy === null || policy === void 0 ? void 0 : policy.id) ? (0, ReportUtils_1.getPolicyExpenseChat)(accountID, policy.id) : undefined;
    var customUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var selectedDestination = (_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.customUnit) === null || _d === void 0 ? void 0 : _d.customUnitRateID;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = (0, EmptyObject_1.isEmptyObject)(policy);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isLoading = !isOffline && (0, isLoadingOnyxValue_1.default)(policyMetadata);
    var shouldShowEmptyState = (0, EmptyObject_1.isEmptyObject)(customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) && !isOffline;
    var shouldShowOfflineView = (0, EmptyObject_1.isEmptyObject)(customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) && isOffline;
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var updateDestination = function (destination) {
        var _a, _b, _c;
        if ((0, EmptyObject_1.isEmptyObject)(customUnit)) {
            return;
        }
        if (selectedDestination !== destination.keyForList) {
            if (openedFromStartPage) {
                (0, IOU_1.setMoneyRequestParticipantsFromReport)(transactionID, policyExpenseReport);
                (0, IOU_1.setCustomUnitID)(transactionID, customUnit.customUnitID);
                (0, IOU_1.setMoneyRequestCategory)(transactionID, (_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.defaultCategory) !== null && _a !== void 0 ? _a : '');
            }
            (0, IOU_1.setCustomUnitRateID)(transactionID, (_b = destination.keyForList) !== null && _b !== void 0 ? _b : '');
            (0, IOU_1.setMoneyRequestCurrency)(transactionID, destination.currency);
            (0, IOU_1.clearSubrates)(transactionID);
        }
        if (backTo) {
            navigateBack();
        }
        else if (explicitPolicyID && (transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate)) {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, (_c = policyExpenseReport === null || policyExpenseReport === void 0 ? void 0 : policyExpenseReport.reportID) !== null && _c !== void 0 ? _c : reportID));
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, reportID));
        }
    };
    var tabTitles = (_b = {},
        _b[CONST_1.default.IOU.TYPE.REQUEST] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SUBMIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SEND] = translate('iou.paySomeone', { name: '' }),
        _b[CONST_1.default.IOU.TYPE.PAY] = translate('iou.paySomeone', { name: '' }),
        _b[CONST_1.default.IOU.TYPE.SPLIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SPLIT_EXPENSE] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.TRACK] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.INVOICE] = translate('workspace.invoices.sendInvoice'),
        _b[CONST_1.default.IOU.TYPE.CREATE] = translate('iou.createExpense'),
        _b);
    return (<StepScreenWrapper_1.default headerTitle={backTo ? translate('common.destination') : tabTitles[iouType]} onBackButtonPress={navigateBack} shouldShowWrapper={!openedFromStartPage} shouldShowNotFoundPage={shouldShowNotFoundPage} testID={IOURequestStepDestination.displayName}>
            {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
            {shouldShowOfflineView && <FullPageOfflineBlockingView_1.default>{null}</FullPageOfflineBlockingView_1.default>}
            {shouldShowEmptyState && (<react_native_1.View style={[styles.flex1]}>
                    <WorkspaceEmptyStateSection_1.default shouldStyleAsCard={false} icon={Illustrations.EmptyStateExpenses} title={translate('workspace.perDiem.emptyList.title')} subtitle={translate('workspace.perDiem.emptyList.subtitle')} containerStyle={[styles.flex1, styles.justifyContentCenter]}/>
                    {(0, PolicyUtils_1.isPolicyAdmin)(policy) && !!(policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) && (<FixedFooter_1.default style={[styles.mtAuto, styles.pt5]}>
                            <Button_1.default large success style={[styles.w100]} onPress={function () {
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM.getRoute(policy.id, Navigation_1.default.getActiveRoute()));
                    });
                }} text={translate('workspace.perDiem.editPerDiemRates')} pressOnEnter/>
                        </FixedFooter_1.default>)}
                </react_native_1.View>)}
            {!shouldShowEmptyState && !isLoading && !shouldShowOfflineView && !!(policy === null || policy === void 0 ? void 0 : policy.id) && (<DestinationPicker_1.default selectedDestination={selectedDestination} policyID={policy.id} onSubmit={updateDestination}/>)}
        </StepScreenWrapper_1.default>);
}
IOURequestStepDestination.displayName = 'IOURequestStepDestination';
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepDestinationWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepDestination);
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepDestinationWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepDestinationWithFullTransactionOrNotFound);
exports.default = IOURequestStepDestinationWithWritableReportOrNotFound;
