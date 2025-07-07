"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var flash_list_1 = require("@shopify/flash-list");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var LottieAnimations_1 = require("@components/LottieAnimations");
var ScrollOffsetContextProvider_1 = require("@components/ScrollOffsetContextProvider");
var TextBlock_1 = require("@components/TextBlock");
var useLHNEstimatedListSize_1 = require("@hooks/useLHNEstimatedListSize");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useRootNavigationState_1 = require("@hooks/useRootNavigationState");
var useScrollEventEmitter_1 = require("@hooks/useScrollEventEmitter");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DraftCommentUtils_1 = require("@libs/DraftCommentUtils");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TooltipUtils_1 = require("@libs/TooltipUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var OptionRowLHNData_1 = require("./OptionRowLHNData");
var OptionRowRendererComponent_1 = require("./OptionRowRendererComponent");
var keyExtractor = function (item) { return "report_".concat(item.reportID); };
function LHNOptionsList(_a) {
    var style = _a.style, contentContainerStyles = _a.contentContainerStyles, data = _a.data, onSelectRow = _a.onSelectRow, optionMode = _a.optionMode, _b = _a.shouldDisableFocusOptions, shouldDisableFocusOptions = _b === void 0 ? false : _b, _c = _a.onFirstItemRendered, onFirstItemRendered = _c === void 0 ? function () { } : _c;
    var _d = (0, react_1.useContext)(ScrollOffsetContextProvider_1.ScrollOffsetContext), saveScrollOffset = _d.saveScrollOffset, getScrollOffset = _d.getScrollOffset, saveScrollIndex = _d.saveScrollIndex, getScrollIndex = _d.getScrollIndex;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var flashListRef = (0, react_1.useRef)(null);
    var route = (0, native_1.useRoute)();
    var isScreenFocused = (0, native_1.useIsFocused)();
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var reportAttributes = (0, useOnyx_1.default)(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES, { selector: function (attributes) { return attributes === null || attributes === void 0 ? void 0 : attributes.reports; }, canBeMissing: false })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, { canBeMissing: true })[0];
    var reportActions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, { canBeMissing: false })[0];
    var policy = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var transactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, { canBeMissing: false })[0];
    var draftComments = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT, { canBeMissing: false })[0];
    var transactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: false })[0];
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, { canBeMissing: true }), dismissedProductTraining = _e[0], dismissedProductTrainingMetadata = _e[1];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: true })[0];
    var isFullscreenVisible = (0, useOnyx_1.default)(ONYXKEYS_1.default.FULLSCREEN_VISIBILITY, { canBeMissing: true })[0];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _f = (0, useLocalize_1.default)(), translate = _f.translate, preferredLocale = _f.preferredLocale;
    var estimatedListSize = (0, useLHNEstimatedListSize_1.default)();
    var isReportsSplitNavigatorLast = (0, useRootNavigationState_1.default)(function (state) { var _a, _b; return ((_b = (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0 ? void 0 : _a.at(-1)) === null || _b === void 0 ? void 0 : _b.name) === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR; });
    var shouldShowEmptyLHN = data.length === 0;
    var estimatedItemSize = optionMode === CONST_1.default.OPTION_MODE.COMPACT ? variables_1.default.optionRowHeightCompact : variables_1.default.optionRowHeight;
    var platform = (0, getPlatform_1.default)();
    var isWebOrDesktop = platform === CONST_1.default.PLATFORM.WEB || platform === CONST_1.default.PLATFORM.DESKTOP;
    var isGBRorRBRTooltipDismissed = !(0, isLoadingOnyxValue_1.default)(dismissedProductTrainingMetadata) && (0, TooltipUtils_1.default)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.GBR_RBR_CHAT, dismissedProductTraining);
    var firstReportIDWithGBRorRBR = (0, react_1.useMemo)(function () {
        if (isGBRorRBRTooltipDismissed) {
            return undefined;
        }
        var firstReportWithGBRorRBR = data.find(function (report) {
            var _a, _b;
            var itemReportErrors = (_a = reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes[report.reportID]) === null || _a === void 0 ? void 0 : _a.reportErrors;
            if (!report) {
                return false;
            }
            if (!(0, EmptyObject_1.isEmptyObject)(itemReportErrors)) {
                return true;
            }
            var hasGBR = (_b = reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes[report.reportID]) === null || _b === void 0 ? void 0 : _b.requiresAttention;
            return hasGBR;
        });
        return firstReportWithGBRorRBR === null || firstReportWithGBRorRBR === void 0 ? void 0 : firstReportWithGBRorRBR.reportID;
    }, [isGBRorRBRTooltipDismissed, data, reportAttributes]);
    // When the first item renders we want to call the onFirstItemRendered callback.
    // At this point in time we know that the list is actually displaying items.
    var hasCalledOnLayout = react_1.default.useRef(false);
    var onLayoutItem = (0, react_1.useCallback)(function () {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;
        onFirstItemRendered();
    }, [onFirstItemRendered]);
    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    var triggerScrollEvent = (0, useScrollEventEmitter_1.default)();
    var emptyLHNSubtitle = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter]}>
                <TextBlock_1.default color={theme.textSupporting} textStyles={[styles.textAlignCenter, styles.textNormal]} text={translate('common.emptyLHN.subtitleText1')}/>
                <Icon_1.default src={Expensicons.MagnifyingGlass} width={variables_1.default.emptyLHNIconWidth} height={variables_1.default.emptyLHNIconHeight} fill={theme.icon} small additionalStyles={styles.mh1}/>
                <TextBlock_1.default color={theme.textSupporting} textStyles={[styles.textAlignCenter, styles.textNormal]} text={translate('common.emptyLHN.subtitleText2')}/>
                <Icon_1.default src={Expensicons.Plus} width={variables_1.default.emptyLHNIconWidth} height={variables_1.default.emptyLHNIconHeight} fill={theme.icon} small additionalStyles={styles.mh1}/>
                <TextBlock_1.default color={theme.textSupporting} textStyles={[styles.textAlignCenter, styles.textNormal]} text={translate('common.emptyLHN.subtitleText3')}/>
            </react_native_1.View>); }, [
        styles.alignItemsCenter,
        styles.flexRow,
        styles.justifyContentCenter,
        styles.flexWrap,
        styles.textAlignCenter,
        styles.mh1,
        theme.icon,
        theme.textSupporting,
        styles.textNormal,
        translate,
    ]);
    /**
     * Function which renders a row in the list
     */
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var _b, _c, _d, _e, _f, _g;
        var item = _a.item;
        var reportID = item.reportID;
        var itemParentReport = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.parentReportID)];
        var itemReportNameValuePairs = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID)];
        var chatReport = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.chatReportID)];
        var itemReportActions = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)];
        var itemOneTransactionThreadReport = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((0, ReportActionsUtils_1.getOneTransactionThreadReportID)(item, chatReport, itemReportActions, isOffline))];
        var itemParentReportActions = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(item === null || item === void 0 ? void 0 : item.parentReportID)];
        var itemParentReportAction = (item === null || item === void 0 ? void 0 : item.parentReportActionID) ? itemParentReportActions === null || itemParentReportActions === void 0 ? void 0 : itemParentReportActions[item === null || item === void 0 ? void 0 : item.parentReportActionID] : undefined;
        var itemReportAttributes = reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes[reportID];
        var invoiceReceiverPolicyID = '-1';
        if ((item === null || item === void 0 ? void 0 : item.invoiceReceiver) && 'policyID' in item.invoiceReceiver) {
            invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
        }
        if ((itemParentReport === null || itemParentReport === void 0 ? void 0 : itemParentReport.invoiceReceiver) && 'policyID' in itemParentReport.invoiceReceiver) {
            invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
        }
        var itemInvoiceReceiverPolicy = policy === null || policy === void 0 ? void 0 : policy["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(invoiceReceiverPolicyID)];
        var iouReportIDOfLastAction = (0, OptionsListUtils_1.getIOUReportIDOfLastAction)(item);
        var itemIouReportReportActions = iouReportIDOfLastAction ? reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReportIDOfLastAction)] : undefined;
        var itemPolicy = policy === null || policy === void 0 ? void 0 : policy["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(item === null || item === void 0 ? void 0 : item.policyID)];
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(itemParentReportAction)
            ? ((_c = (_b = (0, ReportActionsUtils_1.getOriginalMessage)(itemParentReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID)
            : CONST_1.default.DEFAULT_NUMBER_ID;
        var itemTransaction = transactions === null || transactions === void 0 ? void 0 : transactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
        var hasDraftComment = (0, DraftCommentUtils_1.isValidDraftComment)(draftComments === null || draftComments === void 0 ? void 0 : draftComments["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID)]);
        var canUserPerformWrite = (0, ReportUtils_1.canUserPerformWriteAction)(item);
        var sortedReportActions = (0, ReportActionsUtils_1.getSortedReportActionsForDisplay)(itemReportActions, canUserPerformWrite);
        var lastReportAction = sortedReportActions.at(0);
        // Get the transaction for the last report action
        var lastReportActionTransactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(lastReportAction)
            ? ((_e = (_d = (0, ReportActionsUtils_1.getOriginalMessage)(lastReportAction)) === null || _d === void 0 ? void 0 : _d.IOUTransactionID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID)
            : CONST_1.default.DEFAULT_NUMBER_ID;
        var lastReportActionTransaction = transactions === null || transactions === void 0 ? void 0 : transactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(lastReportActionTransactionID)];
        // SidebarUtils.getOptionData in OptionRowLHNData does not get re-evaluated when the linked task report changes, so we have the lastMessageTextFromReport evaluation logic here
        var lastActorDetails = (item === null || item === void 0 ? void 0 : item.lastActorAccountID) && (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[item.lastActorAccountID]) ? personalDetails[item.lastActorAccountID] : null;
        if (!lastActorDetails && lastReportAction) {
            var lastActorDisplayName = (_g = (_f = lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.person) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.text;
            lastActorDetails = lastActorDisplayName
                ? {
                    displayName: lastActorDisplayName,
                    accountID: item === null || item === void 0 ? void 0 : item.lastActorAccountID,
                }
                : null;
        }
        var lastMessageTextFromReport = (0, OptionsListUtils_1.getLastMessageTextForReport)(item, lastActorDetails, itemPolicy, !!(itemReportNameValuePairs === null || itemReportNameValuePairs === void 0 ? void 0 : itemReportNameValuePairs.private_isArchived));
        var shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;
        return (<OptionRowLHNData_1.default reportID={reportID} fullReport={item} reportAttributes={itemReportAttributes} oneTransactionThreadReport={itemOneTransactionThreadReport} reportNameValuePairs={itemReportNameValuePairs} reportActions={itemReportActions} parentReportAction={itemParentReportAction} iouReportReportActions={itemIouReportReportActions} policy={itemPolicy} invoiceReceiverPolicy={itemInvoiceReceiverPolicy} personalDetails={personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}} transaction={itemTransaction} lastReportActionTransaction={lastReportActionTransaction} receiptTransactions={transactions} viewMode={optionMode} isOptionFocused={!shouldDisableFocusOptions} lastMessageTextFromReport={lastMessageTextFromReport} onSelectRow={onSelectRow} preferredLocale={preferredLocale} hasDraftComment={hasDraftComment} transactionViolations={transactionViolations} onLayout={onLayoutItem} shouldShowRBRorGBRTooltip={shouldShowRBRorGBRTooltip} activePolicyID={activePolicyID} onboardingPurpose={introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice} isFullscreenVisible={isFullscreenVisible} isReportsSplitNavigatorLast={isReportsSplitNavigatorLast} isScreenFocused={isScreenFocused}/>);
    }, [
        draftComments,
        onSelectRow,
        optionMode,
        personalDetails,
        policy,
        preferredLocale,
        reportActions,
        reports,
        reportAttributes,
        reportNameValuePairs,
        shouldDisableFocusOptions,
        transactions,
        transactionViolations,
        onLayoutItem,
        isOffline,
        firstReportIDWithGBRorRBR,
        activePolicyID,
        introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice,
        isFullscreenVisible,
        isReportsSplitNavigatorLast,
        isScreenFocused,
    ]);
    var extraData = (0, react_1.useMemo)(function () { return [
        reportActions,
        reports,
        reportAttributes,
        reportNameValuePairs,
        transactionViolations,
        policy,
        personalDetails,
        data.length,
        draftComments,
        optionMode,
        preferredLocale,
        transactions,
        isOffline,
        isScreenFocused,
        isReportsSplitNavigatorLast,
    ]; }, [
        reportActions,
        reports,
        reportAttributes,
        reportNameValuePairs,
        transactionViolations,
        policy,
        personalDetails,
        data.length,
        draftComments,
        optionMode,
        preferredLocale,
        transactions,
        isOffline,
        isScreenFocused,
        isReportsSplitNavigatorLast,
    ]);
    var previousOptionMode = (0, usePrevious_1.default)(optionMode);
    (0, react_1.useEffect)(function () {
        if (previousOptionMode === null || previousOptionMode === optionMode || !flashListRef.current) {
            return;
        }
        if (!flashListRef.current) {
            return;
        }
        // If the option mode changes want to scroll to the top of the list because rendered items will have different height.
        flashListRef.current.scrollToOffset({ offset: 0 });
    }, [previousOptionMode, optionMode]);
    var onScroll = (0, react_1.useCallback)(function (e) {
        // If the layout measurement is 0, it means the FlashList is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        if (isWebOrDesktop) {
            saveScrollIndex(route, Math.floor(e.nativeEvent.contentOffset.y / estimatedItemSize));
        }
        triggerScrollEvent();
    }, [estimatedItemSize, isWebOrDesktop, route, saveScrollIndex, saveScrollOffset, triggerScrollEvent]);
    var onLayout = (0, react_1.useCallback)(function () {
        var offset = getScrollOffset(route);
        if (!(offset && flashListRef.current) || isWebOrDesktop) {
            return;
        }
        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(function () {
            if (!(offset && flashListRef.current)) {
                return;
            }
            flashListRef.current.scrollToOffset({ offset: offset });
        });
    }, [getScrollOffset, route, isWebOrDesktop]);
    // eslint-disable-next-line rulesdir/prefer-early-return
    (0, react_1.useEffect)(function () {
        if (shouldShowEmptyLHN) {
            Log_1.default.info('Woohoo! All caught up. Was rendered', false, {
                reportsCount: Object.keys(reports !== null && reports !== void 0 ? reports : {}).length,
                reportActionsCount: Object.keys(reportActions !== null && reportActions !== void 0 ? reportActions : {}).length,
                policyCount: Object.keys(policy !== null && policy !== void 0 ? policy : {}).length,
                personalDetailsCount: Object.keys(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).length,
                route: route,
                reportsIDsFromUseReportsCount: data.length,
            });
        }
    }, [data, shouldShowEmptyLHN, route, reports, reportActions, policy, personalDetails]);
    return (<react_native_1.View style={[style !== null && style !== void 0 ? style : styles.flex1, shouldShowEmptyLHN ? styles.emptyLHNWrapper : undefined]}>
            {shouldShowEmptyLHN ? (<BlockingView_1.default animation={LottieAnimations_1.default.Fireworks} animationStyles={styles.emptyLHNAnimation} animationWebStyle={styles.emptyLHNAnimation} title={translate('common.emptyLHN.title')} shouldShowLink={false} CustomSubtitle={emptyLHNSubtitle} accessibilityLabel={translate('common.emptyLHN.title')}/>) : (<flash_list_1.FlashList ref={flashListRef} indicatorStyle="white" keyboardShouldPersistTaps="always" CellRendererComponent={OptionRowRendererComponent_1.default} contentContainerStyle={react_native_1.StyleSheet.flatten(contentContainerStyles)} data={data} testID="lhn-options-list" keyExtractor={keyExtractor} renderItem={renderItem} estimatedItemSize={estimatedItemSize} overrideProps={{ estimatedHeightSize: estimatedItemSize * CONST_1.default.LHN_VIEWPORT_ITEM_COUNT }} extraData={extraData} showsVerticalScrollIndicator={false} onLayout={onLayout} onScroll={onScroll} estimatedListSize={estimatedListSize} initialScrollIndex={isWebOrDesktop ? getScrollIndex(route) : undefined}/>)}
        </react_native_1.View>);
}
LHNOptionsList.displayName = 'LHNOptionsList';
exports.default = (0, react_1.memo)(LHNOptionsList);
