import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import MoneyReportHeaderStatusBarSkeleton from '@components/MoneyReportHeaderStatusBarSkeleton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import StatusBadge from '@components/StatusBadge';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getReportStatusColorStyle,
    getReportStatusTooltipTranslation,
    getReportStatusTranslation,
    getTransactionsWithReceipts,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasOnlyTransactionsWithPendingRoutes as hasOnlyTransactionsWithPendingRoutesReportUtils,
    isInvoiceRoom as isInvoiceRoomReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isReportApproved,
    isSettled,
    isTripRoom as isTripRoomReportUtils,
} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {hasPendingUI, isPending} from '@libs/TransactionUtils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {transactionViolationsByIDsSelector} from '@src/selectors/TransactionViolations';
import type {ReportAttributesDerivedValue, TransactionViolations} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import {reportNameSelector} from '@selectors/ReportAttributes';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useDeferredValue, useMemo, useState} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import type {MoneyRequestReportPreviewContentProps} from './types';

import AccessMoneyRequestReportPreviewPlaceHolder from './AccessMoneyRequestReportPreviewPlaceHolder';
import EmptyMoneyRequestReportPreview from './EmptyMoneyRequestReportPreview';
import ReportPreviewActionButton from './ReportPreviewActionButton';
import usePreviewMessageAnimation from './usePreviewMessageAnimation';
import useReportPreviewCarousel from './useReportPreviewCarousel';

