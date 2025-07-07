"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Button_1 = require("@components/Button");
var utils_1 = require("@components/Button/utils");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Pressable_1 = require("@components/Pressable");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ProcessMoneyReportHoldMenu_1 = require("@components/ProcessMoneyReportHoldMenu");
var ExportWithDropdownMenu_1 = require("@components/ReportActionItem/ExportWithDropdownMenu");
var AnimatedSettlementButton_1 = require("@components/SettlementButton/AnimatedSettlementButton");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaymentAnimations_1 = require("@hooks/usePaymentAnimations");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var ControlSelection_1 = require("@libs/ControlSelection");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportPreviewActionUtils_1 = require("@libs/ReportPreviewActionUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var shouldAdjustScroll_1 = require("@libs/shouldAdjustScroll");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var colors_1 = require("@styles/theme/colors");
var variables_1 = require("@styles/variables");
var IOU_1 = require("@userActions/IOU");
var Timing_1 = require("@userActions/Timing");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyMoneyRequestReportPreview_1 = require("./EmptyMoneyRequestReportPreview");
var checkIfReportNameOverflows = function (_a) {
    var nativeEvent = _a.nativeEvent;
    return 'target' in nativeEvent ? nativeEvent.target.scrollHeight > variables_1.default.h70 : false;
};
// Do not remove this empty view, it is a workaround for the icon padding at the end of the preview text
var FixIconPadding = <react_native_1.View style={{ height: variables_1.default.iconSizeNormal }}/>;
function MoneyRequestReportPreviewContent(_a) {
    var _b;
    var _c, _d, _e, _f, _g;
    var iouReportID = _a.iouReportID, chatReportID = _a.chatReportID, action = _a.action, containerStyles = _a.containerStyles, contextMenuAnchor = _a.contextMenuAnchor, _h = _a.isHovered, isHovered = _h === void 0 ? false : _h, _j = _a.isWhisper, isWhisper = _j === void 0 ? false : _j, _k = _a.checkIfContextMenuActive, checkIfContextMenuActive = _k === void 0 ? function () { } : _k, onPaymentOptionsShow = _a.onPaymentOptionsShow, onPaymentOptionsHide = _a.onPaymentOptionsHide, chatReport = _a.chatReport, invoiceReceiverPolicy = _a.invoiceReceiverPolicy, iouReport = _a.iouReport, transactions = _a.transactions, violations = _a.violations, policy = _a.policy, invoiceReceiverPersonalDetail = _a.invoiceReceiverPersonalDetail, lastTransactionViolations = _a.lastTransactionViolations, renderTransactionItem = _a.renderTransactionItem, onCarouselLayout = _a.onCarouselLayout, onWrapperLayout = _a.onWrapperLayout, currentWidth = _a.currentWidth, reportPreviewStyles = _a.reportPreviewStyles, _l = _a.shouldDisplayContextMenu, shouldDisplayContextMenu = _l === void 0 ? true : _l, isInvoice = _a.isInvoice, _m = _a.shouldShowBorder, shouldShowBorder = _m === void 0 ? false : _m, onPress = _a.onPress;
    var lastTransaction = transactions === null || transactions === void 0 ? void 0 : transactions.at(0);
    var shouldShowEmptyPlaceholder = transactions.length === 0;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _o = (0, react_1.useState)(false), doesReportNameOverflow = _o[0], setDoesReportNameOverflow = _o[1];
    var _p = (0, react_1.useMemo)(function () { return ({
        areAllRequestsBeingSmartScanned: (0, ReportUtils_1.areAllRequestsBeingSmartScanned)(iouReportID, action),
        hasOnlyTransactionsWithPendingRoutes: (0, ReportUtils_1.hasOnlyTransactionsWithPendingRoutes)(iouReportID),
        hasNonReimbursableTransactions: (0, ReportUtils_1.hasNonReimbursableTransactions)(iouReportID),
    }); }, 
    // When transactions get updated these values may have changed, so that is a case where we also want to recompute them
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [transactions, iouReportID, action]), areAllRequestsBeingSmartScanned = _p.areAllRequestsBeingSmartScanned, hasNonReimbursableTransactions = _p.hasNonReimbursableTransactions;
    var _q = (0, usePaymentAnimations_1.default)(), isPaidAnimationRunning = _q.isPaidAnimationRunning, isApprovedAnimationRunning = _q.isApprovedAnimationRunning, stopAnimation = _q.stopAnimation, startAnimation = _q.startAnimation, startApprovedAnimation = _q.startApprovedAnimation;
    var _r = (0, react_1.useState)(false), isHoldMenuVisible = _r[0], setIsHoldMenuVisible = _r[1];
    var _s = (0, react_1.useState)(), requestType = _s[0], setRequestType = _s[1];
    var _t = (0, react_1.useState)(), paymentType = _t[0], setPaymentType = _t[1];
    var isIouReportArchived = (0, useReportIsArchived_1.default)(iouReportID);
    var isChatReportArchived = (0, useReportIsArchived_1.default)(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID);
    var getCanIOUBePaid = (0, react_1.useCallback)(function (shouldShowOnlyPayElsewhere, shouldCheckApprovedState) {
        if (shouldShowOnlyPayElsewhere === void 0) { shouldShowOnlyPayElsewhere = false; }
        if (shouldCheckApprovedState === void 0) { shouldCheckApprovedState = true; }
        return (0, IOU_1.canIOUBePaid)(iouReport, chatReport, policy, transactions, shouldShowOnlyPayElsewhere, undefined, undefined, shouldCheckApprovedState);
    }, [iouReport, chatReport, policy, transactions]);
    var canIOUBePaid = (0, react_1.useMemo)(function () { return getCanIOUBePaid(); }, [getCanIOUBePaid]);
    var onlyShowPayElsewhere = (0, react_1.useMemo)(function () { return !canIOUBePaid && getCanIOUBePaid(true); }, [canIOUBePaid, getCanIOUBePaid]);
    var shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    var _u = (0, ReportUtils_1.getNonHeldAndFullAmount)(iouReport, shouldShowPayButton), nonHeldAmount = _u.nonHeldAmount, fullAmount = _u.fullAmount, hasValidNonHeldAmount = _u.hasValidNonHeldAmount;
    var canIOUBePaidAndApproved = (0, react_1.useMemo)(function () { return getCanIOUBePaid(false, false); }, [getCanIOUBePaid]);
    var connectedIntegration = (0, PolicyUtils_1.getConnectedIntegration)(policy);
    var hasOnlyHeldExpenses = (0, ReportUtils_1.hasOnlyHeldExpenses)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var managerID = (_d = (_c = iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID) !== null && _c !== void 0 ? _c : action.childManagerAccountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID;
    var totalDisplaySpend = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(iouReport).totalDisplaySpend;
    var iouSettled = (0, ReportUtils_1.isSettled)(iouReportID) || (action === null || action === void 0 ? void 0 : action.childStatusNum) === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
    var previewMessageOpacity = (0, react_native_reanimated_1.useSharedValue)(1);
    var previewMessageStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: previewMessageOpacity.get(),
    }); });
    var checkMarkScale = (0, react_native_reanimated_1.useSharedValue)(iouSettled ? 1 : 0);
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: iouReport, parentReportAction: action });
    var thumbsUpScale = (0, react_native_reanimated_1.useSharedValue)(isApproved ? 1 : 0);
    var isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(chatReport);
    var isInvoiceRoom = (0, ReportUtils_1.isInvoiceRoom)(chatReport);
    var isTripRoom = (0, ReportUtils_1.isTripRoom)(chatReport);
    var canAllowSettlement = (0, ReportUtils_1.hasUpdatedTotal)(iouReport, policy);
    var numberOfRequests = (_e = transactions === null || transactions === void 0 ? void 0 : transactions.length) !== null && _e !== void 0 ? _e : 0;
    var transactionsWithReceipts = (0, ReportUtils_1.getTransactionsWithReceipts)(iouReportID);
    var numberOfPendingRequests = transactionsWithReceipts.filter(function (transaction) { return (0, TransactionUtils_1.isPending)(transaction) && (0, TransactionUtils_1.isCardTransaction)(transaction); }).length;
    var shouldShowRTERViolationMessage = numberOfRequests === 1 && (0, TransactionUtils_1.hasPendingUI)(lastTransaction, lastTransactionViolations);
    var shouldShowOnlyPayElsewhere = (0, react_1.useMemo)(function () { return !canIOUBePaid && getCanIOUBePaid(true); }, [canIOUBePaid, getCanIOUBePaid]);
    var hasReceipts = transactionsWithReceipts.length > 0;
    var isScanning = hasReceipts && areAllRequestsBeingSmartScanned;
    // The submit button should be success green color only if the user is submitter and the policy does not have Scheduled Submit turned on
    var isWaitingForSubmissionFromCurrentUser = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isWaitingForSubmissionFromCurrentUser)(chatReport, policy); }, [chatReport, policy]);
    var _v = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isDelegateAccessRestricted = _v.isDelegateAccessRestricted, showDelegateNoAccessModal = _v.showDelegateNoAccessModal;
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReportID), { canBeMissing: true })[0];
    var confirmPayment = (0, react_1.useCallback)(function (type, payAsBusiness) {
        if (!type) {
            return;
        }
        setPaymentType(type);
        setRequestType(CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        }
        else if ((0, ReportUtils_1.hasHeldExpenses)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)) {
            setIsHoldMenuVisible(true);
        }
        else if (chatReport && iouReport) {
            startAnimation();
            if ((0, ReportUtils_1.isInvoiceReport)(iouReport)) {
                (0, IOU_1.payInvoice)(type, chatReport, iouReport, payAsBusiness);
            }
            else {
                (0, IOU_1.payMoneyRequest)(type, chatReport, iouReport);
            }
        }
    }, [chatReport, iouReport, isDelegateAccessRestricted, showDelegateNoAccessModal, startAnimation]);
    var confirmApproval = function () {
        setRequestType(CONST_1.default.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        }
        else if ((0, ReportUtils_1.hasHeldExpenses)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)) {
            setIsHoldMenuVisible(true);
        }
        else {
            startApprovedAnimation();
            (0, IOU_1.approveMoneyRequest)(iouReport, true);
        }
    };
    var previewMessage = (0, react_1.useMemo)(function () {
        if (isScanning) {
            return totalDisplaySpend ? "".concat(translate('common.receipt'), " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('common.scanning')) : "".concat(translate('common.receipt'));
        }
        if (numberOfPendingRequests === 1 && numberOfRequests === 1) {
            return "".concat(translate('common.receipt'), " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.pending'));
        }
        if (shouldShowRTERViolationMessage) {
            return "".concat(translate('common.receipt'), " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.pendingMatch'));
        }
        var payerOrApproverName;
        if (isPolicyExpenseChat || isTripRoom) {
            payerOrApproverName = (0, ReportUtils_1.getPolicyName)({ report: chatReport, policy: policy });
        }
        else if (isInvoiceRoom) {
            payerOrApproverName = (0, ReportUtils_1.getInvoicePayerName)(chatReport, invoiceReceiverPolicy, invoiceReceiverPersonalDetail);
        }
        else {
            payerOrApproverName = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: managerID, shouldUseShortForm: true });
        }
        if (isApproved) {
            return translate('iou.managerApproved', { manager: payerOrApproverName });
        }
        var paymentVerb = 'iou.payerOwes';
        if (iouSettled || (iouReport === null || iouReport === void 0 ? void 0 : iouReport.isWaitingOnBankAccount)) {
            paymentVerb = 'iou.payerPaid';
        }
        else if (hasNonReimbursableTransactions) {
            paymentVerb = 'iou.payerSpent';
            payerOrApproverName = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.ownerAccountID, shouldUseShortForm: true });
        }
        return translate(paymentVerb, { payer: payerOrApproverName });
    }, [
        isScanning,
        numberOfPendingRequests,
        numberOfRequests,
        shouldShowRTERViolationMessage,
        isPolicyExpenseChat,
        isTripRoom,
        isInvoiceRoom,
        isApproved,
        iouSettled,
        iouReport === null || iouReport === void 0 ? void 0 : iouReport.isWaitingOnBankAccount,
        hasNonReimbursableTransactions,
        translate,
        totalDisplaySpend,
        chatReport,
        policy,
        invoiceReceiverPolicy,
        invoiceReceiverPersonalDetail,
        managerID,
    ]);
    var bankAccountRoute = (0, ReportUtils_1.getBankAccountRoute)(chatReport);
    /*
     Show subtitle if at least one of the expenses is not being smart scanned, and either:
     - There is more than one expense – in this case, the "X expenses, Y scanning" subtitle is shown;
     - There is only one expense, it has a receipt and is not being smart scanned – in this case, the expense merchant or description is shown;

     * There is an edge case when there is only one distance expense with a pending route and amount = 0.
       In this case, we don't want to show the merchant or description because it says: "Pending route...", which is already displayed in the amount field.
     */
    var supportText = (0, react_1.useMemo)(function () {
        if (numberOfRequests === 1) {
            return {
                supportText: '',
            };
        }
        return {
            supportText: translate('iou.expenseCount', {
                count: numberOfRequests,
            }),
        };
    }, [translate, numberOfRequests]).supportText;
    (0, react_1.useEffect)(function () {
        if (!isPaidAnimationRunning || isApprovedAnimationRunning) {
            return;
        }
        previewMessageOpacity.set((0, react_native_reanimated_1.withTiming)(0.75, { duration: CONST_1.default.ANIMATION_PAID_DURATION / 2 }, function () {
            previewMessageOpacity.set((0, react_native_reanimated_1.withTiming)(1, { duration: CONST_1.default.ANIMATION_PAID_DURATION / 2 }));
        }));
        // We only want to animate the text when the text changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [previewMessage, previewMessageOpacity]);
    (0, react_1.useEffect)(function () {
        if (!iouSettled) {
            return;
        }
        checkMarkScale.set(isPaidAnimationRunning ? (0, react_native_reanimated_1.withDelay)(CONST_1.default.ANIMATION_PAID_CHECKMARK_DELAY, (0, react_native_reanimated_1.withSpring)(1, { duration: CONST_1.default.ANIMATION_PAID_DURATION })) : 1);
    }, [isPaidAnimationRunning, iouSettled, checkMarkScale]);
    (0, react_1.useEffect)(function () {
        if (!isApproved) {
            return;
        }
        thumbsUpScale.set(isApprovedAnimationRunning ? (0, react_native_reanimated_1.withDelay)(CONST_1.default.ANIMATION_THUMBS_UP_DELAY, (0, react_native_reanimated_1.withSpring)(1, { duration: CONST_1.default.ANIMATION_THUMBS_UP_DURATION })) : 1);
    }, [isApproved, isApprovedAnimationRunning, thumbsUpScale]);
    var carouselTransactions = transactions.slice(0, 11);
    var prevCarouselTransactionLength = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        return function () {
            prevCarouselTransactionLength.current = carouselTransactions.length;
        };
    }, [carouselTransactions.length]);
    var _w = (0, react_1.useState)(0), currentIndex = _w[0], setCurrentIndex = _w[1];
    var _x = (0, react_1.useState)([0]), currentVisibleItems = _x[0], setCurrentVisibleItems = _x[1];
    var _y = (0, react_1.useState)(0), footerWidth = _y[0], setFooterWidth = _y[1];
    // optimisticIndex - value for index we are scrolling to with an arrow button or undefined after scroll is completed
    // value ensures that disabled state is applied instantly and not overridden by onViewableItemsChanged when scrolling
    // undefined makes arrow buttons react on currentIndex changes when scrolling manually
    var _z = (0, react_1.useState)(undefined), optimisticIndex = _z[0], setOptimisticIndex = _z[1];
    var carouselRef = (0, react_1.useRef)(null);
    var visibleItemsOnEndCount = (0, react_1.useMemo)(function () {
        var lastItemWidth = transactions.length > 10 ? footerWidth : reportPreviewStyles.transactionPreviewCarouselStyle.width;
        var lastItemWithGap = lastItemWidth + styles.gap2.gap;
        var itemWithGap = reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.gap2.gap;
        return Math.floor((currentWidth - 2 * styles.pl2.paddingLeft - lastItemWithGap) / itemWithGap) + 1;
    }, [transactions.length, footerWidth, reportPreviewStyles.transactionPreviewCarouselStyle.width, styles.gap2.gap, styles.pl2.paddingLeft, currentWidth]);
    var viewabilityConfig = (0, react_1.useMemo)(function () {
        return { itemVisiblePercentThreshold: 100 };
    }, []);
    // eslint-disable-next-line react-compiler/react-compiler
    var onViewableItemsChanged = (0, react_1.useRef)(function (_a) {
        var _b;
        var viewableItems = _a.viewableItems;
        var newIndex = (_b = viewableItems.at(0)) === null || _b === void 0 ? void 0 : _b.index;
        if (typeof newIndex === 'number') {
            setCurrentIndex(newIndex);
        }
        var viewableItemsIndexes = viewableItems.map(function (item) { return item.index; }).filter(function (item) { return item !== null; });
        setCurrentVisibleItems(viewableItemsIndexes);
    }).current;
    var handleChange = function (index) {
        var _a, _b, _c;
        if (index > carouselTransactions.length - visibleItemsOnEndCount) {
            setOptimisticIndex(carouselTransactions.length - visibleItemsOnEndCount);
            (_a = carouselRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({ index: carouselTransactions.length - visibleItemsOnEndCount, animated: true, viewOffset: 2 * styles.gap2.gap });
            return;
        }
        if (index < 0) {
            setOptimisticIndex(0);
            (_b = carouselRef.current) === null || _b === void 0 ? void 0 : _b.scrollToIndex({ index: 0, animated: true, viewOffset: 2 * styles.gap2.gap });
            return;
        }
        setOptimisticIndex(index);
        (_c = carouselRef.current) === null || _c === void 0 ? void 0 : _c.scrollToIndex({ index: index, animated: true, viewOffset: 2 * styles.gap2.gap });
    };
    var onTextLayoutChange = function (e) {
        var doesOverflow = checkIfReportNameOverflows(e);
        if (doesOverflow !== doesReportNameOverflow) {
            setDoesReportNameOverflow(doesOverflow);
        }
    };
    var renderFlatlistItem = function (itemInfo) {
        if (itemInfo.index > 9) {
            return (<react_native_1.View style={[styles.flex1, styles.p5, styles.justifyContentCenter]} onLayout={function (e) { return setFooterWidth(e.nativeEvent.layout.width); }}>
                    <Text_1.default style={{ color: colors_1.default.blue600 }}>
                        +{transactions.length - 10} {translate('common.more').toLowerCase()}
                    </Text_1.default>
                </react_native_1.View>);
        }
        return renderTransactionItem(itemInfo);
    };
    // The button should expand up to transaction width
    var buttonMaxWidth = !shouldUseNarrowLayout && reportPreviewStyles.transactionPreviewCarouselStyle.width >= CONST_1.default.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_WIDTH
        ? { maxWidth: reportPreviewStyles.transactionPreviewCarouselStyle.width }
        : {};
    var approvedOrSettledIcon = (iouSettled || isApproved) && (<ImageSVG_1.default src={isApproved ? Expensicons.ThumbsUp : Expensicons.Checkmark} fill={isApproved ? theme.icon : theme.iconSuccessFill} width={variables_1.default.iconSizeNormal} height={variables_1.default.iconSizeNormal} style={{ transform: 'translateY(4px)' }} contentFit="cover"/>);
    (0, react_1.useEffect)(function () {
        if (optimisticIndex === undefined ||
            optimisticIndex !== currentIndex ||
            // currentIndex is still the same as target (f.ex. 0), but not yet scrolled to the far left
            (currentVisibleItems.at(0) !== optimisticIndex && optimisticIndex !== undefined) ||
            // currentIndex reached, but not scrolled to the end
            (optimisticIndex === carouselTransactions.length - visibleItemsOnEndCount && currentVisibleItems.length !== visibleItemsOnEndCount)) {
            return;
        }
        setOptimisticIndex(undefined);
    }, [carouselTransactions.length, currentIndex, currentVisibleItems, currentVisibleItems.length, optimisticIndex, visibleItemsOnEndCount]);
    var openReportFromPreview = (0, react_1.useCallback)(function () {
        if (!iouReportID) {
            return;
        }
        Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing_1.default.start(CONST_1.default.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
    }, [iouReportID]);
    var reportPreviewAction = (0, react_1.useMemo)(function () {
        // It's necessary to allow payment animation to finish before button is changed
        if (isPaidAnimationRunning) {
            return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
        }
        return (0, ReportPreviewActionUtils_1.getReportPreviewAction)(violations, iouReport, policy, transactions, isIouReportArchived || isChatReportArchived, reportActions, invoiceReceiverPolicy);
    }, [isPaidAnimationRunning, violations, iouReport, policy, transactions, isIouReportArchived, reportActions, invoiceReceiverPolicy, isChatReportArchived]);
    var addExpenseDropdownOptions = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
            text: translate('iou.createNewExpense'),
            icon: Expensicons.Plus,
            onSelected: function () {
                if (!(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)) {
                    return;
                }
                if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
                    Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SUBMIT, iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, undefined, false, chatReportID);
            },
        },
        {
            value: CONST_1.default.REPORT.ADD_EXPENSE_OPTIONS.ADD_UNREPORTED_EXPENSE,
            text: translate('iou.addUnreportedExpense'),
            icon: Expensicons.ReceiptPlus,
            onSelected: function () {
                if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
                    Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                (0, Report_1.openUnreportedExpense)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportID);
            },
        },
    ]; }, [chatReportID, iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportID, iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, policy, translate]);
    var isReportDeleted = (action === null || action === void 0 ? void 0 : action.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    var reportPreviewActions = (_b = {},
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT] = (<Button_1.default success={isWaitingForSubmissionFromCurrentUser} text={translate('iou.submitAmount', { amount: (0, MoneyRequestReportUtils_1.getTotalAmountForIOUReportPreviewButton)(iouReport, policy, reportPreviewAction) })} onPress={function () { return (0, IOU_1.submitReport)(iouReport); }}/>),
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE] = (<Button_1.default text={translate('iou.approve', { formattedAmount: (0, MoneyRequestReportUtils_1.getTotalAmountForIOUReportPreviewButton)(iouReport, policy, reportPreviewAction) })} success onPress={function () { return confirmApproval(); }}/>),
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY] = (<AnimatedSettlementButton_1.default onlyShowPayElsewhere={shouldShowOnlyPayElsewhere} isPaidAnimationRunning={isPaidAnimationRunning} isApprovedAnimationRunning={isApprovedAnimationRunning} canIOUBePaid={canIOUBePaidAndApproved || isPaidAnimationRunning} onAnimationFinish={stopAnimation} formattedAmount={(0, MoneyRequestReportUtils_1.getTotalAmountForIOUReportPreviewButton)(iouReport, policy, reportPreviewAction)} currency={iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency} chatReportID={chatReportID} policyID={policy === null || policy === void 0 ? void 0 : policy.id} iouReport={iouReport} wrapperStyle={buttonMaxWidth} onPress={confirmPayment} onPaymentOptionsShow={onPaymentOptionsShow} onPaymentOptionsHide={onPaymentOptionsHide} confirmApproval={confirmApproval} enablePaymentsRoute={ROUTES_1.default.ENABLE_PAYMENTS} addBankAccountRoute={bankAccountRoute} shouldHidePaymentOptions={!shouldShowPayButton} kycWallAnchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }} paymentMethodDropdownAnchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }} isDisabled={isOffline && !canAllowSettlement} isLoading={!isOffline && !canAllowSettlement}/>),
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING] = connectedIntegration ? (<ExportWithDropdownMenu_1.default report={iouReport} reportActions={reportActions} connectionName={connectedIntegration} wrapperStyle={styles.flexReset} dropdownAnchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}/>) : null,
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW] = (<Button_1.default icon={Expensicons.DotIndicator} iconFill={theme.danger} iconHoverFill={theme.danger} text={translate('common.review', {
                amount: (0, MoneyRequestReportUtils_1.getTotalAmountForIOUReportPreviewButton)(iouReport, policy, reportPreviewAction),
            })} onPress={function () { return openReportFromPreview(); }}/>),
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW] = (<Button_1.default text={translate('common.view')} onPress={function () {
                openReportFromPreview();
            }}/>),
        _b[CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE] = (<ButtonWithDropdownMenu_1.default onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('iou.addExpense')} options={addExpenseDropdownOptions} isSplitButton={false} anchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}/>),
        _b);
    var adjustScroll = (0, react_1.useCallback)(function () {
        var _a;
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        if (carouselTransactions.length >= prevCarouselTransactionLength.current || !shouldAdjustScroll_1.default) {
            return;
        }
        prevCarouselTransactionLength.current = carouselTransactions.length;
        (_a = carouselRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd();
    }, [carouselTransactions.length]);
    return (<react_native_1.View onLayout={onWrapperLayout}>
            <OfflineWithFeedback_1.default pendingAction={(_f = iouReport === null || iouReport === void 0 ? void 0 : iouReport.pendingFields) === null || _f === void 0 ? void 0 : _f.preview} shouldDisableOpacity={!!((_g = action.pendingAction) !== null && _g !== void 0 ? _g : action.isOptimisticAction)} needsOffscreenAlphaCompositing style={styles.mt1}>
                <react_native_1.View style={[styles.chatItemMessage, isReportDeleted && [styles.cursorDisabled, styles.pointerEventsAuto], containerStyles]} onLayout={onCarouselLayout} testID="carouselWidthSetter">
                    <PressableWithoutFeedback_1.default onPress={onPress} onPressIn={function () { return (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onLongPress={function (event) {
            if (!shouldDisplayContextMenu) {
                return;
            }
            (0, ShowContextMenuContext_1.showContextMenuForReport)(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive);
        }} shouldUseHapticsOnLongPress style={[
            styles.flexRow,
            styles.justifyContentBetween,
            StyleUtils.getBackgroundColorStyle(theme.cardBG),
            shouldShowBorder ? styles.borderedContentCardLarge : styles.reportContainerBorderRadius,
            isReportDeleted && styles.pointerEventsNone,
        ]} role={(0, utils_1.getButtonRole)(true)} isNested accessibilityLabel={translate('iou.viewDetails')}>
                        <react_native_1.View style={[
            StyleUtils.getBackgroundColorStyle(theme.cardBG),
            styles.reportContainerBorderRadius,
            styles.w100,
            (isHovered || isScanning || isWhisper) && styles.reportPreviewBoxHoverBorder,
        ]}>
                            <react_native_1.View style={[reportPreviewStyles.wrapperStyle]}>
                                <react_native_1.View style={[reportPreviewStyles.contentContainerStyle]}>
                                    <react_native_1.View style={[styles.expenseAndReportPreviewTextContainer, styles.overflowHidden]}>
                                        <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3, StyleUtils.getMinimumHeight(variables_1.default.h28)]}>
                                            <react_native_1.View style={[styles.flexRow, styles.mw100, styles.flexShrink1]}>
                                                <react_native_reanimated_1.default.View style={[styles.flexRow, styles.alignItemsCenter, previewMessageStyle, styles.flexShrink1]}>
                                                    <Text_1.default onLayout={onTextLayoutChange} style={[styles.lh20]} numberOfLines={3}>
                                                        {FixIconPadding}
                                                        <Text_1.default style={[styles.headerText]} testID="MoneyRequestReportPreview-reportName">
                                                            {(0, ReportUtils_1.getMoneyReportPreviewName)(action, iouReport, isInvoice)}
                                                        </Text_1.default>
                                                        {!doesReportNameOverflow && <>&nbsp;{approvedOrSettledIcon}</>}
                                                    </Text_1.default>
                                                    {doesReportNameOverflow && (<react_native_1.View style={[styles.mtn0Half, (transactions.length < 3 || shouldUseNarrowLayout) && styles.alignSelfStart]}>
                                                            {approvedOrSettledIcon}
                                                        </react_native_1.View>)}
                                                </react_native_reanimated_1.default.View>
                                            </react_native_1.View>
                                            {!shouldUseNarrowLayout && transactions.length > 2 && reportPreviewStyles.expenseCountVisible && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                                                    <Text_1.default style={[styles.textLabelSupporting, styles.textLabelSupporting, styles.lh20, styles.mr1]}>{supportText}</Text_1.default>
                                                    <Pressable_1.PressableWithFeedback accessibilityRole="button" accessible accessibilityLabel="button" style={[styles.reportPreviewArrowButton, { backgroundColor: theme.buttonDefaultBG }]} onPress={function () { return handleChange(currentIndex - 1); }} disabled={optimisticIndex !== undefined ? optimisticIndex === 0 : currentIndex === 0 && currentVisibleItems.at(0) === 0} disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}>
                                                        <Icon_1.default src={Expensicons.BackArrow} small fill={theme.icon} isButtonIcon/>
                                                    </Pressable_1.PressableWithFeedback>
                                                    <Pressable_1.PressableWithFeedback accessibilityRole="button" accessible accessibilityLabel="button" style={[styles.reportPreviewArrowButton, { backgroundColor: theme.buttonDefaultBG }]} onPress={function () { return handleChange(currentIndex + 1); }} disabled={optimisticIndex
                ? optimisticIndex + visibleItemsOnEndCount >= carouselTransactions.length
                : currentVisibleItems.at(-1) === carouselTransactions.length - 1} disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}>
                                                        <Icon_1.default src={Expensicons.ArrowRight} small fill={theme.icon} isButtonIcon/>
                                                    </Pressable_1.PressableWithFeedback>
                                                </react_native_1.View>)}
                                        </react_native_1.View>
                                    </react_native_1.View>
                                    {!currentWidth ? (<react_native_1.View style={[
                {
                    height: CONST_1.default.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_HEIGHT,
                },
                styles.justifyContentCenter,
                styles.mtn1,
            ]}>
                                            <react_native_1.ActivityIndicator color={theme.spinner} size={40}/>
                                        </react_native_1.View>) : (<react_native_1.View style={[styles.flex1, styles.flexColumn, styles.overflowVisible, styles.mtn1]}>
                                            <react_native_1.FlatList snapToAlignment="start" decelerationRate="fast" snapToInterval={reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.gap2.gap} horizontal data={carouselTransactions} ref={carouselRef} nestedScrollEnabled bounces={false} keyExtractor={function (item) { return "".concat(item.transactionID, "_").concat(reportPreviewStyles.transactionPreviewCarouselStyle.width); }} contentContainerStyle={[styles.gap2]} style={reportPreviewStyles.flatListStyle} showsHorizontalScrollIndicator={false} renderItem={renderFlatlistItem} onViewableItemsChanged={onViewableItemsChanged} onEndReached={adjustScroll} viewabilityConfig={viewabilityConfig} ListFooterComponent={<react_native_1.View style={styles.pl2}/>} ListHeaderComponent={<react_native_1.View style={styles.pr2}/>}/>
                                            {shouldShowEmptyPlaceholder && <EmptyMoneyRequestReportPreview_1.default emptyReportPreviewAction={reportPreviewActions[reportPreviewAction]}/>}
                                        </react_native_1.View>)}
                                    {shouldUseNarrowLayout && transactions.length > 1 && (<react_native_1.View style={[styles.flexRow, styles.alignSelfCenter, styles.gap2]}>
                                            {carouselTransactions.map(function (item, index) { return (<Pressable_1.PressableWithFeedback accessibilityRole="button" accessible accessibilityLabel="button" style={[styles.reportPreviewCarouselDots, { backgroundColor: index === currentIndex ? theme.icon : theme.buttonDefaultBG }]} onPress={function () { return handleChange(index); }}/>); })}
                                        </react_native_1.View>)}
                                    {/* height is needed to avoid flickering on animation */}
                                    {!shouldShowEmptyPlaceholder && <react_native_1.View style={[buttonMaxWidth, { height: variables_1.default.h40 }]}>{reportPreviewActions[reportPreviewAction]}</react_native_1.View>}
                                </react_native_1.View>
                            </react_native_1.View>
                        </react_native_1.View>
                    </PressableWithoutFeedback_1.default>
                </react_native_1.View>
                {isHoldMenuVisible && !!iouReport && !!requestType && (<ProcessMoneyReportHoldMenu_1.default nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined} requestType={requestType} fullAmount={fullAmount} onClose={function () { return setIsHoldMenuVisible(false); }} isVisible={isHoldMenuVisible} paymentType={paymentType} chatReport={chatReport} moneyRequestReport={iouReport} transactionCount={numberOfRequests} startAnimation={function () {
                if (requestType === CONST_1.default.IOU.REPORT_ACTION_TYPE.APPROVE) {
                    startApprovedAnimation();
                }
                else {
                    startAnimation();
                }
            }}/>)}
            </OfflineWithFeedback_1.default>
        </react_native_1.View>);
}
MoneyRequestReportPreviewContent.displayName = 'MoneyRequestReportPreviewContent';
exports.default = MoneyRequestReportPreviewContent;
