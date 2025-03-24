import truncate from 'lodash/truncate';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import type {ListRenderItemInfo, ViewToken} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import {getButtonRole} from '@components/Button/utils';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import ExportWithDropdownMenu from '@components/ReportActionItem/ExportWithDropdownMenu';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HapticFeedback from '@libs/HapticFeedback';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {
    areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils,
    canBeExported,
    getBankAccountRoute,
    getDisplayNameForParticipant,
    getInvoicePayerName,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getPolicyName,
    getTransactionsWithReceipts,
    hasActionsWithErrors,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasMissingSmartscanFields as hasMissingSmartscanFieldsReportUtils,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    hasNoticeTypeViolations,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasOnlyTransactionsWithPendingRoutes as hasOnlyTransactionsWithPendingRoutesReportUtils,
    hasReportViolations,
    hasUpdatedTotal,
    hasViolations,
    hasWarningTypeViolations,
    isAllowedToApproveExpenseReport,
    isAllowedToSubmitDraftExpenseReport,
    isInvoiceReport as isInvoiceReportUtils,
    isInvoiceRoom as isInvoiceRoomReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isReportApproved,
    isReportOwner,
    isSettled,
    isTripRoom as isTripRoomReportUtils,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {
    getDescription,
    getMerchant,
    hasPendingUI,
    isCardTransaction,
    isPartialMerchant,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import {approveMoneyRequest, canApproveIOU, canIOUBePaid as canIOUBePaidIOUActions, canSubmitReport, payInvoice, payMoneyRequest, submitReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {MoneyRequestReportPreviewContentProps} from './types';

function MoneyRequestReportPreviewContent({
    iouReportID,
    policyID,
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
    violations,
    policy,
    invoiceReceiverPersonalDetail,
    lastTransactionViolations,
    isDelegateAccessRestricted,
    renderItem,
}: MoneyRequestReportPreviewContentProps) {
    const lastTransaction = transactions?.at(0);
    const transactionIDList = transactions?.map((reportTransaction) => reportTransaction.transactionID) ?? [];
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {hasMissingSmartscanFields, areAllRequestsBeingSmartScanned, hasNonReimbursableTransactions} = useMemo(
        () => ({
            hasMissingSmartscanFields: hasMissingSmartscanFieldsReportUtils(iouReportID),
            areAllRequestsBeingSmartScanned: areAllRequestsBeingSmartScannedReportUtils(iouReportID, action),
            hasOnlyTransactionsWithPendingRoutes: hasOnlyTransactionsWithPendingRoutesReportUtils(iouReportID),
            hasNonReimbursableTransactions: hasNonReimbursableTransactionsReportUtils(iouReportID),
        }),
        // When transactions get updated these status may have changed, so that is a case where we also want to run this.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [transactions, iouReportID, action],
    );

    const [isPaidAnimationRunning, setIsPaidAnimationRunning] = useState(false);
    const [isApprovedAnimationRunning, setIsApprovedAnimationRunning] = useState(false);
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<FlatList<Transaction> | null>(null);

    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false, shouldCheckApprovedState = true) =>
            canIOUBePaidIOUActions(iouReport, chatReport, policy, transactions, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState),
        [iouReport, chatReport, policy, transactions],
    );

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const canIOUBePaidAndApproved = useMemo(() => getCanIOUBePaid(false, false), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    const shouldShowApproveButton = useMemo(() => canApproveIOU(iouReport, policy), [iouReport, policy]) || isApprovedAnimationRunning;

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(iouReport);

    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, shouldShowPayButton);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(iouReport?.reportID);

    const managerID = iouReport?.managerID ?? action.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const {totalDisplaySpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(iouReport);

    const iouSettled = isSettled(iouReportID) || action?.childStatusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const previewMessageOpacity = useSharedValue(1);
    const previewMessageStyle = useAnimatedStyle(() => ({
        opacity: previewMessageOpacity.get(),
    }));
    const checkMarkScale = useSharedValue(iouSettled ? 1 : 0);

    const isApproved = isReportApproved({report: iouReport, parentReportAction: action});
    const thumbsUpScale = useSharedValue(isApproved ? 1 : 0);
    const thumbsUpStyle = useAnimatedStyle(() => ({
        ...styles.defaultCheckmarkWrapper,
        transform: [{scale: thumbsUpScale.get()}],
    }));

    const moneyRequestComment = action?.childLastMoneyRequestComment ?? '';
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(chatReport);
    const isInvoiceRoom = isInvoiceRoomReportUtils(chatReport);
    const isTripRoom = isTripRoomReportUtils(chatReport);

    const canAllowSettlement = hasUpdatedTotal(iouReport, policy);
    const numberOfRequests = transactions?.length ?? 0;
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    const numberOfScanningReceipts = transactionsWithReceipts.filter((transaction) => isReceiptBeingScanned(transaction)).length;
    const numberOfPendingRequests = transactionsWithReceipts.filter((transaction) => isPending(transaction) && isCardTransaction(transaction)).length;

    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;
    const hasErrors =
        (hasMissingSmartscanFields && !iouSettled) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        hasViolations(iouReportID, violations, true) ||
        hasNoticeTypeViolations(iouReportID, violations, true) ||
        hasWarningTypeViolations(iouReportID, violations, true) ||
        (isReportOwner(iouReport) && hasReportViolations(iouReportID)) ||
        hasActionsWithErrors(iouReportID);
    const showRTERViolationMessage = numberOfRequests === 1 && hasPendingUI(lastTransaction, lastTransactionViolations);
    const shouldShowBrokenConnectionViolation = numberOfRequests === 1 && shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDList, iouReport, policy, violations);
    let formattedMerchant = numberOfRequests === 1 ? getMerchant(lastTransaction) : null;
    const formattedDescription = numberOfRequests === 1 ? getDescription(lastTransaction) : null;

    if (isPartialMerchant(formattedMerchant ?? '')) {
        formattedMerchant = null;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const filteredTransactions = transactions?.filter((transaction) => transaction) ?? [];
    const shouldShowSubmitButton = canSubmitReport(iouReport, policy, filteredTransactions, violations);
    const shouldDisableSubmitButton = shouldShowSubmitButton && !isAllowedToSubmitDraftExpenseReport(iouReport);

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const stopAnimation = useCallback(() => {
        setIsPaidAnimationRunning(false);
        setIsApprovedAnimationRunning(false);
    }, []);
    const startAnimation = useCallback(() => {
        setIsPaidAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);
    const startApprovedAnimation = useCallback(() => {
        setIsApprovedAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);

    const confirmPayment = useCallback(
        (type: PaymentMethodType | undefined, payAsBusiness?: boolean) => {
            if (!type) {
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                setIsNoDelegateAccessMenuVisible(true);
            } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
                setIsHoldMenuVisible(true);
            } else if (chatReport && iouReport) {
                setIsPaidAnimationRunning(true);
                HapticFeedback.longPress();
                if (isInvoiceReportUtils(iouReport)) {
                    payInvoice(type, chatReport, iouReport, payAsBusiness);
                } else {
                    payMoneyRequest(type, chatReport, iouReport);
                }
            }
        },
        [chatReport, iouReport, isDelegateAccessRestricted],
    );

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            setIsNoDelegateAccessMenuVisible(true);
        } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            setIsApprovedAnimationRunning(true);
            HapticFeedback.longPress();
            approveMoneyRequest(iouReport, true);
        }
    };

    const getSettlementAmount = () => {
        if (hasOnlyHeldExpenses) {
            return '';
        }

        // We shouldn't display the nonHeldAmount as the default option if it's not valid since we cannot pay partially in this case
        if (hasHeldExpensesReportUtils(iouReport?.reportID) && canAllowSettlement && hasValidNonHeldAmount) {
            return nonHeldAmount;
        }

        return convertToDisplayString(reimbursableSpend, iouReport?.currency);
    };

    const previewMessage = useMemo(() => {
        if (isScanning) {
            return totalDisplaySpend ? `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('common.scanning')}` : `${translate('common.receipt')}`;
        }
        if (numberOfPendingRequests === 1 && numberOfRequests === 1) {
            return `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }
        if (showRTERViolationMessage) {
            return `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('iou.pendingMatch')}`;
        }

        let payerOrApproverName;
        if (isPolicyExpenseChat || isTripRoom) {
            payerOrApproverName = getPolicyName({report: chatReport, policy});
        } else if (isInvoiceRoom) {
            payerOrApproverName = getInvoicePayerName(chatReport, invoiceReceiverPolicy, invoiceReceiverPersonalDetail);
        } else {
            payerOrApproverName = getDisplayNameForParticipant({accountID: managerID, shouldUseShortForm: true});
        }

        if (isApproved) {
            return translate('iou.managerApproved', {manager: payerOrApproverName});
        }
        let paymentVerb: TranslationPaths = 'iou.payerOwes';
        if (iouSettled || iouReport?.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        } else if (hasNonReimbursableTransactions) {
            paymentVerb = 'iou.payerSpent';
            payerOrApproverName = getDisplayNameForParticipant({accountID: chatReport?.ownerAccountID, shouldUseShortForm: true});
        }
        return translate(paymentVerb, {payer: payerOrApproverName});
    }, [
        isScanning,
        numberOfPendingRequests,
        numberOfRequests,
        showRTERViolationMessage,
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
    ]);

    const bankAccountRoute = getBankAccountRoute(chatReport);

    const shouldShowSettlementButton = !shouldShowSubmitButton && (shouldShowPayButton || shouldShowApproveButton) && !showRTERViolationMessage && !shouldShowBrokenConnectionViolation;

    const shouldShowRBR = hasErrors && !iouSettled;

    /*
     Show subtitle if at least one of the expenses is not being smart scanned, and either:
     - There is more than one expense – in this case, the "X expenses, Y scanning" subtitle is shown;
     - There is only one expense, it has a receipt and is not being smart scanned – in this case, the expense merchant or description is shown;

     * There is an edge case when there is only one distance expense with a pending route and amount = 0.
       In this case, we don't want to show the merchant or description because it says: "Pending route...", which is already displayed in the amount field.
     */

    const {supportText} = useMemo(() => {
        if (formattedMerchant && formattedMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT && formattedMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
            return {supportText: truncate(formattedMerchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH})};
        }
        if (formattedDescription ?? moneyRequestComment) {
            return {supportText: truncate(StringUtils.lineBreaksToSpaces(formattedDescription ?? moneyRequestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH})};
        }

        if (numberOfRequests === 1) {
            return {
                supportText: '',
            };
        }
        return {
            supportText: translate('iou.expenseCount', {
                scanningReceipts: numberOfScanningReceipts,
                pendingReceipts: numberOfPendingRequests,
                count: numberOfRequests,
            }),
        };
    }, [formattedMerchant, formattedDescription, moneyRequestComment, translate, numberOfRequests, numberOfScanningReceipts, numberOfPendingRequests]);

    /*
     * Manual export
     */
    const connectedIntegration = getConnectedIntegration(policy);

    const shouldShowExportIntegrationButton = !shouldShowPayButton && !shouldShowSubmitButton && connectedIntegration && isAdmin && canBeExported(iouReport);

    useEffect(() => {
        if (!isPaidAnimationRunning || isApprovedAnimationRunning) {
            return;
        }

        previewMessageOpacity.set(
            withTiming(0.75, {duration: CONST.ANIMATION_PAID_DURATION / 2}, () => {
                previewMessageOpacity.set(withTiming(1, {duration: CONST.ANIMATION_PAID_DURATION / 2}));
            }),
        );
        // We only want to animate the text when the text changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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

        thumbsUpScale.set(isApprovedAnimationRunning ? withDelay(CONST.ANIMATION_THUMBSUP_DELAY, withSpring(1, {duration: CONST.ANIMATION_THUMBSUP_DURATION})) : 1);
    }, [isApproved, isApprovedAnimationRunning, thumbsUpScale]);

    // eslint-disable-next-line react-compiler/react-compiler
    const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        const newIndex = viewableItems.at(0)?.index;
        if (typeof newIndex === 'number') {
            setCurrentIndex(newIndex);
        }
    }).current;

    // yet to be updated, doesn't handle a case when first element scrolled to the left (visible in 100%)
    const handleChange = (index: number) => {
        if (index >= transactions.length - 1) {
            return;
        }
        carouselRef.current?.scrollToIndex({index, animated: true});
    };

    const renderFlatlistItem = (itemInfo: ListRenderItemInfo<Transaction>) => {
        if (itemInfo.index > 9) {
            return (
                <View style={[styles.flex1, styles.p5, styles.justifyContentCenter]}>
                    <Text style={{color: colors.blue600}}>+{transactions.length - 10} more</Text>
                </View>
            );
        }
        if (renderItem) {
            return renderItem(itemInfo);
        }
        return null;
    };

    return (
        <OfflineWithFeedback
            pendingAction={iouReport?.pendingFields?.preview}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
        >
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPress={() => {}}
                    onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                    shouldUseHapticsOnLongPress
                    // This is added to omit console error about nested buttons as its forbidden on web platform
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox, {maxWidth: 680}]}
                    role={getButtonRole(true)}
                    isNested
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <View style={[styles.reportPreviewBox, isHovered || isScanning || isWhisper ? styles.reportPreviewBoxHoverBorder : undefined, {maxWidth: 680}]}>
                        <View style={[styles.expenseAndReportPreviewBoxBody, hasReceipts ? styles.mtn1 : {}]}>
                            <View style={[shouldUseNarrowLayout ? styles.gap3 : styles.expenseAndReportPreviewTextButtonContainer]}>
                                <View style={[styles.expenseAndReportPreviewTextContainer]}>
                                    <View style={[styles.flexRow]}>
                                        <Animated.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, previewMessageStyle]}>
                                            <Text
                                                style={[styles.lh20, styles.headerText]}
                                                testID="MoneyRequestReportPreview-reportName"
                                            >
                                                {iouReport?.reportName}
                                            </Text>
                                        </Animated.View>
                                        {iouSettled && (
                                            <Animated.View style={[styles.defaultCheckmarkWrapper, {transform: [{scale: checkMarkScale}]}]}>
                                                <Icon
                                                    src={Expensicons.Checkmark}
                                                    fill={theme.iconSuccessFill}
                                                />
                                            </Animated.View>
                                        )}
                                        {isApproved && (
                                            <Animated.View style={thumbsUpStyle}>
                                                <Icon
                                                    src={Expensicons.ThumbsUp}
                                                    fill={theme.icon}
                                                />
                                            </Animated.View>
                                        )}
                                        {!shouldUseNarrowLayout && (
                                            <View style={[styles.flexRow, {alignItems: 'center'}]}>
                                                <Text style={[styles.textLabelSupporting, styles.textLabelSupporting, styles.lh20, {marginRight: 4}]}>{supportText}</Text>
                                                <PressableWithFeedback
                                                    accessibilityRole="button"
                                                    accessible
                                                    accessibilityLabel="button"
                                                    style={styles.carouselArrowButton}
                                                    onPress={() => handleChange(currentIndex)}
                                                >
                                                    <Icon
                                                        src={Expensicons.BackArrow}
                                                        small
                                                        fill={colors.productLight700}
                                                        isButtonIcon
                                                    />
                                                </PressableWithFeedback>
                                                <PressableWithFeedback
                                                    accessibilityRole="button"
                                                    accessible
                                                    accessibilityLabel="button"
                                                    style={styles.carouselArrowButton}
                                                    onPress={() => handleChange(currentIndex + 1)}
                                                >
                                                    <Icon
                                                        src={Expensicons.ArrowRight}
                                                        small
                                                        fill={colors.productLight700}
                                                        isButtonIcon
                                                    />
                                                </PressableWithFeedback>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        {shouldShowRBR && (
                                            <>
                                                <Icon
                                                    src={Expensicons.DotIndicator}
                                                    fill={theme.danger}
                                                />
                                                <Text style={[styles.textDanger, styles.fontSizeLabel, styles.textLineHeightNormal, styles.ml2]}>Here are RBR messages</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <View style={[styles.flex1, styles.flexColumn, styles.overflowVisible]}>
                                    <FlatList
                                        horizontal
                                        data={transactions.slice(0, 11)}
                                        ref={carouselRef}
                                        nestedScrollEnabled
                                        scrollEnabled
                                        keyExtractor={(item) => item.transactionID}
                                        contentContainerStyle={[styles.gap2]}
                                        style={[styles.mhn4, styles.ph4]}
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={renderFlatlistItem}
                                        onViewableItemsChanged={onViewableItemsChanged}
                                    />
                                </View>
                                {shouldUseNarrowLayout && (
                                    <View style={[styles.flexRow, styles.alignSelfCenter, styles.gap2]}>
                                        {transactions.slice(0, 11).map((item, index) => (
                                            <PressableWithFeedback
                                                accessibilityRole="button"
                                                accessible
                                                accessibilityLabel="button"
                                                style={styles.carouselDots(index, currentIndex)}
                                                onPress={() => carouselRef.current?.scrollToIndex({index, animated: true})}
                                            />
                                        ))}
                                    </View>
                                )}
                                {(shouldShowSettlementButton || true) && (
                                    <AnimatedSettlementButton
                                        onlyShowPayElsewhere={onlyShowPayElsewhere}
                                        isPaidAnimationRunning={isPaidAnimationRunning}
                                        isApprovedAnimationRunning={isApprovedAnimationRunning}
                                        canIOUBePaid={canIOUBePaidAndApproved || isPaidAnimationRunning}
                                        onAnimationFinish={stopAnimation}
                                        formattedAmount={getSettlementAmount() ?? ''}
                                        currency={iouReport?.currency}
                                        policyID={policyID}
                                        chatReportID={chatReportID}
                                        iouReport={iouReport}
                                        onPress={confirmPayment}
                                        onPaymentOptionsShow={onPaymentOptionsShow}
                                        onPaymentOptionsHide={onPaymentOptionsHide}
                                        confirmApproval={confirmApproval}
                                        enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                        addBankAccountRoute={bankAccountRoute}
                                        shouldHidePaymentOptions={!shouldShowPayButton}
                                        shouldShowApproveButton={shouldShowApproveButton}
                                        shouldDisableApproveButton={shouldDisableApproveButton}
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
                                    />
                                )}
                                {!!shouldShowExportIntegrationButton && !shouldShowSettlementButton && (
                                    <ExportWithDropdownMenu
                                        policy={policy}
                                        report={iouReport}
                                        connectionName={connectedIntegration}
                                        wrapperStyle={styles.flexReset}
                                        dropdownAnchorAlignment={{
                                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                                        }}
                                    />
                                )}
                                {shouldShowSubmitButton && (
                                    <Button
                                        success={isWaitingForSubmissionFromCurrentUser}
                                        text={translate('common.submit')}
                                        onPress={() => iouReport && submitReport(iouReport)}
                                        isDisabled={shouldDisableSubmitButton}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </PressableWithoutFeedback>
            </View>
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />

            {isHoldMenuVisible && !!iouReport && requestType !== undefined && (
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
    );
}

MoneyRequestReportPreviewContent.displayName = 'MoneyRequestReportPreviewContent';

export default MoneyRequestReportPreviewContent;