function MoneyRequestReportPreviewContent({
    iouReportID,
    newTransactionIDs,
    chatReportID,
    action,
    containerStyles,
    isHovered = false,
    isWhisper = false,
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
    shouldShowBorder = false,
    onPress,
    forwardedFSClass,
}: MoneyRequestReportPreviewContentProps) {
    const {anchor: contextMenuAnchorRef, shouldDisplayContextMenu = true, originalReportID} = useShowContextMenuState();
    const {checkIfContextMenuActive} = useShowContextMenuActions();
    const [chatReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`);
    const [chatReportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${chatReportID}`);

    const [isTransitionPending, setIsTransitionPending] = useState(() => {
        const pending = getPendingSubmitFollowUpAction();
        return pending?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT && (pending?.reportID === chatReportID || pending?.reportID === iouReportID);
    });

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
    const transactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const selectTransactionViolations = useCallback(
        (allViolations: OnyxCollection<TransactionViolations>) => transactionViolationsByIDsSelector(transactionIDs)(allViolations),
        [transactionIDs],
    );
    // Pass `transactionIDs` as a dependency so the selector re-runs once the transactions hydrate (otherwise
    // it stays closed over the initial empty list and violations would never be selected on first load).
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: selectTransactionViolations}, [transactionIDs]);
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
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const previewCarouselMinWidth = shouldUseNarrowLayout ? CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_NARROW_WIDTH : CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_WIDE_WIDTH;
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);

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
    const [methodID, setMethodID] = useState<number>();
    const [shouldShowPayButton, setShouldShowPayButton] = useState(false);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(transactions);

    const handleHoldMenuOpen = (holdRequestType: string, holdPaymentType?: PaymentMethodType, canPay?: boolean, holdMethodID?: number) => {
        setRequestType(holdRequestType as ActionHandledType);
        setPaymentType(holdPaymentType);
        setMethodID(holdMethodID);
        setShouldShowPayButton(!!canPay);
        setIsHoldMenuVisible(true);
    };

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
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    const numberOfPendingRequests = transactionsWithReceipts.filter((transaction) => isPending(transaction)).length;

    const shouldShowRTERViolationMessage = numberOfRequests === 1 && hasPendingUI(lastTransaction, lastTransactionViolations);

    const selectReportName = useCallback((attributes: OnyxEntry<ReportAttributesDerivedValue>) => reportNameSelector(attributes, iouReportID), [iouReportID]);
    const [derivedReportName] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: selectReportName,
    });
    const reportName = derivedReportName ?? iouReport?.reportName ?? '';

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

    const reportStateNum = iouReport?.stateNum ?? action?.childStateNum;
    const reportStatusNum = iouReport?.statusNum ?? action?.childStatusNum;

    const reportStatus = useMemo(
        () =>
            getReportStatusTranslation({
                stateNum: reportStateNum,
                statusNum: reportStatusNum,
                translate,
            }),
        [reportStateNum, reportStatusNum, translate],
    );

    const shouldShowReportStatus = !!reportStatus && !!expenseCount;

    const reportStatusColorStyle = useMemo(() => getReportStatusColorStyle(theme, reportStateNum, reportStatusNum), [reportStateNum, reportStatusNum, theme]);

    const reportStatusTooltip = useMemo(
        () =>
            getReportStatusTooltipTranslation({
                stateNum: reportStateNum,
                statusNum: reportStatusNum,
                translate,
            }),
        [reportStateNum, reportStatusNum, translate],
    );

    const totalAmountStyle = shouldUseNarrowLayout ? [styles.flexColumnReverse, styles.alignItemsStretch] : [styles.flexRow, styles.alignItemsCenter];

    const {
        carouselTransactions,
        carouselKey,
        setCarouselRef,
        snapOffsets,
        renderItem,
        getItemType,
        renderSeparator,
        viewabilityConfig,
        onViewableItemsChanged,
        adjustScroll,
        goToPrevious,
        goToNext,
        isPreviousDisabled,
        isNextDisabled,
    } = useReportPreviewCarousel({
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

    const isReportDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    let previewContent: React.ReactNode;

    if (shouldShowPreviewLoading) {
        previewContent = (
            <View
                style={[
                    {
                        height: CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_HEIGHT,
                        minWidth: previewCarouselMinWidth,
                    },
                    styles.justifyContentCenter,
                    styles.mtn1,
                ]}
            >
                <ActivityIndicator
                    size={40}
                    reasonAttributes={carouselReasonAttributes}
                />
            </View>
        );
    } else if (shouldShowAccessPlaceHolder) {
        previewContent = <AccessMoneyRequestReportPreviewPlaceHolder />;
    } else if (shouldShowEmptyPlaceholder) {
        previewContent = <EmptyMoneyRequestReportPreview />;
    } else {
        previewContent = (
            <View style={[styles.flex1, styles.flexColumn, styles.overflowVisible, styles.minHeight42]}>
                <FlashList
                    key={carouselKey}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    snapToOffsets={snapOffsets}
                    horizontal
                    ItemSeparatorComponent={renderSeparator}
                    data={carouselTransactions}
                    ref={setCarouselRef}
                    nestedScrollEnabled
                    bounces={false}
                    keyExtractor={(item) => `${item.transactionID}_${reportPreviewStyles.transactionPreviewCarouselStyle.width}`}
                    contentContainerStyle={styles.ph2}
                    style={reportPreviewStyles.flatListStyle}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                    getItemType={getItemType}
                    onViewableItemsChanged={onViewableItemsChanged}
                    onEndReached={adjustScroll}
                    viewabilityConfig={viewabilityConfig}
                    ListFooterComponent={<View style={styles.pl2} />}
                    ListHeaderComponent={<View style={styles.pr2} />}
                    drawDistance={1000}
                />
            </View>
        );
    }

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
                    style={[styles.chatItemMessage, isReportDeleted && [styles.cursorDisabled, styles.pointerEventsAuto], containerStyles, isTransitionPending && styles.w100]}
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
                            showContextMenuForReport(event, contextMenuAnchorRef, chatReportID, action, checkIfContextMenuActive, originalReportID);
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
                                                            {reportName || action.childReportName}
                                                        </Text>
                                                    </Animated.View>
                                                </View>
                                                {showStatusAndSkeleton && shouldShowSkeleton ? (
                                                    <MoneyReportHeaderStatusBarSkeleton reasonAttributes={skeletonReasonAttributes} />
                                                ) : (
                                                    (!shouldShowEmptyPlaceholder || shouldShowAccessPlaceHolder) &&
                                                    (shouldShowReportStatus || !shouldShowAccessPlaceHolder) && (
                                                        <View style={[styles.flexRow, styles.justifyContentStart, styles.alignItemsCenter]}>
                                                            {shouldShowReportStatus && (
                                                                <StatusBadge
                                                                    text={reportStatus}
                                                                    backgroundColor={reportStatusColorStyle?.backgroundColor}
                                                                    textColor={reportStatusColorStyle?.textColor}
                                                                    badgeStyles={styles.mr1}
                                                                    tooltipText={reportStatusTooltip}
                                                                />
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
                                                        accessibilityLabel={translate('common.previous')}
                                                        style={[styles.reportPreviewArrowButton, {backgroundColor: theme.buttonDefaultBG}]}
                                                        onPress={goToPrevious}
                                                        disabled={isPreviousDisabled}
                                                        disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                                                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_PREVIOUS}
                                                    >
                                                        <Icon
                                                            src={expensifyIcons.BackArrow}
                                                            fill={theme.icon}
                                                            width={variables.iconSizeExtraSmall}
                                                            height={variables.iconSizeExtraSmall}
                                                        />
                                                    </PressableWithFeedback>
                                                    <PressableWithFeedback
                                                        accessibilityRole="button"
                                                        accessible
                                                        accessibilityLabel={translate('common.next')}
                                                        style={[styles.reportPreviewArrowButton, {backgroundColor: theme.buttonDefaultBG}]}
                                                        onPress={goToNext}
                                                        disabled={isNextDisabled}
                                                        disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                                                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_NEXT}
                                                    >
                                                        <Icon
                                                            src={expensifyIcons.ArrowRight}
                                                            fill={theme.icon}
                                                            width={variables.iconSizeExtraSmall}
                                                            height={variables.iconSizeExtraSmall}
                                                        />
                                                    </PressableWithFeedback>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {previewContent}
                                    <View style={[styles.expenseAndReportPreviewTextContainer]}>
                                        <View style={[totalAmountStyle, styles.justifyContentBetween, styles.gap4, StyleUtils.getMinimumHeight(variables.h28)]}>
                                            <ReportPreviewActionButton
                                                iouReportID={iouReportID}
                                                chatReportID={chatReportID}
                                                chatReport={chatReport}
                                                iouReport={iouReport}
                                                isPaidAnimationRunning={isPaidAnimationRunning}
                                                isApprovedAnimationRunning={isApprovedAnimationRunning}
                                                isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                                                stopAnimation={stopAnimation}
                                                startAnimation={startAnimation}
                                                startApprovedAnimation={startApprovedAnimation}
                                                startSubmittingAnimation={startSubmittingAnimation}
                                                onPaymentOptionsShow={onPaymentOptionsShow}
                                                onPaymentOptionsHide={onPaymentOptionsHide}
                                                openReportFromPreview={openReportFromPreview}
                                                onHoldMenuOpen={handleHoldMenuOpen}
                                                transactionPreviewCarouselWidth={reportPreviewStyles.transactionPreviewCarouselStyle.width}
                                            />
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
                {isHoldMenuVisible &&
                    !!iouReport &&
                    !!requestType &&
                    (() => {
                        const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, shouldShowPayButton, transactions);
                        return (
                            <ProcessMoneyReportHoldMenu
                                nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                                requestType={requestType}
                                fullAmount={fullAmount}
                                onClose={() => setIsHoldMenuVisible(false)}
                                isVisible={isHoldMenuVisible}
                                paymentType={paymentType}
                                methodID={methodID}
                                chatReport={chatReport}
                                moneyRequestReport={iouReport}
                                transactionCount={numberOfRequests}
                                hasNonHeldExpenses={!hasOnlyHeldExpenses}
                                onConfirm={() => {
                                    if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                                        startApprovedAnimation();
                                    } else {
                                        startAnimation();
                                    }
                                }}
                            />
                        );
                    })()}
            </OfflineWithFeedback>
        </View>
    );
}

export default MoneyRequestReportPreviewContent;
