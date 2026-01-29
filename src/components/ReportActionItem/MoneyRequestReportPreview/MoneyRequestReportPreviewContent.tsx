import {FlashList} from '@shopify/flash-list';
import type {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {FlatList, ListRenderItemInfo, ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import Button from '@components/Button';
import {getButtonRole} from '@components/Button/utils';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import ConfirmModal from '@components/ConfirmModal';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import MoneyReportHeaderStatusBarSkeleton from '@components/MoneyReportHeaderStatusBarSkeleton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import ExportWithDropdownMenu from '@components/ReportActionItem/ExportWithDropdownMenu';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import {getConnectedIntegration, hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {hasPendingDEWSubmit} from '@libs/ReportActionsUtils';
import {getInvoicePayerName} from '@libs/ReportNameUtils';
import getReportPreviewAction from '@libs/ReportPreviewActionUtils';
import {
    areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils,
    getAddExpenseDropdownOptions,
    getDisplayNameForParticipant,
    getMoneyReportPreviewName,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getPolicyName,
    getReportStatusColorStyle,
    getReportStatusTranslation,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasOnlyTransactionsWithPendingRoutes as hasOnlyTransactionsWithPendingRoutesReportUtils,
    hasReportBeenReopened as hasReportBeenReopenedUtils,
    hasReportBeenRetracted as hasReportBeenRetractedUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isInvoiceReport as isInvoiceReportUtils,
    isInvoiceRoom as isInvoiceRoomReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isReportApproved,
    isReportOwner,
    isSettled,
    isTripRoom as isTripRoomReportUtils,
    isWaitingForSubmissionFromCurrentUser as isWaitingForSubmissionFromCurrentUserReportUtils,
} from '@libs/ReportUtils';
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import {startSpan} from '@libs/telemetry/activeSpans';
import {hasPendingUI, isManagedCardTransaction, isPending} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import {approveMoneyRequest, canIOUBePaid as canIOUBePaidIOUActions, payInvoice, payMoneyRequest, submitReport} from '@userActions/IOU';
import {openOldDotLink} from '@userActions/Link';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAttributesDerivedValue, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import AccessMoneyRequestReportPreviewPlaceHolder from './AccessMoneyRequestReportPreviewPlaceHolder';
import EmptyMoneyRequestReportPreview from './EmptyMoneyRequestReportPreview';
import type {MoneyRequestReportPreviewContentProps} from './types';

const reportAttributesSelector = (c: OnyxEntry<ReportAttributesDerivedValue>) => c?.reports;

function ItemSeparatorComponent() {
    return <View style={{width: 8}} />;
}

function MoneyRequestReportPreviewContent({
    iouReportID,
    chatReportID,
    action,
    containerStyles,
    contextMenuAnchor,
    isHovered = false,
    isWhisper = false,
    checkIfContextMenuActive = () => {},
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    chatReport,
    invoiceReceiverPolicy,
    iouReport,
    transactions,
    policy,
    invoiceReceiverPersonalDetail,
    lastTransactionViolations,
    renderTransactionItem,
    onCarouselLayout,
    onWrapperLayout,
    currentWidth,
    reportPreviewStyles,
    shouldDisplayContextMenu = true,
    isInvoice,
    shouldShowBorder = false,
    onPress,
    forwardedFSClass,
}: MoneyRequestReportPreviewContentProps) {
    const [chatReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`, {canBeMissing: true, allowStaleData: true});
    const [iouReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const shouldShowLoading = !chatReportMetadata?.hasOnceLoadedReportActions && transactions.length === 0 && !chatReportMetadata?.isOptimisticReport;
    // `hasOnceLoadedReportActions` becomes true before transactions populate fully,
    // so we defer the loading state update to ensure transactions are loaded
    const shouldShowLoadingDeferred = useDeferredValue(shouldShowLoading);
    const lastTransaction = transactions?.at(0);
    const shouldShowSkeleton = shouldShowLoading && transactions.length === 0;
    const shouldShowAccessPlaceHolder = !iouReport && !shouldShowLoading;
    const shouldShowEmptyPlaceholder = transactions.length === 0 && !shouldShowLoading;
    const showStatusAndSkeleton = !shouldShowEmptyPlaceholder;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow', 'Location', 'ReceiptPlus']);

    const {areAllRequestsBeingSmartScanned, hasNonReimbursableTransactions} = useMemo(
        () => ({
            areAllRequestsBeingSmartScanned: areAllRequestsBeingSmartScannedReportUtils(iouReportID, action),
            hasOnlyTransactionsWithPendingRoutes: hasOnlyTransactionsWithPendingRoutesReportUtils(iouReportID),
            hasNonReimbursableTransactions: hasNonReimbursableTransactionsReportUtils(iouReportID),
        }),
        // When transactions get updated these values may have changed, so that is a case where we also want to recompute them
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [transactions, iouReportID, action],
    );

    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, stopAnimation, startAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [isDEWModalVisible, setIsDEWModalVisible] = useState(false);
    const isIouReportArchived = useReportIsArchived(iouReportID);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail);

    const getCanIOUBePaid = useCallback(
        (shouldShowOnlyPayElsewhere = false) => canIOUBePaidIOUActions(iouReport, chatReport, policy, bankAccountList, transactions, shouldShowOnlyPayElsewhere),
        [iouReport, chatReport, policy, bankAccountList, transactions],
    );

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, shouldShowPayButton);
    const canIOUBePaidAndApproved = useMemo(() => getCanIOUBePaid(false), [getCanIOUBePaid]);
    const connectedIntegration = getConnectedIntegration(policy);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(iouReport?.reportID);

    const managerID = iouReport?.managerID ?? action.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(iouReport);

    const iouSettled = isSettled(iouReportID) || action?.childStatusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const previewMessageOpacity = useSharedValue(1);
    const previewMessageStyle = useAnimatedStyle(() => ({
        opacity: previewMessageOpacity.get(),
    }));
    const checkMarkScale = useSharedValue(iouSettled ? 1 : 0);

    const isApproved = isReportApproved({report: iouReport, parentReportAction: action});
    const thumbsUpScale = useSharedValue(isApproved ? 1 : 0);

    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(chatReport);
    const isInvoiceRoom = isInvoiceRoomReportUtils(chatReport);
    const isTripRoom = isTripRoomReportUtils(chatReport);

    const canAllowSettlement = hasUpdatedTotal(iouReport, policy);
    const numberOfRequests = transactions?.length ?? 0;
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    const numberOfPendingRequests = transactionsWithReceipts.filter((transaction) => isPending(transaction) && isManagedCardTransaction(transaction)).length;

    const shouldShowRTERViolationMessage = numberOfRequests === 1 && hasPendingUI(lastTransaction, lastTransactionViolations);
    const shouldShowOnlyPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);

    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportAttributesSelector});

    const currentReportName = iouReport?.reportID ? reportAttributes?.[iouReport.reportID]?.reportName : undefined;
    const reportPreviewName = useMemo(() => {
        return getMoneyReportPreviewName(action, iouReport, isInvoice, reportAttributes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action, iouReport, isInvoice, currentReportName]);

    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {canBeMissing: true});

    const hasReportBeenRetracted = hasReportBeenReopenedUtils(iouReport, reportActions) || hasReportBeenRetractedUtils(iouReport, reportActions);

    // The submit button should be success green color only if the user is submitter and the policy does not have Scheduled Submit turned on
    // Or if the report has been reopened or retracted
    const isWaitingForSubmissionFromCurrentUser = useMemo(() => {
        const isOwnAndReportHasBeenRetracted = isReportOwner(iouReport) && hasReportBeenRetracted;
        return isOwnAndReportHasBeenRetracted || isWaitingForSubmissionFromCurrentUserReportUtils(chatReport, policy);
    }, [chatReport, policy, hasReportBeenRetracted, iouReport]);

    const confirmPayment = useCallback(
        ({paymentType: selectedPaymentType, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
            if (!selectedPaymentType) {
                return;
            }
            setPaymentType(selectedPaymentType);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
                setIsHoldMenuVisible(true);
            } else if (chatReport && iouReport) {
                startAnimation();
                if (isInvoiceReportUtils(iouReport)) {
                    payInvoice({
                        paymentMethodType: selectedPaymentType,
                        chatReport,
                        invoiceReport: iouReport,
                        invoiceReportCurrentNextStepDeprecated: iouReportNextStep,
                        introSelected,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        payAsBusiness,
                        existingB2BInvoiceReport,
                        methodID,
                        paymentMethod,
                        activePolicy,
                    });
                } else {
                    payMoneyRequest({
                        paymentType: selectedPaymentType,
                        chatReport,
                        iouReport,
                        introSelected,
                        iouReportCurrentNextStepDeprecated: iouReportNextStep,
                        currentUserAccountID,
                        activePolicy,
                        policy,
                    });
                }
            }
        },
        [
            isDelegateAccessRestricted,
            iouReport,
            chatReport,
            showDelegateNoAccessModal,
            startAnimation,
            iouReportNextStep,
            introSelected,
            currentUserAccountID,
            currentUserEmail,
            existingB2BInvoiceReport,
            activePolicy,
            policy,
        ],
    );

    const confirmApproval = () => {
        if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
            setIsDEWModalVisible(true);
            return;
        }
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            startApprovedAnimation();
            approveMoneyRequest(iouReport, activePolicy, currentUserAccountID, currentUserEmail, hasViolations, isASAPSubmitBetaEnabled, iouReportNextStep, true);
        }
    };

    const previewMessage = useMemo(() => {
        if (isScanning) {
            return totalDisplaySpend ? `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('common.scanning')}` : `${translate('common.receipt')}`;
        }
        if (numberOfPendingRequests === 1 && numberOfRequests === 1) {
            return `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }
        if (shouldShowRTERViolationMessage) {
            return `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('iou.pendingMatch')}`;
        }

        let payerOrApproverName;
        if (isPolicyExpenseChat || isTripRoom) {
            payerOrApproverName = getPolicyName({report: chatReport, policy});
        } else if (isInvoiceRoom) {
            payerOrApproverName = getInvoicePayerName(chatReport, invoiceReceiverPolicy, invoiceReceiverPersonalDetail);
        } else {
            payerOrApproverName = getDisplayNameForParticipant({accountID: managerID, shouldUseShortForm: true, formatPhoneNumber});
        }

        if (isApproved) {
            return translate('iou.managerApproved', {manager: payerOrApproverName});
        }
        let paymentVerb: TranslationPaths = 'iou.payerOwes';
        if (iouSettled || iouReport?.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        } else if (hasNonReimbursableTransactions) {
            paymentVerb = 'iou.payerSpent';
            payerOrApproverName = getDisplayNameForParticipant({accountID: chatReport?.ownerAccountID, shouldUseShortForm: true, formatPhoneNumber});
        }
        return translate(paymentVerb, {payer: payerOrApproverName});
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
        iouReport?.isWaitingOnBankAccount,
        hasNonReimbursableTransactions,
        translate,
        totalDisplaySpend,
        chatReport,
        policy,
        invoiceReceiverPolicy,
        invoiceReceiverPersonalDetail,
        managerID,
        formatPhoneNumber,
    ]);

    /*
     Show subtitle if at least one of the expenses is not being smart scanned, and either:
     - There is more than one expense – in this case, the "X expenses, Y scanning" subtitle is shown;
     - There is only one expense, it has a receipt and is not being smart scanned – in this case, the expense merchant or description is shown;

     * There is an edge case when there is only one distance expense with a pending route and amount = 0.
       In this case, we don't want to show the merchant or description because it says: "Pending route...", which is already displayed in the amount field.
     */
    const expenseCount = useMemo(
        () =>
            translate('iou.expenseCount', {
                count: numberOfRequests,
            }),
        [translate, numberOfRequests],
    );

    const reportStatus = useMemo(
        () =>
            getReportStatusTranslation({
                stateNum: iouReport?.stateNum ?? action?.childStateNum,
                statusNum: iouReport?.statusNum ?? action?.childStatusNum,
                translate,
            }),
        [action?.childStateNum, action?.childStatusNum, iouReport?.stateNum, iouReport?.statusNum, translate],
    );

    const shouldShowReportStatus = !!reportStatus && !!expenseCount;

    const reportStatusColorStyle = useMemo(
        () => getReportStatusColorStyle(theme, iouReport?.stateNum ?? action?.childStateNum, iouReport?.statusNum ?? action?.childStatusNum),
        [action?.childStateNum, action?.childStatusNum, iouReport?.stateNum, iouReport?.statusNum, theme],
    );

    const totalAmountStyle = shouldUseNarrowLayout ? [styles.flexColumnReverse, styles.alignItemsStretch] : [styles.flexRow, styles.alignItemsCenter];

    useEffect(() => {
        if (!isPaidAnimationRunning || isApprovedAnimationRunning || isSubmittingAnimationRunning) {
            return;
        }

        previewMessageOpacity.set(
            withTiming(0.75, {duration: CONST.ANIMATION_PAID_DURATION / 2}, () => {
                previewMessageOpacity.set(withTiming(1, {duration: CONST.ANIMATION_PAID_DURATION / 2}));
            }),
        );
        // We only want to animate the text when the text changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewMessage, previewMessageOpacity]);

    useEffect(() => {
        if (!iouSettled) {
            return;
        }

        checkMarkScale.set(isPaidAnimationRunning ? withDelay(CONST.ANIMATION_PAID_CHECKMARK_DELAY, withSpring(1, {duration: CONST.ANIMATION_PAID_DURATION})) : 1);
    }, [isPaidAnimationRunning, iouSettled, checkMarkScale]);

    useEffect(() => {
        if (!isApproved) {
            return;
        }

        thumbsUpScale.set(isApprovedAnimationRunning ? withDelay(CONST.ANIMATION_THUMBS_UP_DELAY, withSpring(1, {duration: CONST.ANIMATION_THUMBS_UP_DURATION})) : 1);
    }, [isApproved, isApprovedAnimationRunning, thumbsUpScale]);

    const carouselTransactions = shouldShowAccessPlaceHolder ? [] : transactions.slice(0, 11);
    const prevCarouselTransactionLength = useRef(0);

    useEffect(() => {
        return () => {
            prevCarouselTransactionLength.current = carouselTransactions.length;
        };
    }, [carouselTransactions.length]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentVisibleItems, setCurrentVisibleItems] = useState([0]);
    const [footerWidth, setFooterWidth] = useState(0);
    // optimisticIndex - value for index we are scrolling to with an arrow button or undefined after scroll is completed
    // value ensures that disabled state is applied instantly and not overridden by onViewableItemsChanged when scrolling
    // undefined makes arrow buttons react on currentIndex changes when scrolling manually
    const [optimisticIndex, setOptimisticIndex] = useState<number | undefined>(undefined);
    const carouselRef = useRef<FlatList<Transaction> | null>(null);
    const visibleItemsOnEndCount = useMemo(() => {
        const lastItemWidth = transactions.length > 10 ? footerWidth : reportPreviewStyles.transactionPreviewCarouselStyle.width;
        const lastItemWithGap = lastItemWidth + styles.gap2.gap;
        const itemWithGap = reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.gap2.gap;
        return Math.floor((currentWidth - 2 * styles.pl2.paddingLeft - lastItemWithGap) / itemWithGap) + 1;
    }, [transactions.length, footerWidth, reportPreviewStyles.transactionPreviewCarouselStyle.width, styles.gap2.gap, styles.pl2.paddingLeft, currentWidth]);
    const viewabilityConfig = useMemo(() => {
        return {itemVisiblePercentThreshold: 100};
    }, []);

    const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        const newIndex = viewableItems.at(0)?.index;
        if (typeof newIndex === 'number') {
            setCurrentIndex(newIndex);
        }
        const viewableItemsIndexes = viewableItems.map((item) => item.index).filter((item): item is number => item !== null);
        setCurrentVisibleItems(viewableItemsIndexes);
    }).current;

    const handleChange = (index: number) => {
        if (index > carouselTransactions.length - visibleItemsOnEndCount) {
            setOptimisticIndex(carouselTransactions.length - visibleItemsOnEndCount);
            carouselRef.current?.scrollToIndex({index: carouselTransactions.length - visibleItemsOnEndCount, animated: true, viewOffset: 2 * styles.gap2.gap});
            return;
        }
        if (index < 0) {
            setOptimisticIndex(0);
            carouselRef.current?.scrollToIndex({index: 0, animated: true, viewOffset: 2 * styles.gap2.gap});
            return;
        }
        setOptimisticIndex(index);
        carouselRef.current?.scrollToIndex({index, animated: true, viewOffset: 2 * styles.gap2.gap});
    };

    const renderFlatlistItem = (itemInfo: ListRenderItemInfo<Transaction>) => {
        if (itemInfo.index > 9) {
            return (
                <View
                    style={[styles.flex1, styles.p5, styles.justifyContentCenter]}
                    onLayout={(e) => setFooterWidth(e.nativeEvent.layout.width)}
                >
                    <Text style={{color: colors.blue600}}>
                        +{transactions.length - 10} {translate('common.more').toLowerCase()}
                    </Text>
                </View>
            );
        }
        return renderTransactionItem(itemInfo);
    };

    // The button should expand up to transaction width
    const buttonMaxWidth =
        !shouldUseNarrowLayout && reportPreviewStyles.transactionPreviewCarouselStyle.width >= CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_WIDE_WIDTH
            ? {maxWidth: reportPreviewStyles.transactionPreviewCarouselStyle.width}
            : {};

    useEffect(() => {
        if (
            optimisticIndex === undefined ||
            optimisticIndex !== currentIndex ||
            // currentIndex is still the same as target (f.ex. 0), but not yet scrolled to the far left
            (currentVisibleItems.at(0) !== optimisticIndex && optimisticIndex !== undefined) ||
            // currentIndex reached, but not scrolled to the end
            (optimisticIndex === carouselTransactions.length - visibleItemsOnEndCount && currentVisibleItems.length !== visibleItemsOnEndCount)
        ) {
            return;
        }
        setOptimisticIndex(undefined);
    }, [carouselTransactions.length, currentIndex, currentVisibleItems, currentVisibleItems.length, optimisticIndex, visibleItemsOnEndCount]);

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID) {
            return;
        }
        Performance.markStart(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${iouReportID}`, {
            name: 'MoneyRequestReportPreviewContent',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });
        // Small screens navigate to full report view since super wide RHP
        // is not available on narrow layouts and would break the navigation logic.
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo: Navigation.getActiveRoute()}));
        }
    }, [iouReportID, isSmallScreenWidth]);

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    const isDEWSubmitPending = hasPendingDEWSubmit(iouReportMetadata, isDEWPolicy);
    const reportPreviewAction = useMemo(() => {
        return getReportPreviewAction({
            isReportArchived: isIouReportArchived || isChatReportArchived,
            currentUserAccountID: currentUserDetails.accountID,
            currentUserLogin: currentUserDetails.login ?? '',
            report: iouReport,
            policy,
            transactions,
            bankAccountList,
            invoiceReceiverPolicy,
            isPaidAnimationRunning,
            isApprovedAnimationRunning,
            isSubmittingAnimationRunning,
            isDEWSubmitPending,
            violationsData: transactionViolations,
        });
    }, [
        bankAccountList,
        isIouReportArchived,
        isChatReportArchived,
        currentUserDetails.accountID,
        currentUserDetails.login,
        iouReport,
        policy,
        transactions,
        invoiceReceiverPolicy,
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
        transactionViolations,
        isDEWSubmitPending,
    ]);

    const addExpenseDropdownOptions = useMemo(
        () => getAddExpenseDropdownOptions(expensifyIcons, iouReport?.reportID, policy, chatReportID, iouReport?.parentReportID, lastDistanceExpenseType),
        [chatReportID, iouReport?.parentReportID, iouReport?.reportID, policy, lastDistanceExpenseType, expensifyIcons],
    );

    const isReportDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const formattedAmount = getTotalAmountForIOUReportPreviewButton(iouReport, policy, reportPreviewAction);

    const reportPreviewActions = {
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT]: (
            <AnimatedSubmitButton
                success={isWaitingForSubmissionFromCurrentUser}
                text={translate('common.submit')}
                onPress={() => {
                    if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
                        setIsDEWModalVisible(true);
                        return;
                    }
                    startSubmittingAnimation();
                    submitReport(iouReport, policy, currentUserAccountID, currentUserEmail, hasViolations, isASAPSubmitBetaEnabled, iouReportNextStep);
                }}
                isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                onAnimationFinish={stopAnimation}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.SUBMIT_BUTTON}
            />
        ),
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE]: (
            <Button
                text={translate('iou.approve')}
                success
                onPress={() => confirmApproval()}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.APPROVE_BUTTON}
            />
        ),
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY]: (
            <AnimatedSettlementButton
                onlyShowPayElsewhere={shouldShowOnlyPayElsewhere}
                isPaidAnimationRunning={isPaidAnimationRunning}
                isApprovedAnimationRunning={isApprovedAnimationRunning}
                canIOUBePaid={canIOUBePaidAndApproved || isPaidAnimationRunning}
                onAnimationFinish={stopAnimation}
                chatReportID={chatReportID}
                policyID={policy?.id}
                iouReport={iouReport}
                currency={iouReport?.currency}
                wrapperStyle={buttonMaxWidth}
                onPress={confirmPayment}
                onPaymentOptionsShow={onPaymentOptionsShow}
                onPaymentOptionsHide={onPaymentOptionsHide}
                formattedAmount={formattedAmount}
                confirmApproval={confirmApproval}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                shouldHidePaymentOptions={!shouldShowPayButton}
                kycWallAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                paymentMethodDropdownAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                isDisabled={isOffline && !canAllowSettlement}
                isLoading={!isOffline && !canAllowSettlement}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.PAY_BUTTON}
            />
        ),
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING]: connectedIntegration ? (
            <ExportWithDropdownMenu
                report={iouReport}
                reportActions={reportActions}
                connectionName={connectedIntegration}
                wrapperStyle={styles.flexReset}
                dropdownAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.EXPORT_BUTTON}
            />
        ) : null,
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW]: (
            <Button
                text={translate('common.view')}
                onPress={() => {
                    openReportFromPreview();
                }}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.VIEW_BUTTON}
            />
        ),
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE]: (
            <ButtonWithDropdownMenu
                onPress={() => {}}
                shouldAlwaysShowDropdownMenu
                customText={translate('iou.addExpense')}
                options={addExpenseDropdownOptions}
                isSplitButton={false}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.ADD_EXPENSE_BUTTON}
            />
        ),
    };

    const adjustScroll = useCallback(() => {
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        if (carouselTransactions.length >= prevCarouselTransactionLength.current || !shouldAdjustScroll) {
            return;
        }
        prevCarouselTransactionLength.current = carouselTransactions.length;
        carouselRef.current?.scrollToEnd();
    }, [carouselTransactions.length]);

    return (
        <View
            onLayout={onWrapperLayout}
            testID="MoneyRequestReportPreviewContent-wrapper"
            fsClass={forwardedFSClass}
        >
            <OfflineWithFeedback
                pendingAction={iouReport?.pendingFields?.preview}
                shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
                needsOffscreenAlphaCompositing
                style={styles.mt1}
            >
                <View
                    style={[styles.chatItemMessage, isReportDeleted && [styles.cursorDisabled, styles.pointerEventsAuto], containerStyles]}
                    onLayout={onCarouselLayout}
                    testID="carouselWidthSetter"
                >
                    <PressableWithoutFeedback
                        onPress={onPress}
                        onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={() => ControlSelection.unblock()}
                        onLongPress={(event) => {
                            if (!shouldDisplayContextMenu) {
                                return;
                            }
                            showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive);
                        }}
                        shouldUseHapticsOnLongPress
                        style={[
                            styles.flexRow,
                            styles.justifyContentBetween,
                            StyleUtils.getBackgroundColorStyle(theme.cardBG),
                            shouldShowBorder ? styles.borderedContentCardLarge : styles.reportContainerBorderRadius,
                            isReportDeleted && styles.pointerEventsNone,
                        ]}
                        role={getButtonRole(true)}
                        isNested
                        accessibilityLabel={translate('iou.viewDetails')}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CARD}
                    >
                        <View
                            style={[
                                StyleUtils.getBackgroundColorStyle(theme.cardBG),
                                styles.reportContainerBorderRadius,
                                styles.w100,
                                (isHovered || isScanning || isWhisper) && styles.reportPreviewBoxHoverBorder,
                            ]}
                        >
                            <View style={[reportPreviewStyles.wrapperStyle]}>
                                <View style={[reportPreviewStyles.contentContainerStyle, styles.gap4]}>
                                    <View style={[styles.expenseAndReportPreviewTextContainer, styles.overflowHidden]}>
                                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.flexShrink1, styles.gap1]}>
                                            <View style={[styles.flexColumn, styles.gap1, styles.flexShrink1]}>
                                                <View style={[styles.flexRow, styles.mw100, styles.flexShrink1]}>
                                                    <Animated.View style={[styles.flexRow, styles.alignItemsCenter, previewMessageStyle, styles.flexShrink1]}>
                                                        <Text
                                                            style={[styles.headerText]}
                                                            testID="MoneyRequestReportPreview-reportName"
                                                        >
                                                            {reportPreviewName}
                                                        </Text>
                                                    </Animated.View>
                                                </View>
                                                {showStatusAndSkeleton && shouldShowSkeleton ? (
                                                    <MoneyReportHeaderStatusBarSkeleton />
                                                ) : (
                                                    (!shouldShowEmptyPlaceholder || shouldShowAccessPlaceHolder) &&
                                                    (shouldShowReportStatus || !shouldShowAccessPlaceHolder) && (
                                                        <View style={[styles.flexRow, styles.justifyContentStart, styles.alignItemsCenter]}>
                                                            {shouldShowReportStatus && (
                                                                <View
                                                                    style={[
                                                                        styles.reportStatusContainer,
                                                                        styles.mr1,
                                                                        {
                                                                            backgroundColor: reportStatusColorStyle?.backgroundColor,
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Text style={[styles.reportStatusText, {color: reportStatusColorStyle?.textColor}]}>{reportStatus}</Text>
                                                                </View>
                                                            )}
                                                            {!shouldShowAccessPlaceHolder && <Text style={[styles.textLabelSupporting, styles.lh16]}>{expenseCount}</Text>}
                                                        </View>
                                                    )
                                                )}
                                            </View>
                                            {!shouldUseNarrowLayout && !shouldShowAccessPlaceHolder && transactions.length > 2 && reportPreviewStyles.expenseCountVisible && (
                                                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                                    <PressableWithFeedback
                                                        accessibilityRole="button"
                                                        accessible
                                                        accessibilityLabel="button"
                                                        style={[styles.reportPreviewArrowButton, {backgroundColor: theme.buttonDefaultBG}]}
                                                        onPress={() => handleChange(currentIndex - 1)}
                                                        disabled={optimisticIndex !== undefined ? optimisticIndex === 0 : currentIndex === 0 && currentVisibleItems.at(0) === 0}
                                                        disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                                                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_PREVIOUS}
                                                    >
                                                        <Icon
                                                            src={expensifyIcons.BackArrow}
                                                            small
                                                            fill={theme.icon}
                                                            isButtonIcon
                                                        />
                                                    </PressableWithFeedback>
                                                    <PressableWithFeedback
                                                        accessibilityRole="button"
                                                        accessible
                                                        accessibilityLabel="button"
                                                        style={[styles.reportPreviewArrowButton, {backgroundColor: theme.buttonDefaultBG}]}
                                                        onPress={() => handleChange(currentIndex + 1)}
                                                        disabled={
                                                            optimisticIndex
                                                                ? optimisticIndex + visibleItemsOnEndCount >= carouselTransactions.length
                                                                : currentVisibleItems.at(-1) === carouselTransactions.length - 1
                                                        }
                                                        disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                                                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_NEXT}
                                                    >
                                                        <Icon
                                                            src={expensifyIcons.ArrowRight}
                                                            small
                                                            fill={theme.icon}
                                                            isButtonIcon
                                                        />
                                                    </PressableWithFeedback>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {!currentWidth || shouldShowLoading || shouldShowLoadingDeferred ? (
                                        <View
                                            style={[
                                                {
                                                    height: CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_HEIGHT,
                                                    minWidth: shouldUseNarrowLayout
                                                        ? CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_NARROW_WIDTH
                                                        : CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_WIDE_WIDTH,
                                                },
                                                styles.justifyContentCenter,
                                                styles.mtn1,
                                            ]}
                                        >
                                            <ActivityIndicator size={40} />
                                        </View>
                                    ) : (
                                        <View style={[styles.flex1, styles.flexColumn, styles.overflowVisible]}>
                                            <FlashList
                                                snapToAlignment="start"
                                                decelerationRate="fast"
                                                snapToInterval={reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.gap2.gap}
                                                horizontal
                                                data={carouselTransactions}
                                                ref={carouselRef as ForwardedRef<FlashListRef<Transaction>>}
                                                nestedScrollEnabled
                                                bounces={false}
                                                keyExtractor={(item) => `${item.transactionID}_${reportPreviewStyles.transactionPreviewCarouselStyle.width}`}
                                                ItemSeparatorComponent={ItemSeparatorComponent}
                                                style={reportPreviewStyles.flatListStyle}
                                                showsHorizontalScrollIndicator={false}
                                                // @ts-expect-error type mismatch to be fixed
                                                renderItem={renderFlatlistItem}
                                                onViewableItemsChanged={onViewableItemsChanged}
                                                onEndReached={adjustScroll}
                                                viewabilityConfig={viewabilityConfig}
                                                ListFooterComponent={<View style={styles.pl2} />}
                                                ListHeaderComponent={<View style={styles.pr2} />}
                                            />
                                            {shouldShowAccessPlaceHolder && <AccessMoneyRequestReportPreviewPlaceHolder />}
                                            {shouldShowEmptyPlaceholder && !shouldShowAccessPlaceHolder && <EmptyMoneyRequestReportPreview />}
                                        </View>
                                    )}
                                    <View style={[styles.expenseAndReportPreviewTextContainer]}>
                                        <View style={[totalAmountStyle, styles.justifyContentBetween, styles.gap4, StyleUtils.getMinimumHeight(variables.h28)]}>
                                            {/* height is needed to avoid flickering on animation */}
                                            <View style={[buttonMaxWidth, styles.flex1, {height: variables.h40}]}>{reportPreviewActions[reportPreviewAction]}</View>
                                            {transactions.length > 1 && !shouldShowAccessPlaceHolder && (
                                                <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.justifyContentBetween : styles.gap2, styles.alignItemsCenter]}>
                                                    <Text
                                                        style={[styles.textLabelSupporting]}
                                                        numberOfLines={1}
                                                    >
                                                        {translate('common.total')}
                                                    </Text>
                                                    <Text style={[styles.headerText]}>{convertToDisplayString(totalDisplaySpend, iouReport?.currency)}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </PressableWithoutFeedback>
                </View>
                {isHoldMenuVisible && !!iouReport && !!requestType && (
                    <ProcessMoneyReportHoldMenu
                        nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                        requestType={requestType}
                        fullAmount={fullAmount}
                        onClose={() => setIsHoldMenuVisible(false)}
                        isVisible={isHoldMenuVisible}
                        paymentType={paymentType}
                        chatReport={chatReport}
                        moneyRequestReport={iouReport}
                        transactionCount={numberOfRequests}
                        startAnimation={() => {
                            if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                                startApprovedAnimation();
                            } else {
                                startAnimation();
                            }
                        }}
                    />
                )}
            </OfflineWithFeedback>
            <ConfirmModal
                title={translate('customApprovalWorkflow.title')}
                isVisible={isDEWModalVisible}
                onConfirm={() => {
                    setIsDEWModalVisible(false);
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                }}
                onCancel={() => setIsDEWModalVisible(false)}
                prompt={translate('customApprovalWorkflow.description')}
                confirmText={translate('customApprovalWorkflow.goToExpensifyClassic')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

export default MoneyRequestReportPreviewContent;
