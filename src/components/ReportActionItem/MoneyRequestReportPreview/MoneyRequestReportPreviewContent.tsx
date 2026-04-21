import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import React, {useCallback, useDeferredValue, useEffect, useEffectEvent, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import MoneyReportHeaderStatusBarSkeleton from '@components/MoneyReportHeaderStatusBarSkeleton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
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
import {getInvoicePayerName, getReportName} from '@libs/ReportNameUtils';
import {
    areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils,
    getDisplayNameForParticipant,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getPolicyName,
    getReportStatusColorStyle,
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
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import {startSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {hasPendingUI, isManagedCardTransaction, isPending} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAttributesDerivedValue, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import AccessMoneyRequestReportPreviewPlaceHolder from './AccessMoneyRequestReportPreviewPlaceHolder';
import EmptyMoneyRequestReportPreview from './EmptyMoneyRequestReportPreview';
import ReportPreviewActionButton from './ReportPreviewActionButton';
import type {MoneyRequestReportPreviewContentProps} from './types';

const MAX_PREVIEWS_NUMBER = 10;

const ITEM_LAYOUT_TYPE = {
    PREVIEW: 'preview',
    SHOW_MORE: 'showMore',
};

const reportAttributesSelector = (c: OnyxEntry<ReportAttributesDerivedValue>) => c?.reports;

function MoneyRequestReportPreviewContent({
    iouReportID,
    newTransactionIDs,
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
    shouldShowBorder = false,
    onPress,
    forwardedFSClass,
    originalReportID,
}: MoneyRequestReportPreviewContentProps) {
    const [chatReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`);
    const shouldShowLoading = !chatReportMetadata?.hasOnceLoadedReportActions && transactions.length === 0 && !chatReportMetadata?.isOptimisticReport;
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
    const shouldShowPreviewLoading = shouldShowLoading || shouldShowLoadingDeferred || (!currentWidth && !shouldShowPreviewPlaceholder);
    const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyRequestReportPreviewContent',
        hasOnceLoadedReportActions: chatReportMetadata?.hasOnceLoadedReportActions,
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
    const {translate, formatPhoneNumber} = useLocalize();
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
    const [shouldShowPayButton, setShouldShowPayButton] = useState(false);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(iouReport?.reportID);

    const handleHoldMenuOpen = (holdRequestType: string, holdPaymentType?: PaymentMethodType, canPay?: boolean) => {
        setRequestType(holdRequestType as ActionHandledType);
        setPaymentType(holdPaymentType);
        setShouldShowPayButton(!!canPay);
        setIsHoldMenuVisible(true);
    };

    const managerID = iouReport?.managerID ?? action.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(iouReport);

    const iouSettled = isSettled(iouReportID) || action?.childStatusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const previewMessageOpacity = useSharedValue(1);
    const previewMessageStyle = useAnimatedStyle(() => ({
        opacity: previewMessageOpacity.get(),
    }));
    const checkMarkScale = useSharedValue(iouSettled ? 1 : 0);

    const isApproved = isReportApproved({
        report: iouReport,
        parentReportAction: action,
    });
    const thumbsUpScale = useSharedValue(isApproved ? 1 : 0);

    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(chatReport);
    const isInvoiceRoom = isInvoiceRoomReportUtils(chatReport);
    const isTripRoom = isTripRoomReportUtils(chatReport);

    const numberOfRequests = transactions?.length ?? 0;
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    const numberOfPendingRequests = transactionsWithReceipts.filter((transaction) => isPending(transaction) && isManagedCardTransaction(transaction)).length;

    const shouldShowRTERViolationMessage = numberOfRequests === 1 && hasPendingUI(lastTransaction, lastTransactionViolations);

    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });

    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;

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
            payerOrApproverName = getDisplayNameForParticipant({
                accountID: managerID,
                shouldUseShortForm: true,
                formatPhoneNumber,
            });
        }

        if (isApproved) {
            return translate('iou.managerApproved', payerOrApproverName);
        }
        let paymentVerb: TranslationPaths = 'iou.payerOwes';
        if (iouSettled || iouReport?.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        } else if (hasNonReimbursableTransactions) {
            paymentVerb = 'iou.payerSpent';
            payerOrApproverName = getDisplayNameForParticipant({
                accountID: chatReport?.ownerAccountID,
                shouldUseShortForm: true,
                formatPhoneNumber,
            });
        }
        return translate(paymentVerb, payerOrApproverName);
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

    const carouselTransactions = useMemo(() => (shouldShowAccessPlaceHolder ? [] : transactions.slice(0, 11)), [shouldShowAccessPlaceHolder, transactions]);
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
    const carouselRef = useRef<FlashListRef<Transaction> | null>(null);
    const prevTransactionCountForScroll = useRef(carouselTransactions.length);
    const [carouselKey, setCarouselKey] = useState(0);

    // Reset carousel when transitioning from empty to non-empty data.
    // scrollToOffset doesn't clear RecyclerListView's internal layout cache on iOS mobile web,
    // so we force a full re-mount via key to prevent new items from rendering off-screen.
    useEffect(() => {
        if (carouselTransactions.length > 0 && prevTransactionCountForScroll.current === 0) {
            setCurrentIndex(0);
            setOptimisticIndex(undefined);
            setCarouselKey((prev) => prev + 1);
        }
        prevTransactionCountForScroll.current = carouselTransactions.length;
    }, [carouselTransactions.length]);

    const visibleItemsOnEndCount = useMemo(() => {
        const lastItemWidth = transactions.length > MAX_PREVIEWS_NUMBER ? footerWidth : reportPreviewStyles.transactionPreviewCarouselStyle.width;
        const lastItemWithGap = lastItemWidth + styles.gap2.gap;
        const itemWithGap = reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.gap2.gap;
        return Math.floor((currentWidth - 2 * styles.pl2.paddingLeft - lastItemWithGap) / itemWithGap) + 1;
    }, [transactions.length, footerWidth, reportPreviewStyles.transactionPreviewCarouselStyle.width, styles.gap2.gap, styles.pl2.paddingLeft, currentWidth]);
    const viewabilityConfig = useMemo(() => {
        return {itemVisiblePercentThreshold: 100};
    }, []);

    const carouselTransactionsRef = useRef(carouselTransactions);

    useEffect(() => {
        carouselTransactionsRef.current = carouselTransactions;
    }, [carouselTransactions]);

    const isFocused = useIsFocused();
    const getIsFocused = useEffectEvent(() => {
        return isFocused;
    });

    useEffect(() => {
        const index = carouselTransactions.findIndex((transaction) => newTransactionIDs?.has(transaction.transactionID));

        if (index < 0) {
            return;
        }
        const newTransaction = carouselTransactions.at(index);
        setTimeout(() => {
            if (!getIsFocused()) {
                return;
            }

            // If the new transaction is not available at the index it was on before the delay, avoid the scrolling
            // because we are scrolling to either a wrong or unavailable transaction (which can cause crash).
            if (newTransaction?.transactionID !== carouselTransactionsRef.current.at(index)?.transactionID) {
                return;
            }

            carouselRef.current?.scrollToIndex({
                index,
                viewOffset: -2 * styles.gap2.gap,
                animated: true,
            });
        }, CONST.ANIMATED_TRANSITION);

        // We only want to scroll to a new transaction when the set of new transaction IDs changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newTransactionIDs]);

    const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        const newIndex = viewableItems.at(0)?.index;
        if (typeof newIndex === 'number') {
            setCurrentIndex(newIndex);
        }
        const viewableItemsIndexes = viewableItems.map((item) => item.index).filter((item): item is number => item !== null);
        setCurrentVisibleItems(viewableItemsIndexes);
    }).current;

    const snapOffsets = carouselTransactions.map((_, index) => index * (reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.transactionsCarouselGap.width));

    const handleChange = (index: number) => {
        if (index > carouselTransactions.length - visibleItemsOnEndCount) {
            const lastScrollableIndex = carouselTransactions.length - visibleItemsOnEndCount;
            setOptimisticIndex(lastScrollableIndex);
            carouselRef.current?.scrollToOffset({
                offset: snapOffsets.at(lastScrollableIndex) ?? 0,
                animated: true,
            });
            return;
        }
        if (index < 0) {
            setOptimisticIndex(0);
            carouselRef.current?.scrollToTop({animated: true});
            return;
        }
        if (index === carouselTransactions.length - visibleItemsOnEndCount) {
            setOptimisticIndex(index);
            carouselRef.current?.scrollToEnd({animated: true});
            return;
        }
        setOptimisticIndex(index);
        carouselRef.current?.scrollToOffset({
            offset: snapOffsets.at(index) ?? 0,
            animated: true,
        });
    };

    const renderItem = (itemInfo: ListRenderItemInfo<Transaction>) => {
        if (itemInfo.index > MAX_PREVIEWS_NUMBER - 1) {
            return (
                <View
                    style={[styles.p5, styles.justifyContentCenter]}
                    onLayout={(e) => setFooterWidth(e.nativeEvent.layout.width)}
                >
                    <Text style={{color: colors.blue600}}>
                        +{transactions.length - MAX_PREVIEWS_NUMBER} {translate('common.more').toLowerCase()}
                    </Text>
                </View>
            );
        }
        return renderTransactionItem(itemInfo);
    };

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

    const renderSeparator = () => <View style={styles.transactionsCarouselGap} />;

    const getItemType = (_item: Transaction, index: number) => {
        return index === MAX_PREVIEWS_NUMBER ? ITEM_LAYOUT_TYPE.SHOW_MORE : ITEM_LAYOUT_TYPE.PREVIEW;
    };

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
                    ref={carouselRef}
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
                            showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive, false, originalReportID);
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
                                                            {getReportName(iouReport, reportAttributes) || action.childReportName}
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
                                                        onPress={() => handleChange(currentIndex - 1)}
                                                        disabled={optimisticIndex !== undefined ? optimisticIndex === 0 : currentIndex === 0 && currentVisibleItems.at(0) === 0}
                                                        disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                                                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_PREVIOUS}
                                                    >
                                                        <Icon
                                                            src={expensifyIcons.BackArrow}
                                                            fill={theme.icon}
                                                            width={variables.iconSizeNormal}
                                                            height={variables.iconSizeNormal}
                                                        />
                                                    </PressableWithFeedback>
                                                    <PressableWithFeedback
                                                        accessibilityRole="button"
                                                        accessible
                                                        accessibilityLabel={translate('common.next')}
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
                                                            fill={theme.icon}
                                                            width={variables.iconSizeNormal}
                                                            height={variables.iconSizeNormal}
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
                        const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, shouldShowPayButton);
                        return (
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
