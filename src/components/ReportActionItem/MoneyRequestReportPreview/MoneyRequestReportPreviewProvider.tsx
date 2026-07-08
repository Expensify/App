import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';

import useOnyx from '@hooks/useOnyx';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils,
    getMoneyRequestSpendBreakdown,
    getTransactionsWithReceipts,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    isInvoiceRoom as isInvoiceRoomReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isReportApproved,
    isSettled,
    isTripRoom as isTripRoomReportUtils,
} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {hasPendingUI, isManagedCardTransaction, isPending} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ListRenderItem} from '@shopify/flash-list';
import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useDeferredValue, useState} from 'react';

import type {MoneyRequestReportPreviewStyleType} from './types';

import {
    ReportPreviewActionsContext,
    ReportPreviewActionStateContext,
    ReportPreviewAnimationStateContext,
    ReportPreviewCarouselListContext,
    ReportPreviewCarouselStateContext,
    ReportPreviewDataContext,
    ReportPreviewHoldMenuContext,
    ReportPreviewMetaContext,
    ReportPreviewUIStateContext,
} from './MoneyRequestReportPreviewContext';
import usePreviewMessageAnimation from './usePreviewMessageAnimation';
import useReportPreviewActionDecision from './useReportPreviewActionDecision';
import useReportPreviewCarousel from './useReportPreviewCarousel';

type MoneyRequestReportPreviewProviderProps = ChildrenProps & {
    iouReportID: string | undefined;
    chatReportID: string | undefined;
    action: ReportAction;
    iouReport: OnyxEntry<Report>;
    chatReport: OnyxEntry<Report>;
    transactions: Transaction[];
    allReportTransactions: Transaction[];
    policy: OnyxEntry<Policy>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails> | null;
    lastTransactionViolations: TransactionViolations;
    onPaymentOptionsShow?: () => void;
    onPaymentOptionsHide?: () => void;
    renderTransactionItem: ListRenderItem<Transaction>;
    currentWidth: number;
    reportPreviewStyles: MoneyRequestReportPreviewStyleType;
    newTransactionIDs?: Set<string>;
};

/**
 * Owns all state/derivations for a money request report preview once and exposes them through the context slices.
 * Mirrors `ReportActionCompose`'s `ComposerProvider`. Report entities arrive as (stabilized) props from `index.tsx`;
 * this provider only adds derivations + local UI state (loading flags, animations, carousel, message animation, refs).
 */
