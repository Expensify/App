import truncate from 'lodash/truncate';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import HapticFeedback from '@libs/HapticFeedback';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ExportWithDropdownMenu from './ExportWithDropdownMenu';
import type {PendingMessageProps} from './MoneyRequestPreview/types';
import ReportActionItemImages from './ReportActionItemImages';

type ReportPreviewProps = {
    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string;

    /** The report's policyID, used for Onyx subscription */
    policyID: string;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Callback when the payment options popover is shown */
    onPaymentOptionsShow?: () => void;

    /** Callback when the payment options popover is closed */
    onPaymentOptionsHide?: () => void;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

function ReportPreview({
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
}: ReportPreviewProps) {
    const policy = usePolicy(policyID);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const allTransactions = useMemo(() => TransactionUtils.getAllReportTransactions(iouReportID, transactions), [iouReportID, transactions]);

    const {hasMissingSmartscanFields, areAllRequestsBeingSmartScanned, hasOnlyTransactionsWithPendingRoutes, hasNonReimbursableTransactions} = useMemo(
        () => ({
            hasMissingSmartscanFields: ReportUtils.hasMissingSmartscanFields(iouReportID),
            areAllRequestsBeingSmartScanned: ReportUtils.areAllRequestsBeingSmartScanned(iouReportID, action),
            hasOnlyTransactionsWithPendingRoutes: ReportUtils.hasOnlyTransactionsWithPendingRoutes(iouReportID),
            hasNonReimbursableTransactions: ReportUtils.hasNonReimbursableTransactions(iouReportID),
        }),
        // When transactions get updated these status may have changed, so that is a case where we also want to run this.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [transactions, iouReportID, action],
    );

    const [isPaidAnimationRunning, setIsPaidAnimationRunning] = useState(false);
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [nonHeldAmount, fullAmount] = ReportUtils.getNonHeldAndFullAmount(iouReport, policy);
    const hasOnlyHeldExpenses = ReportUtils.hasOnlyHeldExpenses(iouReport?.reportID ?? '');
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : -1}`,
    );

    const managerID = iouReport?.managerID ?? action.childManagerAccountID ?? 0;
    const {totalDisplaySpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(iouReport);

    const iouSettled = ReportUtils.isSettled(iouReportID) || action?.childStatusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const previewMessageOpacity = useSharedValue(1);
    const previewMessageStyle = useAnimatedStyle(() => ({
        ...styles.flex1,
        ...styles.flexRow,
        ...styles.alignItemsCenter,
        opacity: previewMessageOpacity.value,
    }));
    const checkMarkScale = useSharedValue(iouSettled ? 1 : 0);
    const checkMarkStyle = useAnimatedStyle(() => ({
        ...styles.defaultCheckmarkWrapper,
        transform: [{scale: checkMarkScale.value}],
    }));

    const moneyRequestComment = action?.childLastMoneyRequestComment ?? '';
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);
    const isInvoiceRoom = ReportUtils.isInvoiceRoom(chatReport);
    const isOpenExpenseReport = isPolicyExpenseChat && ReportUtils.isOpenExpenseReport(iouReport);

    const isApproved = ReportUtils.isReportApproved(iouReport, action);
    const canAllowSettlement = ReportUtils.hasUpdatedTotal(iouReport, policy);
    const numberOfRequests = allTransactions.length;
    const transactionsWithReceipts = ReportUtils.getTransactionsWithReceipts(iouReportID);
    const numberOfScanningReceipts = transactionsWithReceipts.filter((transaction) => TransactionUtils.isReceiptBeingScanned(transaction)).length;
    const numberOfPendingRequests = transactionsWithReceipts.filter((transaction) => TransactionUtils.isPending(transaction) && TransactionUtils.isCardTransaction(transaction)).length;

    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;
    const hasErrors =
        (hasMissingSmartscanFields && !iouSettled) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ReportUtils.hasViolations(iouReportID, transactionViolations) ||
        ReportUtils.hasWarningTypeViolations(iouReportID, transactionViolations) ||
        (ReportUtils.isReportOwner(iouReport) && ReportUtils.hasReportViolations(iouReportID)) ||
        ReportUtils.hasActionsWithErrors(iouReportID);
    const lastThreeTransactionsWithReceipts = transactionsWithReceipts.slice(-3);
    const lastThreeReceipts = lastThreeTransactionsWithReceipts.map((transaction) => ({...ReceiptUtils.getThumbnailAndImageURIs(transaction), transaction}));
    const showRTERViolationMessage =
        numberOfRequests === 1 &&
        TransactionUtils.hasPendingUI(allTransactions.at(0), TransactionUtils.getTransactionViolations(allTransactions.at(0)?.transactionID ?? '-1', transactionViolations));

    let formattedMerchant = numberOfRequests === 1 ? TransactionUtils.getMerchant(allTransactions.at(0)) : null;
    const formattedDescription = numberOfRequests === 1 ? TransactionUtils.getDescription(allTransactions.at(0)) : null;

    if (TransactionUtils.isPartialMerchant(formattedMerchant ?? '')) {
        formattedMerchant = null;
    }

    const shouldShowSubmitButton = isOpenExpenseReport && reimbursableSpend !== 0 && !showRTERViolationMessage;
    const shouldDisableSubmitButton = shouldShowSubmitButton && !ReportUtils.isAllowedToSubmitDraftExpenseReport(iouReport);

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    const {isDelegateAccessRestricted, delegatorEmail} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const stopAnimation = useCallback(() => setIsPaidAnimationRunning(false), []);
    const confirmPayment = useCallback(
        (type: PaymentMethodType | undefined, payAsBusiness?: boolean) => {
            if (!type) {
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                setIsNoDelegateAccessMenuVisible(true);
            } else if (ReportUtils.hasHeldExpenses(iouReport?.reportID)) {
                setIsHoldMenuVisible(true);
            } else if (chatReport && iouReport) {
                setIsPaidAnimationRunning(true);
                HapticFeedback.longPress();
                if (ReportUtils.isInvoiceReport(iouReport)) {
                    IOU.payInvoice(type, chatReport, iouReport, payAsBusiness);
                } else {
                    IOU.payMoneyRequest(type, chatReport, iouReport);
                }
            }
        },
        [chatReport, iouReport, isDelegateAccessRestricted],
    );

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            setIsNoDelegateAccessMenuVisible(true);
        } else if (ReportUtils.hasHeldExpenses(iouReport?.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            IOU.approveMoneyRequest(iouReport, true);
        }
    };

    const getSettlementAmount = () => {
        if (hasOnlyHeldExpenses) {
            return '';
        }

        if (ReportUtils.hasHeldExpenses(iouReport?.reportID) && canAllowSettlement) {
            return nonHeldAmount;
        }

        return CurrencyUtils.convertToDisplayString(reimbursableSpend, iouReport?.currency);
    };

    const getDisplayAmount = (): string => {
        if (totalDisplaySpend) {
            return CurrencyUtils.convertToDisplayString(totalDisplaySpend, iouReport?.currency);
        }
        if (isScanning) {
            return translate('iou.receiptScanning');
        }
        if (hasOnlyTransactionsWithPendingRoutes) {
            return translate('iou.fieldPending');
        }

        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmount = '';
        const actionMessage = ReportActionsUtils.getReportActionText(action);
        const splits = actionMessage.split(' ');

        splits.forEach((split) => {
            if (!/\d/.test(split)) {
                return;
            }

            displayAmount = split;
        });

        return displayAmount;
    };

    // We're using this function to check if the parsed result of getDisplayAmount equals
    // to 0 in order to hide the subtitle (merchant / description) when the expense
    // is removed from OD report and display amount changes to 0 (any currency)
    function isDisplayAmountZero(displayAmount: string) {
        if (!displayAmount || displayAmount === '') {
            return false;
        }
        const numericPart = displayAmount.replace(/[^\d.-]/g, '');
        const amount = parseFloat(numericPart);
        return !Number.isNaN(amount) && amount === 0;
    }

    const previewMessage = useMemo(() => {
        if (isScanning) {
            return translate('common.receipt');
        }

        let payerOrApproverName;
        if (isPolicyExpenseChat) {
            payerOrApproverName = ReportUtils.getPolicyName(chatReport, undefined, policy);
        } else if (isInvoiceRoom) {
            payerOrApproverName = ReportUtils.getInvoicePayerName(chatReport, invoiceReceiverPolicy);
        } else {
            payerOrApproverName = ReportUtils.getDisplayNameForParticipant(managerID, true);
        }

        if (isApproved) {
            return translate('iou.managerApproved', {manager: payerOrApproverName});
        }
        let paymentVerb: TranslationPaths = 'iou.payerOwes';
        if (iouSettled || iouReport?.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        } else if (hasNonReimbursableTransactions) {
            paymentVerb = 'iou.payerSpent';
            payerOrApproverName = ReportUtils.getDisplayNameForParticipant(chatReport?.ownerAccountID, true);
        }
        return translate(paymentVerb, {payer: payerOrApproverName});
    }, [
        isScanning,
        isPolicyExpenseChat,
        policy,
        chatReport,
        isInvoiceRoom,
        invoiceReceiverPolicy,
        managerID,
        isApproved,
        iouSettled,
        iouReport?.isWaitingOnBankAccount,
        hasNonReimbursableTransactions,
        translate,
    ]);

    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);

    const shouldShowPayButton = useMemo(
        () => isPaidAnimationRunning || IOU.canIOUBePaid(iouReport, chatReport, policy, allTransactions),
        [isPaidAnimationRunning, iouReport, chatReport, policy, allTransactions],
    );

    const shouldShowApproveButton = useMemo(() => IOU.canApproveIOU(iouReport, policy), [iouReport, policy]);

    const shouldDisableApproveButton = shouldShowApproveButton && !ReportUtils.isAllowedToApproveExpenseReport(iouReport);

    const shouldShowSettlementButton = (shouldShowPayButton || shouldShowApproveButton) && !showRTERViolationMessage;

    const shouldPromptUserToAddBankAccount = ReportUtils.hasMissingPaymentMethod(userWallet, iouReportID) || ReportUtils.hasMissingInvoiceBankAccount(iouReportID);
    const shouldShowRBR = hasErrors;

    /*
     Show subtitle if at least one of the expenses is not being smart scanned, and either:
     - There is more than one expense – in this case, the "X expenses, Y scanning" subtitle is shown;
     - There is only one expense, it has a receipt and is not being smart scanned – in this case, the expense merchant or description is shown;

     * There is an edge case when there is only one distance expense with a pending route and amount = 0.
       In this case, we don't want to show the merchant or description because it says: "Pending route...", which is already displayed in the amount field.
     */
    const shouldShowSingleRequestMerchantOrDescription =
        numberOfRequests === 1 && (!!formattedMerchant || !!formattedDescription) && !(hasOnlyTransactionsWithPendingRoutes && !totalDisplaySpend);
    const shouldShowSubtitle = !isScanning && (shouldShowSingleRequestMerchantOrDescription || numberOfRequests > 1) && !isDisplayAmountZero(getDisplayAmount());
    const shouldShowScanningSubtitle = numberOfScanningReceipts === 1 && numberOfRequests === 1;
    const shouldShowPendingSubtitle = numberOfPendingRequests === 1 && numberOfRequests === 1;

    const isPayAtEndExpense = ReportUtils.isPayAtEndExpenseReport(iouReportID, allTransactions);
    const isArchivedReport = ReportUtils.isArchivedRoomWithID(iouReportID);
    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {selector: ReportUtils.getArchiveReason});

    const getPendingMessageProps: () => PendingMessageProps = () => {
        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return {shouldShow: true, messageIcon: Expensicons.Hourglass, messageDescription: translate('iou.bookingPending')};
            }
            if (isArchivedReport && archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return {
                    shouldShow: true,
                    messageIcon: Expensicons.Box,
                    messageDescription: translate('iou.bookingArchived'),
                };
            }
        }
        if (shouldShowScanningSubtitle) {
            return {shouldShow: true, messageIcon: Expensicons.ReceiptScan, messageDescription: translate('iou.receiptScanInProgress')};
        }
        if (shouldShowPendingSubtitle) {
            return {shouldShow: true, messageIcon: Expensicons.CreditCardHourglass, messageDescription: translate('iou.transactionPending')};
        }
        if (showRTERViolationMessage) {
            return {shouldShow: true, messageIcon: Expensicons.Hourglass, messageDescription: translate('iou.pendingMatchWithCreditCard')};
        }
        return {shouldShow: false};
    };

    const pendingMessageProps = getPendingMessageProps();

    const {supportText} = useMemo(() => {
        if (formattedMerchant && formattedMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT && formattedMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
            return {supportText: truncate(formattedMerchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH})};
        }
        if (formattedDescription ?? moneyRequestComment) {
            return {supportText: truncate(StringUtils.lineBreaksToSpaces(formattedDescription ?? moneyRequestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH})};
        }
        if (formattedMerchant === CONST.TRANSACTION.DEFAULT_MERCHANT) {
            return {supportText: formattedMerchant};
        }
        return {
            supportText: translate('iou.expenseCount', {
                count: numberOfRequests,
                scanningReceipts: numberOfScanningReceipts,
                pendingReceipts: numberOfPendingRequests,
            }),
        };
    }, [formattedMerchant, formattedDescription, moneyRequestComment, translate, numberOfRequests, numberOfScanningReceipts, numberOfPendingRequests]);

    /*
     * Manual export
     */
    const connectedIntegration = PolicyUtils.getConnectedIntegration(policy);

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const shouldShowExportIntegrationButton = !shouldShowPayButton && !shouldShowSubmitButton && connectedIntegration && isAdmin && ReportUtils.canBeExported(iouReport);

    useEffect(() => {
        if (!isPaidAnimationRunning) {
            return;
        }

        // eslint-disable-next-line react-compiler/react-compiler
        previewMessageOpacity.value = withTiming(0.75, {duration: CONST.ANIMATION_PAID_DURATION / 2}, () => {
            // eslint-disable-next-line react-compiler/react-compiler
            previewMessageOpacity.value = withTiming(1, {duration: CONST.ANIMATION_PAID_DURATION / 2});
        });
        // We only want to animate the text when the text changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [previewMessage, previewMessageOpacity]);

    useEffect(() => {
        if (!iouSettled) {
            return;
        }

        if (isPaidAnimationRunning) {
            // eslint-disable-next-line react-compiler/react-compiler
            checkMarkScale.value = withDelay(CONST.ANIMATION_PAID_CHECKMARK_DELAY, withSpring(1, {duration: CONST.ANIMATION_PAID_DURATION}));
        } else {
            checkMarkScale.value = 1;
        }
    }, [isPaidAnimationRunning, iouSettled, checkMarkScale]);

    return (
        <OfflineWithFeedback
            pendingAction={iouReport?.pendingFields?.preview}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
        >
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPress={() => {
                        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID));
                    }}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                    shouldUseHapticsOnLongPress
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]}
                    role="button"
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <View style={[styles.reportPreviewBox, isHovered || isScanning || isWhisper ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        {hasReceipts && (
                            <ReportActionItemImages
                                images={lastThreeReceipts}
                                total={transactionsWithReceipts.length}
                                size={CONST.RECEIPT.MAX_REPORT_PREVIEW_RECEIPTS}
                            />
                        )}
                        <View style={[styles.expenseAndReportPreviewBoxBody, hasReceipts ? styles.mtn1 : {}]}>
                            <View style={shouldShowSettlementButton ? {} : styles.expenseAndReportPreviewTextButtonContainer}>
                                <View style={styles.expenseAndReportPreviewTextContainer}>
                                    <View style={styles.flexRow}>
                                        <Animated.View style={previewMessageStyle}>
                                            <Text style={[styles.textLabelSupporting, styles.lh16]}>{previewMessage}</Text>
                                        </Animated.View>
                                        {shouldShowRBR && (
                                            <Icon
                                                src={Expensicons.DotIndicator}
                                                fill={theme.danger}
                                            />
                                        )}

                                        {!shouldShowRBR && shouldPromptUserToAddBankAccount && (
                                            <Icon
                                                src={Expensicons.DotIndicator}
                                                fill={theme.success}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.reportPreviewAmountSubtitleContainer}>
                                        <View style={styles.flexRow}>
                                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                                <Text style={styles.textHeadlineH1}>{getDisplayAmount()}</Text>
                                                {iouSettled && (
                                                    <Animated.View style={checkMarkStyle}>
                                                        <Icon
                                                            src={Expensicons.Checkmark}
                                                            fill={theme.iconSuccessFill}
                                                        />
                                                    </Animated.View>
                                                )}
                                            </View>
                                        </View>
                                        {shouldShowSubtitle && supportText && (
                                            <View style={styles.flexRow}>
                                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                                    <Text style={[styles.textLabelSupporting, styles.textNormal, styles.lh20]}>{supportText}</Text>
                                                </View>
                                            </View>
                                        )}
                                        {pendingMessageProps.shouldShow && (
                                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                                                <Icon
                                                    src={pendingMessageProps.messageIcon}
                                                    height={variables.iconSizeExtraSmall}
                                                    width={variables.iconSizeExtraSmall}
                                                    fill={theme.icon}
                                                />
                                                <Text style={[styles.textMicroSupporting, styles.ml1, styles.amountSplitPadding]}>{pendingMessageProps.messageDescription}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                {shouldShowSettlementButton && (
                                    <AnimatedSettlementButton
                                        isPaidAnimationRunning={isPaidAnimationRunning}
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
                                {shouldShowExportIntegrationButton && !shouldShowSettlementButton && (
                                    <ExportWithDropdownMenu
                                        policy={policy}
                                        report={iouReport}
                                        connectionName={connectedIntegration}
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
                                        onPress={() => iouReport && IOU.submitReport(iouReport)}
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
                delegatorEmail={delegatorEmail ?? ''}
            />

            {isHoldMenuVisible && iouReport && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={iouReport}
                    transactionCount={numberOfRequests}
                />
            )}
        </OfflineWithFeedback>
    );
}

ReportPreview.displayName = 'ReportPreview';

export default ReportPreview;
