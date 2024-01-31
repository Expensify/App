import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SettlementButton from '@components/SettlementButton';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction, Session, Transaction, TransactionViolations} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ReportActionItemImages from './ReportActionItemImages';

type ReportPreviewOnyxProps = {
    /** The policy tied to the money request report */
    policy: OnyxEntry<Policy>;

    /** ChatReport associated with iouReport */
    chatReport: OnyxEntry<Report>;

    /** Active IOU Report for current report */
    iouReport: OnyxEntry<Report>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;

    /** All the transactions, used to update ReportPreview label and status */
    transactions: OnyxCollection<Transaction>;

    /** All of the transaction violations */
    transactionViolations: OnyxCollection<TransactionViolations>;
};

type ReportPreviewProps = ReportPreviewOnyxProps & {
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

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

function ReportPreview({
    iouReport,
    session,
    policy,
    iouReportID,
    policyID,
    chatReportID,
    chatReport,
    action,
    containerStyles,
    contextMenuAnchor,
    transactions,
    transactionViolations,
    isHovered = false,
    isWhisper = false,
    checkIfContextMenuActive = () => {},
}: ReportPreviewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();

    const {hasMissingSmartscanFields, areAllRequestsBeingSmartScanned, hasOnlyDistanceRequests, hasNonReimbursableTransactions} = useMemo(
        () => ({
            hasMissingSmartscanFields: ReportUtils.hasMissingSmartscanFields(iouReportID),
            areAllRequestsBeingSmartScanned: ReportUtils.areAllRequestsBeingSmartScanned(iouReportID, action),
            hasOnlyDistanceRequests: ReportUtils.hasOnlyDistanceRequestTransactions(iouReportID),
            hasNonReimbursableTransactions: ReportUtils.hasNonReimbursableTransactions(iouReportID),
        }),
        // When transactions get updated these status may have changed, so that is a case where we also want to run this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [transactions, iouReportID, action],
    );

    const managerID = iouReport?.managerID ?? 0;
    const isCurrentUserManager = managerID === session?.accountID;
    const {totalDisplaySpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(iouReport);
    const policyType = policy?.type;
    const isAutoReimbursable = ReportUtils.canBeAutoReimbursed(iouReport, policy);

    const iouSettled = ReportUtils.isSettled(iouReportID);
    const iouCanceled = ReportUtils.isArchivedRoom(chatReport);
    const numberOfRequests = ReportActionUtils.getNumberOfMoneyRequests(action);
    const moneyRequestComment = action?.childLastMoneyRequestComment ?? '';
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);
    const isDraftExpenseReport = isPolicyExpenseChat && ReportUtils.isDraftExpenseReport(iouReport);

    const isApproved = ReportUtils.isReportApproved(iouReport);
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(iouReport);
    const transactionsWithReceipts = ReportUtils.getTransactionsWithReceipts(iouReportID);
    const numberOfScanningReceipts = transactionsWithReceipts.filter((transaction) => TransactionUtils.isReceiptBeingScanned(transaction)).length;
    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;
    const hasErrors = (hasReceipts && hasMissingSmartscanFields) || (canUseViolations && ReportUtils.hasViolations(iouReportID, transactionViolations));
    const lastThreeTransactionsWithReceipts = transactionsWithReceipts.slice(-3);
    const lastThreeReceipts = lastThreeTransactionsWithReceipts.map((transaction) => ReceiptUtils.getThumbnailAndImageURIs(transaction));
    let formattedMerchant = numberOfRequests === 1 && hasReceipts ? TransactionUtils.getMerchant(transactionsWithReceipts[0]) : null;
    if (TransactionUtils.isPartialMerchant(formattedMerchant ?? '')) {
        formattedMerchant = null;
    }
    const hasPendingWaypoints = formattedMerchant && hasOnlyDistanceRequests && transactionsWithReceipts.every((transaction) => transaction.pendingFields?.waypoints);
    if (formattedMerchant && hasPendingWaypoints) {
        formattedMerchant = formattedMerchant.replace(CONST.REGEX.FIRST_SPACE, translate('common.tbd'));
    }
    const previewSubtitle =
        // Formatted merchant can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        formattedMerchant ||
        translate('iou.requestCount', {
            count: numberOfRequests - numberOfScanningReceipts,
            scanningReceipts: numberOfScanningReceipts,
        });

    const shouldShowSubmitButton = isDraftExpenseReport && reimbursableSpend !== 0;

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.isHarvestingEnabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.isHarvestingEnabled],
    );

    const getDisplayAmount = (): string => {
        if (hasPendingWaypoints) {
            return translate('common.tbd');
        }
        if (totalDisplaySpend) {
            return CurrencyUtils.convertToDisplayString(totalDisplaySpend, iouReport?.currency);
        }
        if (isScanning) {
            return translate('iou.receiptScanning');
        }
        if (hasOnlyDistanceRequests) {
            return translate('common.tbd');
        }

        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmount = '';
        const actionMessage = action.message?.[0]?.text ?? '';
        const splits = actionMessage.split(' ');

        splits.forEach((split) => {
            if (!/\d/.test(split)) {
                return;
            }

            displayAmount = split;
        });

        return displayAmount;
    };

    const getPreviewMessage = () => {
        if (isScanning) {
            return translate('common.receipt');
        }
        const payerOrApproverName = isPolicyExpenseChat ? ReportUtils.getPolicyName(chatReport) : ReportUtils.getDisplayNameForParticipant(managerID, true);
        if (isApproved) {
            return translate('iou.managerApproved', {manager: payerOrApproverName});
        }
        const managerName = isPolicyExpenseChat ? ReportUtils.getPolicyName(chatReport) : ReportUtils.getDisplayNameForParticipant(managerID, true);
        let paymentVerb: TranslationPaths = hasNonReimbursableTransactions ? 'iou.payerSpent' : 'iou.payerOwes';
        if (iouSettled || iouReport?.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        }
        return translate(paymentVerb, {payer: managerName});
    };

    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);

    const isPaidGroupPolicy = ReportUtils.isPaidGroupPolicyExpenseChat(chatReport);
    const isPolicyAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isPayer = isPaidGroupPolicy
        ? // In a paid group policy, the admin approver can pay the report directly by skipping the approval step
          isPolicyAdmin && (isApproved || isCurrentUserManager)
        : isPolicyAdmin || (isMoneyRequestReport && isCurrentUserManager);
    const shouldShowPayButton = useMemo(
        () => isPayer && !isDraftExpenseReport && !iouSettled && !iouReport?.isWaitingOnBankAccount && reimbursableSpend !== 0 && !iouCanceled && !isAutoReimbursable,
        [isPayer, isDraftExpenseReport, iouSettled, reimbursableSpend, iouCanceled, isAutoReimbursable, iouReport],
    );
    const shouldShowApproveButton = useMemo(() => {
        if (!isPaidGroupPolicy) {
            return false;
        }
        return isCurrentUserManager && !isDraftExpenseReport && !isApproved && !iouSettled;
    }, [isPaidGroupPolicy, isCurrentUserManager, isDraftExpenseReport, isApproved, iouSettled]);
    const shouldShowSettlementButton = shouldShowPayButton || shouldShowApproveButton;
    return (
        <OfflineWithFeedback pendingAction={iouReport?.pendingFields?.preview}>
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPress={() => {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID));
                    }}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]}
                    role="button"
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <View style={[styles.reportPreviewBox, isHovered || isScanning || isWhisper ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        {hasReceipts && (
                            <ReportActionItemImages
                                images={lastThreeReceipts}
                                total={transactionsWithReceipts.length}
                                isHovered={isHovered || isScanning}
                                size={CONST.RECEIPT.MAX_REPORT_PREVIEW_RECEIPTS}
                            />
                        )}
                        <View style={styles.reportPreviewBoxBody}>
                            <View style={styles.flexRow}>
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                    <Text style={[styles.textLabelSupporting, styles.mb1, styles.lh20]}>{getPreviewMessage()}</Text>
                                </View>
                                {!iouSettled && hasErrors && (
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={theme.danger}
                                    />
                                )}
                            </View>
                            <View style={styles.flexRow}>
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                    <Text style={styles.textHeadline}>{getDisplayAmount()}</Text>
                                    {ReportUtils.isSettled(iouReportID) && (
                                        <View style={styles.defaultCheckmarkWrapper}>
                                            <Icon
                                                src={Expensicons.Checkmark}
                                                fill={theme.iconSuccessFill}
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                            {!isScanning && (numberOfRequests > 1 || (hasReceipts && numberOfRequests === 1 && formattedMerchant)) && (
                                <View style={styles.flexRow}>
                                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={[styles.textLabelSupporting, styles.textNormal, styles.mb1, styles.lh20]}>{previewSubtitle || moneyRequestComment}</Text>
                                    </View>
                                </View>
                            )}
                            {shouldShowSettlementButton && (
                                <SettlementButton
                                    // @ts-expect-error TODO: Remove this once SettlementButton (https://github.com/Expensify/App/issues/25100) is migrated to TypeScript.
                                    currency={iouReport?.currency}
                                    policyID={policyID}
                                    chatReportID={chatReportID}
                                    iouReport={iouReport}
                                    onPress={(paymentType: PaymentMethodType) => chatReport && iouReport && IOU.payMoneyRequest(paymentType, chatReport, iouReport)}
                                    enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                    addBankAccountRoute={bankAccountRoute}
                                    shouldHidePaymentOptions={!shouldShowPayButton}
                                    shouldShowApproveButton={shouldShowApproveButton}
                                    style={[styles.mt3]}
                                    kycWallAnchorAlignment={{
                                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                                    }}
                                    paymentMethodDropdownAnchorAlignment={{
                                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                                    }}
                                />
                            )}
                            {shouldShowSubmitButton && (
                                <Button
                                    medium
                                    success={isWaitingForSubmissionFromCurrentUser}
                                    text={translate('common.submit')}
                                    style={styles.mt3}
                                    onPress={() => iouReport && IOU.submitReport(iouReport)}
                                />
                            )}
                        </View>
                    </View>
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

ReportPreview.displayName = 'ReportPreview';

export default withOnyx<ReportPreviewProps, ReportPreviewOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    transactions: {
        key: ONYXKEYS.COLLECTION.TRANSACTION,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    },
})(ReportPreview);