function MoneyRequestReportPreviewProvider({
    children,
    iouReportID,
    chatReportID,
    action,
    iouReport,
    chatReport,
    transactions,
    allReportTransactions,
    policy,
    invoiceReceiverPolicy,
    invoiceReceiverPersonalDetail,
    lastTransactionViolations,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    renderTransactionItem,
    currentWidth,
    reportPreviewStyles,
    newTransactionIDs,
}: MoneyRequestReportPreviewProviderProps) {
    const [chatReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`);
    const [chatReportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${chatReportID}`);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();

    const [isTransitionPending, setIsTransitionPending] = useState(() => {
        const pending = getPendingSubmitFollowUpAction();
        return pending?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT && (pending?.reportID === chatReportID || pending?.reportID === iouReportID);
    });
    const [holdMenu, setHoldMenu] = useState<{
        requestType: ActionHandledType;
        paymentType: PaymentMethodType | undefined;
        canPay: boolean;
        methodID: number | undefined;
    } | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!isTransitionPending) {
                return;
            }
            const handle = TransitionTracker.runAfterTransitions({
                callback: () => setIsTransitionPending(false),
                waitForUpcomingTransition: true,
            });
            return () => handle.cancel();
        }, [isTransitionPending]),
    );

    const shouldShowLoading =
        chatReportLoadingState != null && chatReportLoadingState.hasOnceLoadedReportActions !== true && transactions.length === 0 && !chatReportMetadata?.isOptimisticReport;
    const [transactionViolations] = useReportTransactionViolations(transactions);
    // `hasOnceLoadedReportActions` becomes true before transactions populate fully,
    // so we defer the loading state update to ensure transactions are loaded
    const shouldShowLoadingDeferred = useDeferredValue(shouldShowLoading);
    const lastTransaction = transactions?.at(0);
    const shouldShowSkeleton = shouldShowLoading && transactions.length === 0;
    const shouldShowAccessPlaceHolder = !iouReport && !shouldShowLoading;
    const shouldShowEmptyPlaceholder = transactions.length === 0 && !shouldShowLoading;
    const shouldShowPreviewPlaceholder = shouldShowAccessPlaceHolder || shouldShowEmptyPlaceholder;
    const showStatusAndSkeleton = !shouldShowEmptyPlaceholder;
    // Empty/access placeholders do not depend on measured carousel width, so we can show them immediately
    // once the report data is ready instead of keeping the taller loading state around and causing the preview to reflow.
    const shouldShowPreviewLoading = isTransitionPending || shouldShowLoading || shouldShowLoadingDeferred || (!currentWidth && !shouldShowPreviewPlaceholder);
    const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyRequestReportPreviewContent',
        hasOnceLoadedReportActions: chatReportLoadingState?.hasOnceLoadedReportActions,
        isTransactionsEmpty: transactions.length === 0,
        isOptimisticReport: chatReportMetadata?.isOptimisticReport,
    };
    const carouselReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyRequestReportPreviewContent.Carousel',
        hasCurrentWidth: !!currentWidth,
        shouldShowLoading,
        shouldShowLoadingDeferred,
    };
    const previewCarouselMinWidth = shouldUseNarrowLayout ? CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_NARROW_WIDTH : CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_WIDE_WIDTH;

    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, stopAnimation, startAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();

    const managerID = iouReport?.managerID ?? action.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(iouReport);

    const iouSettled = isSettled(iouReportID) || action?.childStatusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const isApproved = isReportApproved({
        report: iouReport,
        parentReportAction: action,
    });

    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(chatReport);
    const isInvoiceRoom = isInvoiceRoomReportUtils(chatReport);
    const isTripRoom = isTripRoomReportUtils(chatReport);

    const numberOfRequests = transactions?.length ?? 0;
    // Pass the reactive `allReportTransactions` list (the full set, matching `getReportTransactions`) into these
    // ReportUtils helpers rather than letting them read from Onyx by ID. This keeps the derivation logic in one place,
    // preserves the pre-decomposition behavior (including optimistically-deleted rows), and lets React Compiler
    // recompute these values when the report's transactions change.
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID, allReportTransactions);
    const numberOfPendingRequests = transactionsWithReceipts.filter((transaction) => isPending(transaction) && isManagedCardTransaction(transaction)).length;
    const hasNonReimbursableTransactions = hasNonReimbursableTransactionsReportUtils(iouReportID, allReportTransactions);
    const areAllRequestsBeingSmartScanned = areAllRequestsBeingSmartScannedReportUtils(iouReportID, action, allReportTransactions);

    const shouldShowRTERViolationMessage = numberOfRequests === 1 && hasPendingUI(lastTransaction, lastTransactionViolations);

    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;

    const {previewMessageStyle} = usePreviewMessageAnimation({
        isScanning,
        numberOfPendingRequests,
        numberOfRequests,
        shouldShowRTERViolationMessage,
        isPolicyExpenseChat,
        isTripRoom,
        isInvoiceRoom,
        isApproved,
        iouSettled,
        iouReport,
        hasNonReimbursableTransactions,
        totalDisplaySpend,
        chatReport,
        policy,
        invoiceReceiverPolicy,
        invoiceReceiverPersonalDetail,
        managerID,
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
    });

    const {setCarouselRef, goToPrevious, goToNext, isPreviousDisabled, isNextDisabled, ...carouselList} = useReportPreviewCarousel({
        transactions,
        transactionViolations,
        iouReport,
        policy,
        shouldShowAccessPlaceHolder,
        reportPreviewStyles,
        currentWidth,
        newTransactionIDs,
        renderTransactionItem,
    });

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID) {
            return;
        }
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${iouReportID}`, {
            name: 'MoneyRequestReportPreviewContent',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });
        // Small screens navigate to full report view since super wide RHP
        // is not available on narrow layouts and would break the navigation logic.
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(
                ROUTES.EXPENSE_REPORT_RHP.getRoute({
                    reportID: iouReportID,
                    backTo: Navigation.getActiveRoute(),
                }),
            );
        }
    }, [iouReportID, isSmallScreenWidth]);

    const onHoldMenuOpen = useCallback((requestType: string, paymentType?: PaymentMethodType, canPay?: boolean, methodID?: number) => {
        if (requestType !== CONST.IOU.REPORT_ACTION_TYPE.PAY && requestType !== CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            return;
        }
        setHoldMenu({requestType, paymentType, canPay: !!canPay, methodID});
    }, []);
    const onHoldMenuClose = useCallback(() => setHoldMenu(null), []);

    const shouldShowCarouselArrows = !shouldUseNarrowLayout && !shouldShowAccessPlaceHolder && transactions.length > 2 && reportPreviewStyles.expenseCountVisible;
    const buttonMaxWidth =
        !shouldUseNarrowLayout && reportPreviewStyles.transactionPreviewCarouselStyle.width >= CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_WIDE_WIDTH
            ? {maxWidth: reportPreviewStyles.transactionPreviewCarouselStyle.width}
            : {};

    const actionStateValue = useReportPreviewActionDecision({
        iouReportID,
        chatReportID,
        iouReport,
        chatReport,
        policy,
        invoiceReceiverPolicy,
        transactions,
        transactionViolations,
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
    });

    const dataValue = {iouReportID, chatReportID, action, iouReport, chatReport, transactions, policy, invoiceReceiverPolicy, invoiceReceiverPersonalDetail};
    const uiStateValue = {
        isTransitionPending,
        shouldShowPreviewLoading,
        shouldShowAccessPlaceHolder,
        shouldShowEmptyPlaceholder,
        shouldShowSkeleton,
        showStatusAndSkeleton,
        shouldShowCarouselArrows,
        isScanning,
        previewCarouselMinWidth,
        skeletonReasonAttributes,
        carouselReasonAttributes,
        previewMessageStyle,
        reportPreviewStyles,
        buttonMaxWidth,
    };
    const animationStateValue = {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning};
    const carouselStateValue = {isPreviousDisabled, isNextDisabled};
    const actionsValue = {
        openReportFromPreview,
        onHoldMenuOpen,
        onHoldMenuClose,
        onPaymentOptionsShow,
        onPaymentOptionsHide,
        stopAnimation,
        startAnimation,
        startApprovedAnimation,
        startSubmittingAnimation,
        goToPrevious,
        goToNext,
    };
    const metaValue = {setCarouselRef};

    return (
        <ReportPreviewDataContext.Provider value={dataValue}>
            <ReportPreviewUIStateContext.Provider value={uiStateValue}>
                <ReportPreviewCarouselStateContext.Provider value={carouselStateValue}>
                    <ReportPreviewAnimationStateContext.Provider value={animationStateValue}>
                        <ReportPreviewCarouselListContext.Provider value={carouselList}>
                            <ReportPreviewActionStateContext.Provider value={actionStateValue}>
                                <ReportPreviewActionsContext.Provider value={actionsValue}>
                                    <ReportPreviewHoldMenuContext.Provider value={holdMenu}>
                                        <ReportPreviewMetaContext.Provider value={metaValue}>{children}</ReportPreviewMetaContext.Provider>
                                    </ReportPreviewHoldMenuContext.Provider>
                                </ReportPreviewActionsContext.Provider>
                            </ReportPreviewActionStateContext.Provider>
                        </ReportPreviewCarouselListContext.Provider>
                    </ReportPreviewAnimationStateContext.Provider>
                </ReportPreviewCarouselStateContext.Provider>
            </ReportPreviewUIStateContext.Provider>
        </ReportPreviewDataContext.Provider>
    );
}

export default MoneyRequestReportPreviewProvider;
