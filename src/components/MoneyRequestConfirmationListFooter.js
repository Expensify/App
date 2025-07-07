"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PerDiemRequestUtils_1 = require("@libs/PerDiemRequestUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReceiptUtils_1 = require("@libs/ReceiptUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TagsOptionsListUtils_1 = require("@libs/TagsOptionsListUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Badge_1 = require("./Badge");
var ConfirmedRoute_1 = require("./ConfirmedRoute");
var MentionReportContext_1 = require("./HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext");
var Expensicons = require("./Icon/Expensicons");
var MenuItem_1 = require("./MenuItem");
var MenuItemWithTopDescription_1 = require("./MenuItemWithTopDescription");
var PDFThumbnail_1 = require("./PDFThumbnail");
var PressableWithoutFocus_1 = require("./Pressable/PressableWithoutFocus");
var ReceiptEmptyState_1 = require("./ReceiptEmptyState");
var ReceiptImage_1 = require("./ReceiptImage");
var ShowContextMenuContext_1 = require("./ShowContextMenuContext");
function MoneyRequestConfirmationListFooter(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var action = _a.action, currency = _a.currency, didConfirm = _a.didConfirm, distance = _a.distance, formattedAmount = _a.formattedAmount, formattedAmountPerAttendee = _a.formattedAmountPerAttendee, formError = _a.formError, hasRoute = _a.hasRoute, iouAttendees = _a.iouAttendees, iouCategory = _a.iouCategory, iouComment = _a.iouComment, iouCreated = _a.iouCreated, iouCurrencyCode = _a.iouCurrencyCode, iouIsBillable = _a.iouIsBillable, iouMerchant = _a.iouMerchant, iouType = _a.iouType, isCategoryRequired = _a.isCategoryRequired, isDistanceRequest = _a.isDistanceRequest, isPerDiemRequest = _a.isPerDiemRequest, isMerchantEmpty = _a.isMerchantEmpty, isMerchantRequired = _a.isMerchantRequired, isPolicyExpenseChat = _a.isPolicyExpenseChat, isReadOnly = _a.isReadOnly, isTypeInvoice = _a.isTypeInvoice, onToggleBillable = _a.onToggleBillable, policy = _a.policy, policyTags = _a.policyTags, policyTagLists = _a.policyTagLists, rate = _a.rate, receiptFilename = _a.receiptFilename, receiptPath = _a.receiptPath, reportActionID = _a.reportActionID, reportID = _a.reportID, selectedParticipants = _a.selectedParticipants, shouldDisplayFieldError = _a.shouldDisplayFieldError, shouldDisplayReceipt = _a.shouldDisplayReceipt, shouldShowCategories = _a.shouldShowCategories, shouldShowMerchant = _a.shouldShowMerchant, shouldShowSmartScanFields = _a.shouldShowSmartScanFields, _o = _a.shouldShowAmountField, shouldShowAmountField = _o === void 0 ? true : _o, shouldShowTax = _a.shouldShowTax, transaction = _a.transaction, transactionID = _a.transactionID, unit = _a.unit, onPDFLoadError = _a.onPDFLoadError, onPDFPassword = _a.onPDFPassword, _p = _a.isReceiptEditable, isReceiptEditable = _p === void 0 ? false : _p;
    var styles = (0, useThemeStyles_1.default)();
    var _q = (0, useLocalize_1.default)(), translate = _q.translate, toLocaleDigit = _q.toLocaleDigit;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0];
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: true })[0];
    var shouldShowTags = (0, react_1.useMemo)(function () { return isPolicyExpenseChat && (0, TagsOptionsListUtils_1.hasEnabledTags)(policyTagLists); }, [isPolicyExpenseChat, policyTagLists]);
    var hasDependentTags = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.hasDependentTags)(policy, policyTags); }, [policy, policyTags]);
    var isMultilevelTags = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isMultiLevelTags)(policyTags); }, [policyTags]);
    var shouldShowAttendees = (0, react_1.useMemo)(function () { return (0, TransactionUtils_1.shouldShowAttendees)(iouType, policy); }, [iouType, policy]);
    var hasPendingWaypoints = transaction && (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction);
    var hasErrors = !(0, EmptyObject_1.isEmptyObject)(transaction === null || transaction === void 0 ? void 0 : transaction.errors) || !(0, EmptyObject_1.isEmptyObject)((_b = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _b === void 0 ? void 0 : _b.route) || !(0, EmptyObject_1.isEmptyObject)((_c = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _c === void 0 ? void 0 : _c.waypoints);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var shouldShowMap = isDistanceRequest && !!(hasErrors || hasPendingWaypoints || iouType !== CONST_1.default.IOU.TYPE.SPLIT || !isReadOnly);
    var senderWorkspace = (0, react_1.useMemo)(function () {
        var senderWorkspaceParticipant = selectedParticipants.find(function (participant) { return participant.isSender; });
        return allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(senderWorkspaceParticipant === null || senderWorkspaceParticipant === void 0 ? void 0 : senderWorkspaceParticipant.policyID)];
    }, [allPolicies, selectedParticipants]);
    var canUpdateSenderWorkspace = (0, react_1.useMemo)(function () {
        var isInvoiceRoomParticipant = selectedParticipants.some(function (participant) { return participant.isInvoiceRoom; });
        return (0, PolicyUtils_1.canSendInvoice)(allPolicies, currentUserLogin) && !!(transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate) && !isInvoiceRoomParticipant;
    }, [allPolicies, currentUserLogin, selectedParticipants, transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate]);
    /**
     * We need to check if the transaction report exists first in order to prevent the outstanding reports from being used.
     * Also we need to check if transaction report exists in outstanding reports in order to show a correct report name.
     */
    var transactionReport = !!(transaction === null || transaction === void 0 ? void 0 : transaction.reportID) && Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).find(function (report) { return (report === null || report === void 0 ? void 0 : report.reportID) === transaction.reportID; });
    var policyID = (_d = selectedParticipants === null || selectedParticipants === void 0 ? void 0 : selectedParticipants.at(0)) === null || _d === void 0 ? void 0 : _d.policyID;
    var reportOwnerAccountID = (_e = selectedParticipants === null || selectedParticipants === void 0 ? void 0 : selectedParticipants.at(0)) === null || _e === void 0 ? void 0 : _e.ownerAccountID;
    var shouldUseTransactionReport = !!transactionReport && (0, ReportUtils_1.isReportOutstanding)(transactionReport, policyID);
    var firstOutstandingReport = (0, ReportUtils_1.getOutstandingReportsForUser)(policyID, reportOwnerAccountID, allReports !== null && allReports !== void 0 ? allReports : {}).at(0);
    var reportName;
    if (shouldUseTransactionReport) {
        reportName = transactionReport.reportName;
    }
    else {
        reportName = firstOutstandingReport === null || firstOutstandingReport === void 0 ? void 0 : firstOutstandingReport.reportName;
    }
    if (!reportName) {
        var optimisticReport = (0, ReportUtils_1.buildOptimisticExpenseReport)(reportID, policy === null || policy === void 0 ? void 0 : policy.id, (_f = policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID, Number(formattedAmount), currency);
        reportName = (0, ReportUtils_1.populateOptimisticReportFormula)((_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _g === void 0 ? void 0 : _g.text_title) === null || _h === void 0 ? void 0 : _h.defaultValue) !== null && _j !== void 0 ? _j : '', optimisticReport, policy);
    }
    var shouldReportBeEditable = !!firstOutstandingReport;
    var isTypeSend = iouType === CONST_1.default.IOU.TYPE.PAY;
    var taxRates = (_k = policy === null || policy === void 0 ? void 0 : policy.taxRates) !== null && _k !== void 0 ? _k : null;
    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    var shouldShowDate = (shouldShowSmartScanFields || isDistanceRequest) && !isTypeSend;
    // Determines whether the tax fields can be modified.
    // The tax fields can only be modified if the component is not in read-only mode
    // and it is not a distance request.
    var canModifyTaxFields = !isReadOnly && !isDistanceRequest && !isPerDiemRequest;
    // A flag for showing the billable field
    var shouldShowBillable = ((_l = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _l === void 0 ? void 0 : _l.defaultBillable) === false;
    // Calculate the formatted tax amount based on the transaction's tax amount and the IOU currency code
    var taxAmount = (0, TransactionUtils_1.getTaxAmount)(transaction, false);
    var formattedTaxAmount = (0, CurrencyUtils_1.convertToDisplayString)(taxAmount, iouCurrencyCode);
    // Get the tax rate title based on the policy and transaction
    var taxRateTitle = (0, TransactionUtils_1.getTaxName)(policy, transaction);
    // Determine if the merchant error should be displayed
    var shouldDisplayMerchantError = isMerchantRequired && (shouldDisplayFieldError || formError === 'iou.error.invalidMerchant') && isMerchantEmpty;
    var shouldDisplayDistanceRateError = formError === 'iou.error.invalidRate';
    // The empty receipt component should only show for IOU Requests of a paid policy ("Team" or "Corporate")
    var shouldShowReceiptEmptyState = iouType === CONST_1.default.IOU.TYPE.SUBMIT && (0, PolicyUtils_1.isPaidGroupPolicy)(policy) && !isPerDiemRequest;
    // The per diem custom unit
    var perDiemCustomUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var _r = receiptPath && receiptFilename ? (0, ReceiptUtils_1.getThumbnailAndImageURIs)(transaction, receiptPath, receiptFilename) : {}, receiptImage = _r.image, receiptThumbnail = _r.thumbnail, isThumbnail = _r.isThumbnail, fileExtension = _r.fileExtension, isLocalFile = _r.isLocalFile;
    var resolvedThumbnail = isLocalFile ? receiptThumbnail : (0, tryResolveUrlFromApiRoot_1.default)(receiptThumbnail !== null && receiptThumbnail !== void 0 ? receiptThumbnail : '');
    var resolvedReceiptImage = isLocalFile ? receiptImage : (0, tryResolveUrlFromApiRoot_1.default)(receiptImage !== null && receiptImage !== void 0 ? receiptImage : '');
    var contextMenuContextValue = (0, react_1.useMemo)(function () { return ({
        anchor: null,
        report: undefined,
        isReportArchived: false,
        action: undefined,
        checkIfContextMenuActive: function () { },
        onShowContextMenu: function () { },
        isDisabled: true,
        shouldDisplayContextMenu: false,
    }); }, []);
    var tagVisibility = policyTagLists.map(function (_a, index) {
        var tags = _a.tags, required = _a.required;
        var isTagRequired = required !== null && required !== void 0 ? required : false;
        var shouldShow = false;
        if (shouldShowTags) {
            if (hasDependentTags) {
                if (index === 0) {
                    shouldShow = true;
                }
                else {
                    var prevTagValue = (0, TransactionUtils_1.getTagForDisplay)(transaction, index - 1);
                    shouldShow = !!prevTagValue;
                }
            }
            else {
                shouldShow = !isMultilevelTags || (0, OptionsListUtils_1.hasEnabledOptions)(tags);
            }
        }
        return {
            isTagRequired: isTagRequired,
            shouldShow: shouldShow,
        };
    });
    var previousTagsVisibility = (_m = (0, usePrevious_1.default)(tagVisibility.map(function (v) { return v.shouldShow; }))) !== null && _m !== void 0 ? _m : [];
    var mentionReportContextValue = (0, react_1.useMemo)(function () { return ({ currentReportID: reportID, exactlyMatch: true }); }, [reportID]);
    var fields = __spreadArray(__spreadArray([
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('iou.amount')} shouldShowRightIcon={!isReadOnly && !isDistanceRequest} title={formattedAmount} description={translate('iou.amount')} interactive={!isReadOnly} onPress={function () {
                    if (isDistanceRequest || !transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_AMOUNT.getRoute(action, iouType, transactionID, reportID, CONST_1.default.IOU.PAGE_INDEX.CONFIRM, Navigation_1.default.getActiveRoute()));
                }} style={[styles.moneyRequestMenuItem, styles.mt2]} titleStyle={styles.moneyRequestConfirmationAmount} disabled={didConfirm} brickRoadIndicator={shouldDisplayFieldError && (0, TransactionUtils_1.isAmountMissing)(transaction) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={shouldDisplayFieldError && (0, TransactionUtils_1.isAmountMissing)(transaction) ? translate('common.error.enterAmount') : ''}/>),
            shouldShow: shouldShowSmartScanFields && shouldShowAmountField,
        },
        {
            item: (<react_native_1.View key={translate('common.description')}>
                    <ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextMenuContextValue}>
                        <MentionReportContext_1.default.Provider value={mentionReportContextValue}>
                            <MenuItemWithTopDescription_1.default shouldShowRightIcon={!isReadOnly} shouldParseTitle excludedMarkdownRules={!policy ? ['reportMentions'] : []} title={iouComment} description={translate('common.description')} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute(), reportActionID));
                }} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} disabled={didConfirm} interactive={!isReadOnly} numberOfLinesTitle={2}/>
                        </MentionReportContext_1.default.Provider>
                    </ShowContextMenuContext_1.ShowContextMenuContext.Provider>
                </react_native_1.View>),
            shouldShow: true,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('common.distance')} shouldShowRightIcon={!isReadOnly} title={DistanceRequestUtils_1.default.getDistanceForDisplay(hasRoute, distance, unit, rate, translate)} description={translate('common.distance')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} disabled={didConfirm} interactive={!isReadOnly}/>),
            shouldShow: isDistanceRequest,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('common.rate')} shouldShowRightIcon={!!rate && !isReadOnly && isPolicyExpenseChat} title={DistanceRequestUtils_1.default.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline)} description={translate('common.rate')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} brickRoadIndicator={shouldDisplayDistanceRateError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} disabled={didConfirm} interactive={!!rate && !isReadOnly && isPolicyExpenseChat}/>),
            shouldShow: isDistanceRequest,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('common.merchant')} shouldShowRightIcon={!isReadOnly} title={isMerchantEmpty ? '' : iouMerchant} description={translate('common.merchant')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} disabled={didConfirm} interactive={!isReadOnly} brickRoadIndicator={shouldDisplayMerchantError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={shouldDisplayMerchantError ? translate('common.error.fieldRequired') : ''} rightLabel={isMerchantRequired && !shouldDisplayMerchantError ? translate('common.required') : ''} numberOfLinesTitle={2}/>),
            shouldShow: shouldShowMerchant,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('common.category')} shouldShowRightIcon={!isReadOnly} title={iouCategory} description={translate('common.category')} numberOfLinesTitle={2} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute(), reportActionID));
                }} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} disabled={didConfirm} interactive={!isReadOnly} rightLabel={isCategoryRequired ? translate('common.required') : ''}/>),
            shouldShow: shouldShowCategories,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('common.date')} shouldShowRightIcon={!isReadOnly} 
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            title={iouCreated || (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING)} description={translate('common.date')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute(), reportActionID));
                }} disabled={didConfirm} interactive={!isReadOnly} brickRoadIndicator={shouldDisplayFieldError && (0, TransactionUtils_1.isCreatedMissing)(transaction) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={shouldDisplayFieldError && (0, TransactionUtils_1.isCreatedMissing)(transaction) ? translate('common.error.enterDate') : ''}/>),
            shouldShow: shouldShowDate,
        }
    ], policyTagLists.map(function (_a, index) {
        var _b, _c, _d;
        var name = _a.name;
        var tagVisibilityItem = tagVisibility.at(index);
        var isTagRequired = (_b = tagVisibilityItem === null || tagVisibilityItem === void 0 ? void 0 : tagVisibilityItem.isTagRequired) !== null && _b !== void 0 ? _b : false;
        var shouldShow = (_c = tagVisibilityItem === null || tagVisibilityItem === void 0 ? void 0 : tagVisibilityItem.shouldShow) !== null && _c !== void 0 ? _c : false;
        var prevShouldShow = (_d = previousTagsVisibility.at(index)) !== null && _d !== void 0 ? _d : false;
        return {
            item: (<MenuItemWithTopDescription_1.default highlighted={shouldShow && !(0, TransactionUtils_1.getTagForDisplay)(transaction, index) && !prevShouldShow} key={name} shouldShowRightIcon={!isReadOnly} title={(0, TransactionUtils_1.getTagForDisplay)(transaction, index)} description={name} shouldShowBasicTitle shouldShowDescriptionOnTop numberOfLinesTitle={2} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, index, transactionID, reportID, Navigation_1.default.getActiveRoute(), reportActionID));
                }} style={[styles.moneyRequestMenuItem]} disabled={didConfirm} interactive={!isReadOnly} rightLabel={isTagRequired ? translate('common.required') : ''}/>),
            shouldShow: shouldShow,
        };
    }), true), [
        {
            item: (<MenuItemWithTopDescription_1.default key={"".concat(taxRates === null || taxRates === void 0 ? void 0 : taxRates.name).concat(taxRateTitle)} shouldShowRightIcon={canModifyTaxFields} title={taxRateTitle} description={taxRates === null || taxRates === void 0 ? void 0 : taxRates.name} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} disabled={didConfirm} interactive={canModifyTaxFields}/>),
            shouldShow: shouldShowTax,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={"".concat(taxRates === null || taxRates === void 0 ? void 0 : taxRates.name).concat(formattedTaxAmount)} shouldShowRightIcon={canModifyTaxFields} title={formattedTaxAmount} description={translate('iou.taxAmount')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} disabled={didConfirm} interactive={canModifyTaxFields}/>),
            shouldShow: shouldShowTax,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key="attendees" shouldShowRightIcon title={iouAttendees === null || iouAttendees === void 0 ? void 0 : iouAttendees.map(function (item) { var _a; return (_a = item === null || item === void 0 ? void 0 : item.displayName) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.login; }).join(', ')} description={"".concat(translate('iou.attendees'), " ").concat((iouAttendees === null || iouAttendees === void 0 ? void 0 : iouAttendees.length) && iouAttendees.length > 1 && formattedAmountPerAttendee ? "\u00B7 ".concat(formattedAmountPerAttendee, " ").concat(translate('common.perPerson')) : '')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_ATTENDEE.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} interactive shouldRenderAsHTML/>),
            shouldShow: shouldShowAttendees,
        },
        {
            item: (<react_native_1.View key={translate('common.billable')} style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                    <ToggleSettingsOptionRow_1.default switchAccessibilityLabel={translate('common.billable')} title={translate('common.billable')} onToggle={function (isOn) { return onToggleBillable === null || onToggleBillable === void 0 ? void 0 : onToggleBillable(isOn); }} isActive={iouIsBillable} disabled={isReadOnly} wrapperStyle={styles.flex1}/>
                </react_native_1.View>),
            shouldShow: shouldShowBillable,
        },
        {
            item: (<MenuItemWithTopDescription_1.default key={translate('common.report')} shouldShowRightIcon={shouldReportBeEditable} title={reportName} description={translate('common.report')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                    if (!transactionID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_REPORT.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                }} interactive={shouldReportBeEditable} shouldRenderAsHTML/>),
            shouldShow: isPolicyExpenseChat,
        },
    ], false);
    var subRates = (0, PerDiemRequestUtils_1.getSubratesFields)(perDiemCustomUnit, transaction);
    var shouldDisplaySubrateError = isPerDiemRequest && (shouldDisplayFieldError || formError === 'iou.error.invalidSubrateLength') && (subRates.length === 0 || (subRates.length === 1 && !subRates.at(0)));
    var subRateFields = subRates.map(function (field, index) {
        var _a;
        return (<MenuItemWithTopDescription_1.default key={"".concat(translate('common.subrate')).concat((_a = field === null || field === void 0 ? void 0 : field.key) !== null && _a !== void 0 ? _a : index)} shouldShowRightIcon={!isReadOnly} title={(0, PerDiemRequestUtils_1.getSubratesForDisplay)(field, translate('iou.qty'))} description={translate('common.subrate')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                if (!transactionID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SUBRATE_EDIT.getRoute(action, iouType, transactionID, reportID, index, Navigation_1.default.getActiveRoute()));
            }} disabled={didConfirm} interactive={!isReadOnly} brickRoadIndicator={index === 0 && shouldDisplaySubrateError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={index === 0 && shouldDisplaySubrateError ? translate('common.error.fieldRequired') : ''}/>);
    });
    var _s = (0, PerDiemRequestUtils_1.getTimeDifferenceIntervals)(transaction), firstDay = _s.firstDay, tripDays = _s.tripDays, lastDay = _s.lastDay;
    var badgeElements = (0, react_1.useMemo)(function () {
        var badges = [];
        if (firstDay) {
            badges.push(<Badge_1.default key="firstDay" icon={Expensicons.Stopwatch} text={translate('iou.firstDayText', { count: firstDay })}/>);
        }
        if (tripDays) {
            badges.push(<Badge_1.default key="tripDays" icon={Expensicons.CalendarSolid} text={translate('iou.tripLengthText', { count: tripDays })}/>);
        }
        if (lastDay) {
            badges.push(<Badge_1.default key="lastDay" icon={Expensicons.Stopwatch} text={translate('iou.lastDayText', { count: lastDay })}/>);
        }
        return badges;
    }, [firstDay, lastDay, translate, tripDays]);
    var receiptThumbnailContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.moneyRequestImage, styles.expenseViewImageSmall]}>
                {isLocalFile && expensify_common_1.Str.isPDF(receiptFilename) ? (<PressableWithoutFocus_1.default onPress={function () {
                if (!transactionID) {
                    return;
                }
                Navigation_1.default.navigate(isReceiptEditable
                    ? ROUTES_1.default.TRANSACTION_RECEIPT.getRoute(reportID, transactionID, undefined, undefined, action, iouType)
                    : ROUTES_1.default.TRANSACTION_RECEIPT.getRoute(reportID, transactionID));
            }} accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('accessibilityHints.viewAttachment')} disabled={!shouldDisplayReceipt} disabledStyle={styles.cursorDefault}>
                        <PDFThumbnail_1.default 
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        previewSourceURL={resolvedReceiptImage} onLoadError={onPDFLoadError} onPassword={onPDFPassword}/>
                    </PressableWithoutFocus_1.default>) : (<PressableWithoutFocus_1.default onPress={function () {
                if (!transactionID) {
                    return;
                }
                Navigation_1.default.navigate(isReceiptEditable
                    ? ROUTES_1.default.TRANSACTION_RECEIPT.getRoute(reportID, transactionID, undefined, undefined, action, iouType)
                    : ROUTES_1.default.TRANSACTION_RECEIPT.getRoute(reportID, transactionID));
            }} disabled={!shouldDisplayReceipt || isThumbnail} accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('accessibilityHints.viewAttachment')} disabledStyle={styles.cursorDefault} style={[styles.h100, styles.flex1]}>
                        <ReceiptImage_1.default isThumbnail={isThumbnail} 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source={resolvedThumbnail || resolvedReceiptImage || ''} 
        // AuthToken is required when retrieving the image from the server
        // but we don't need it to load the blob:// or file:// image when starting an expense/split
        // So if we have a thumbnail, it means we're retrieving the image from the server
        isAuthTokenRequired={!!receiptThumbnail && !isLocalFile} fileExtension={fileExtension} shouldUseThumbnailImage shouldUseInitialObjectPosition={isDistanceRequest}/>
                    </PressableWithoutFocus_1.default>)}
            </react_native_1.View>); }, [
        styles.moneyRequestImage,
        styles.expenseViewImageSmall,
        styles.cursorDefault,
        styles.h100,
        styles.flex1,
        isLocalFile,
        receiptFilename,
        translate,
        shouldDisplayReceipt,
        resolvedReceiptImage,
        onPDFLoadError,
        onPDFPassword,
        isThumbnail,
        resolvedThumbnail,
        receiptThumbnail,
        fileExtension,
        isDistanceRequest,
        transactionID,
        action,
        iouType,
        reportID,
        isReceiptEditable,
    ]);
    return (<>
            {isTypeInvoice && (<MenuItem_1.default key={translate('workspace.invoices.sendFrom')} avatarID={senderWorkspace === null || senderWorkspace === void 0 ? void 0 : senderWorkspace.id} shouldShowRightIcon={!isReadOnly && canUpdateSenderWorkspace} title={senderWorkspace === null || senderWorkspace === void 0 ? void 0 : senderWorkspace.name} icon={(senderWorkspace === null || senderWorkspace === void 0 ? void 0 : senderWorkspace.avatarURL) ? senderWorkspace === null || senderWorkspace === void 0 ? void 0 : senderWorkspace.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(senderWorkspace === null || senderWorkspace === void 0 ? void 0 : senderWorkspace.name)} iconType={CONST_1.default.ICON_TYPE_WORKSPACE} description={translate('workspace.common.workspace')} label={translate('workspace.invoices.sendFrom')} isLabelHoverable={false} interactive={!isReadOnly && canUpdateSenderWorkspace} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SEND_FROM.getRoute(iouType, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, reportID, Navigation_1.default.getActiveRoute()));
            }} style={styles.moneyRequestMenuItem} labelStyle={styles.mt2} titleStyle={styles.flex1} disabled={didConfirm}/>)}
            {shouldShowMap && (<react_native_1.View style={styles.confirmationListMapItem}>
                    <ConfirmedRoute_1.default transaction={transaction !== null && transaction !== void 0 ? transaction : {}}/>
                </react_native_1.View>)}
            {isPerDiemRequest && action !== CONST_1.default.IOU.ACTION.SUBMIT && (<>
                    <MenuItemWithTopDescription_1.default shouldShowRightIcon={!isReadOnly} title={(0, PerDiemRequestUtils_1.getDestinationForDisplay)(perDiemCustomUnit, transaction)} description={translate('common.destination')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                if (!transactionID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DESTINATION_EDIT.getRoute(action, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
            }} disabled={didConfirm} interactive={!isReadOnly}/>
                    <react_native_1.View style={styles.dividerLine}/>
                    <MenuItemWithTopDescription_1.default shouldShowRightIcon={!isReadOnly} title={(0, PerDiemRequestUtils_1.getTimeForDisplay)(transaction)} description={translate('iou.time')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                if (!transactionID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TIME_EDIT.getRoute(action, iouType, transactionID, reportID));
            }} disabled={didConfirm} interactive={!isReadOnly} numberOfLinesTitle={2}/>
                    <react_native_1.View style={[styles.flexRow, styles.gap1, styles.justifyContentStart, styles.mh3, styles.flexWrap, styles.pt1]}>{badgeElements}</react_native_1.View>
                    <react_native_1.View style={styles.dividerLine}/>
                    {subRateFields}
                    <react_native_1.View style={styles.dividerLine}/>
                </>)}
            {!shouldShowMap && (<react_native_1.View style={styles.mv3}>
                    {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            receiptImage || receiptThumbnail
                ? receiptThumbnailContent
                : shouldShowReceiptEmptyState && (<ReceiptEmptyState_1.default onPress={function () {
                        if (!transactionID) {
                            return;
                        }
                        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation_1.default.getActiveRoute()));
                    }} style={styles.expenseViewImageSmall}/>)}
                </react_native_1.View>)}
            <react_native_1.View style={[styles.mb5]}>{fields.filter(function (field) { return field.shouldShow; }).map(function (field) { return field.item; })}</react_native_1.View>
        </>);
}
MoneyRequestConfirmationListFooter.displayName = 'MoneyRequestConfirmationListFooter';
exports.default = (0, react_1.memo)(MoneyRequestConfirmationListFooter, function (prevProps, nextProps) {
    return (0, fast_equals_1.deepEqual)(prevProps.action, nextProps.action) &&
        prevProps.currency === nextProps.currency &&
        prevProps.didConfirm === nextProps.didConfirm &&
        prevProps.distance === nextProps.distance &&
        prevProps.formattedAmount === nextProps.formattedAmount &&
        prevProps.formError === nextProps.formError &&
        prevProps.hasRoute === nextProps.hasRoute &&
        prevProps.iouCategory === nextProps.iouCategory &&
        prevProps.iouComment === nextProps.iouComment &&
        prevProps.iouCreated === nextProps.iouCreated &&
        prevProps.iouCurrencyCode === nextProps.iouCurrencyCode &&
        prevProps.iouIsBillable === nextProps.iouIsBillable &&
        prevProps.iouMerchant === nextProps.iouMerchant &&
        prevProps.iouType === nextProps.iouType &&
        prevProps.isCategoryRequired === nextProps.isCategoryRequired &&
        prevProps.isDistanceRequest === nextProps.isDistanceRequest &&
        prevProps.isMerchantEmpty === nextProps.isMerchantEmpty &&
        prevProps.isMerchantRequired === nextProps.isMerchantRequired &&
        prevProps.isPolicyExpenseChat === nextProps.isPolicyExpenseChat &&
        prevProps.isReadOnly === nextProps.isReadOnly &&
        prevProps.isTypeInvoice === nextProps.isTypeInvoice &&
        prevProps.onToggleBillable === nextProps.onToggleBillable &&
        (0, fast_equals_1.deepEqual)(prevProps.policy, nextProps.policy) &&
        (0, fast_equals_1.deepEqual)(prevProps.policyTagLists, nextProps.policyTagLists) &&
        prevProps.rate === nextProps.rate &&
        prevProps.receiptFilename === nextProps.receiptFilename &&
        prevProps.receiptPath === nextProps.receiptPath &&
        prevProps.reportActionID === nextProps.reportActionID &&
        prevProps.reportID === nextProps.reportID &&
        (0, fast_equals_1.deepEqual)(prevProps.selectedParticipants, nextProps.selectedParticipants) &&
        prevProps.shouldDisplayFieldError === nextProps.shouldDisplayFieldError &&
        prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt &&
        prevProps.shouldShowCategories === nextProps.shouldShowCategories &&
        prevProps.shouldShowMerchant === nextProps.shouldShowMerchant &&
        prevProps.shouldShowSmartScanFields === nextProps.shouldShowSmartScanFields &&
        prevProps.shouldShowTax === nextProps.shouldShowTax &&
        (0, fast_equals_1.deepEqual)(prevProps.transaction, nextProps.transaction) &&
        prevProps.transactionID === nextProps.transactionID &&
        prevProps.unit === nextProps.unit;
});
