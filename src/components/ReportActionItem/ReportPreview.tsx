import truncate from 'lodash/truncate';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import {getButtonRole} from '@components/Button/utils';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PaymentMethod} from '@components/KYCWall/types';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import Performance from '@libs/Performance';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportActionText} from '@libs/ReportActionsUtils';
import {
    areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils,
    canBeExported,
    getArchiveReason,
    getBankAccountRoute,
    getDisplayNameForParticipant,
    getInvoicePayerName,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getPolicyName,
    getTransactionsWithReceipts,
    hasActionsWithErrors,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasMissingInvoiceBankAccount,
    hasMissingPaymentMethod,
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
    isArchivedReportWithID,
    isInvoiceReport as isInvoiceReportUtils,
    isInvoiceRoom as isInvoiceRoomReportUtils,
    isPayAtEndExpenseReport,
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
import {contextMenuRef} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import {approveMoneyRequest, canApproveIOU, canIOUBePaid as canIOUBePaidIOUActions, canSubmitReport, payInvoice, payMoneyRequest, submitReport} from '@userActions/IOU';
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
    chatReportID: string | undefined;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string | undefined;

    /** The report's policyID, used for Onyx subscription */
    policyID: string | undefined;

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
    const [iouReport, transactions, violations] = useReportWithTransactionsAndViolations(iouReportID);
    const lastTransaction = transactions?.at(0);
    const transactionIDList = transactions?.map((reportTransaction) => reportTransaction.transactionID) ?? [];
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : CONST.DEFAULT_NUMBER_ID}`,
    );
    const [invoiceReceiverPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails) =>
            personalDetails?.[chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.accountID : CONST.DEFAULT_NUMBER_ID],
    });
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const {hasMissingSmartscanFields, areAllRequestsBeingSmartScanned, hasOnlyTransactionsWithPendingRoutes, hasNonReimbursableTransactions} = useMemo(
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

    const {isPaidAnimationRunning, isApprovedAnimationRunning, stopAnimation, startAnimation, startApprovedAnimation} = usePaymentAnimations();
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();

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
    const lastThreeTransactions = transactions?.slice(-3) ?? [];
    const lastThreeReceipts = lastThreeTransactions.map((transaction) => ({...getThumbnailAndImageURIs(transaction), transaction}));
    const lastTransactionViolations = useTransactionViolations(lastTransaction?.transactionID);
    const showRTERViolationMessage = numberOfRequests === 1 && hasPendingUI(lastTransaction, lastTransactionViolations);
    const shouldShowBrokenConnectionViolation = numberOfRequests === 1 && shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDList, iouReport, policy, violations);
    let formattedMerchant = numberOfRequests === 1 ? getMerchant(lastTransaction) : null;
    const formattedDescription = numberOfRequests === 1 ? Parser.htmlToMarkdown(getDescription(lastTransaction)) : null;

    if (isPartialMerchant(formattedMerchant ?? '')) {
        formattedMerchant = null;
    }

    const isArchived = isArchivedReportWithID(iouReport?.reportID);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const filteredTransactions = transactions?.filter((transaction) => transaction) ?? [];
    const shouldShowSubmitButton = canSubmitReport(iouReport, policy, filteredTransactions, violations);
    const shouldDisableSubmitButton = shouldShowSubmitButton && !isAllowedToSubmitDraftExpenseReport(iouReport);

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const confirmPayment = useCallback(
        (type: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => {
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
                startAnimation();
                if (isInvoiceReportUtils(iouReport)) {
                    payInvoice(type, chatReport, iouReport, payAsBusiness, methodID, paymentMethod);
                } else {
                    payMoneyRequest(type, chatReport, iouReport);
                }
            }
        },
        [chatReport, iouReport, isDelegateAccessRestricted, startAnimation],
    );

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            setIsNoDelegateAccessMenuVisible(true);
        } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            startApprovedAnimation();
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

    const getDisplayAmount = (): string => {
        if (totalDisplaySpend) {
            return convertToDisplayString(totalDisplaySpend, iouReport?.currency);
        }
        if (isScanning) {
            return translate('iou.receiptStatusTitle');
        }
        if (hasOnlyTransactionsWithPendingRoutes) {
            return translate('iou.fieldPending');
        }

        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmount = '';
        const actionMessage = getReportActionText(action);
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

    const shouldPromptUserToAddBankAccount = (hasMissingPaymentMethod(userWallet, iouReportID) || hasMissingInvoiceBankAccount(iouReportID)) && !isSettled(iouReportID);
    const shouldShowRBR = hasErrors && !iouSettled;

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

    const isPayAtEndExpense = isPayAtEndExpenseReport(iouReportID, transactions);
    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {selector: getArchiveReason});

    const getPendingMessageProps: () => PendingMessageProps = () => {
        if (isPayAtEndExpense) {
            if (!isArchived) {
                return {shouldShow: true, messageIcon: Expensicons.Hourglass, messageDescription: translate('iou.bookingPending')};
            }
            if (isArchived && archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return {
                    shouldShow: true,
                    messageIcon: Expensicons.Box,
                    messageDescription: translate('iou.bookingArchived'),
                };
            }
        }
        if (shouldShowBrokenConnectionViolation) {
            return {shouldShow: true, messageIcon: Expensicons.Hourglass, messageDescription: translate('violations.brokenConnection530Error')};
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

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }
        Performance.markStart(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID));
    }, [iouReportID]);

    return (
        <OfflineWithFeedback
            pendingAction={iouReport?.pendingFields?.preview}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
        >
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPress={openReportFromPreview}
                    onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                    shouldUseHapticsOnLongPress
                    // This is added to omit console error about nested buttons as its forbidden on web platform
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]}
                    role={getButtonRole(true)}
                    isNested
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <View style={[styles.reportPreviewBox, isHovered || isScanning || isWhisper ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        {lastThreeReceipts.length > 0 && (
                            <ReportActionItemImages
                                images={lastThreeReceipts}
                                total={numberOfRequests}
                                size={CONST.RECEIPT.MAX_REPORT_PREVIEW_RECEIPTS}
                            />
                        )}
                        <View style={[styles.expenseAndReportPreviewBoxBody, hasReceipts ? styles.mtn1 : {}]}>
                            <View style={shouldShowSettlementButton ? {} : styles.expenseAndReportPreviewTextButtonContainer}>
                                <View style={styles.expenseAndReportPreviewTextContainer}>
                                    <View style={styles.flexRow}>
                                        <Animated.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, previewMessageStyle]}>
                                            <Text
                                                style={[styles.textLabelSupporting, styles.lh20]}
                                                testID="reportPreview-previewMessage"
                                            >
                                                {previewMessage}
                                            </Text>
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
                                            </View>
                                        </View>
                                        {shouldShowSubtitle && !!supportText && (
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
                                        shouldAddTopMargin
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

ReportPreview.displayName = 'ReportPreview';

export default ReportPreview;
