import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import refPropTypes from '@components/refPropTypes';
import SettlementButton from '@components/SettlementButton';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {transactionViolationsPropType} from '@libs/Violations/propTypes';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ReportActionItemImages from './ReportActionItemImages';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /** The report's policyID, used for Onyx subscription */
    policyID: PropTypes.string.isRequired,

    /** The policy tied to the money request report */
    policy: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,

        /** Type of the policy */
        type: PropTypes.string,

        /** The role of the current user in the policy */
        role: PropTypes.string,

        /** Whether Scheduled Submit is turned on for this policy */
        isHarvestingEnabled: PropTypes.bool,
    }),

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: reportPropTypes,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** AccountID of the manager in this iou report */
        managerID: PropTypes.number,

        /** AccountID of the creator of this iou report */
        ownerAccountID: PropTypes.number,

        /** Outstanding amount in cents of this transaction */
        total: PropTypes.number,

        /** Currency of outstanding amount of this transaction */
        currency: PropTypes.string,

        /** Is the iouReport waiting for the submitter to add a credit bank account? */
        isWaitingOnBankAccount: PropTypes.bool,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: refPropTypes,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /** Whether a message is a whisper */
    isWhisper: PropTypes.bool,

    /** All the transactions, used to update ReportPreview label and status */
    transactions: PropTypes.objectOf(transactionPropTypes),

    /** All of the transaction violations */
    transactionViolations: transactionViolationsPropType,

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: null,
    chatReport: {},
    containerStyles: [],
    iouReport: {},
    checkIfContextMenuActive: () => {},
    session: {
        accountID: null,
    },
    isWhisper: false,
    transactionViolations: {
        violations: [],
    },
    policy: {
        isHarvestingEnabled: false,
    },
    transactions: {},
};

function ReportPreview(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();

    const {hasMissingSmartscanFields, areAllRequestsBeingSmartScanned, hasOnlyDistanceRequests, hasNonReimbursableTransactions} = useMemo(
        () => ({
            hasMissingSmartscanFields: ReportUtils.hasMissingSmartscanFields(props.iouReportID),
            areAllRequestsBeingSmartScanned: ReportUtils.areAllRequestsBeingSmartScanned(props.iouReportID, props.action),
            hasOnlyDistanceRequests: ReportUtils.hasOnlyDistanceRequestTransactions(props.iouReportID),
            hasNonReimbursableTransactions: ReportUtils.hasNonReimbursableTransactions(props.iouReportID),
        }),
        // When transactions get updated these status may have changed, so that is a case where we also want to run this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.transactions, props.iouReportID, props.action],
    );

    const managerID = props.iouReport.managerID || 0;
    const isCurrentUserManager = managerID === lodashGet(props.session, 'accountID');
    const {totalDisplaySpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(props.iouReport);
    const policyType = lodashGet(props.policy, 'type');
    const isAutoReimbursable = ReportUtils.canBeAutoReimbursed(props.iouReport, props.policy);

    const iouSettled = ReportUtils.isSettled(props.iouReportID);
    const iouCanceled = ReportUtils.isArchivedRoom(props.chatReport);
    const numberOfRequests = ReportActionUtils.getNumberOfMoneyRequests(props.action);
    const moneyRequestComment = lodashGet(props.action, 'childLastMoneyRequestComment', '');
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.chatReport);
    const isDraftExpenseReport = isPolicyExpenseChat && ReportUtils.isDraftExpenseReport(props.iouReport);

    const isApproved = ReportUtils.isReportApproved(props.iouReport);
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(props.iouReport);
    const transactionsWithReceipts = ReportUtils.getTransactionsWithReceipts(props.iouReportID);
    const numberOfScanningReceipts = _.filter(transactionsWithReceipts, (transaction) => TransactionUtils.isReceiptBeingScanned(transaction)).length;
    const hasReceipts = transactionsWithReceipts.length > 0;
    const isScanning = hasReceipts && areAllRequestsBeingSmartScanned;
    const hasErrors = (hasReceipts && hasMissingSmartscanFields) || (canUseViolations && ReportUtils.hasViolations(props.iouReportID, props.transactionViolations));
    const lastThreeTransactionsWithReceipts = transactionsWithReceipts.slice(-3);
    const lastThreeReceipts = _.map(lastThreeTransactionsWithReceipts, (transaction) => ReceiptUtils.getThumbnailAndImageURIs(transaction));
    let formattedMerchant = numberOfRequests === 1 && hasReceipts ? TransactionUtils.getMerchant(transactionsWithReceipts[0]) : null;
    if (TransactionUtils.isPartialMerchant(formattedMerchant)) {
        formattedMerchant = null;
    }
    const hasPendingWaypoints = formattedMerchant && hasOnlyDistanceRequests && _.every(transactionsWithReceipts, (transaction) => lodashGet(transaction, 'pendingFields.waypoints', null));
    if (hasPendingWaypoints) {
        formattedMerchant = formattedMerchant.replace(CONST.REGEX.FIRST_SPACE, props.translate('common.tbd'));
    }
    const previewSubtitle =
        formattedMerchant ||
        props.translate('iou.requestCount', {
            count: numberOfRequests - numberOfScanningReceipts,
            scanningReceipts: numberOfScanningReceipts,
        });

    const shouldShowSubmitButton = isDraftExpenseReport && reimbursableSpend !== 0;

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => props.chatReport.isOwnPolicyExpenseChat && !props.policy.isHarvestingEnabled,
        [props.chatReport.isOwnPolicyExpenseChat, props.policy.isHarvestingEnabled],
    );

    const getDisplayAmount = () => {
        if (hasPendingWaypoints) {
            return props.translate('common.tbd');
        }
        if (totalDisplaySpend) {
            return CurrencyUtils.convertToDisplayString(totalDisplaySpend, props.iouReport.currency);
        }
        if (isScanning) {
            return props.translate('iou.receiptScanning');
        }
        if (hasOnlyDistanceRequests) {
            return props.translate('common.tbd');
        }

        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmount = '';
        const actionMessage = lodashGet(props.action, ['message', 0, 'text'], '');
        const splits = actionMessage.split(' ');
        for (let i = 0; i < splits.length; i++) {
            if (/\d/.test(splits[i])) {
                displayAmount = splits[i];
            }
        }
        return displayAmount;
    };

    const getPreviewMessage = () => {
        if (isScanning) {
            return props.translate('common.receipt');
        }
        const payerOrApproverName = isPolicyExpenseChat ? ReportUtils.getPolicyName(props.chatReport) : ReportUtils.getDisplayNameForParticipant(managerID, true);
        if (isApproved) {
            return props.translate('iou.managerApproved', {manager: payerOrApproverName});
        }
        const managerName = isPolicyExpenseChat ? ReportUtils.getPolicyName(props.chatReport) : ReportUtils.getDisplayNameForParticipant(managerID, true);
        let paymentVerb = hasNonReimbursableTransactions ? 'iou.payerSpent' : 'iou.payerOwes';
        if (iouSettled || props.iouReport.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        }
        return props.translate(paymentVerb, {payer: managerName});
    };

    const bankAccountRoute = ReportUtils.getBankAccountRoute(props.chatReport);

    const isPaidGroupPolicy = ReportUtils.isPaidGroupPolicyExpenseChat(props.chatReport);
    const isPolicyAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && lodashGet(props.policy, 'role') === CONST.POLICY.ROLE.ADMIN;
    const isPayer = isPaidGroupPolicy
        ? // In a paid group policy, the admin approver can pay the report directly by skipping the approval step
          isPolicyAdmin && (isApproved || isCurrentUserManager)
        : isPolicyAdmin || (isMoneyRequestReport && isCurrentUserManager);
    const shouldShowPayButton = useMemo(
        () => isPayer && !isDraftExpenseReport && !iouSettled && !props.iouReport.isWaitingOnBankAccount && reimbursableSpend !== 0 && !iouCanceled && !isAutoReimbursable,
        [isPayer, isDraftExpenseReport, iouSettled, reimbursableSpend, iouCanceled, isAutoReimbursable, props.iouReport],
    );
    const shouldShowApproveButton = useMemo(() => {
        if (!isPaidGroupPolicy) {
            return false;
        }
        return isCurrentUserManager && !isDraftExpenseReport && !isApproved && !iouSettled;
    }, [isPaidGroupPolicy, isCurrentUserManager, isDraftExpenseReport, isApproved, iouSettled]);
    const shouldShowSettlementButton = shouldShowPayButton || shouldShowApproveButton;
    return (
        <OfflineWithFeedback pendingAction={lodashGet(props, 'iouReport.pendingFields.preview')}>
            <View style={[styles.chatItemMessage, ...props.containerStyles]}>
                <PressableWithoutFeedback
                    onPress={() => {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(props.iouReportID));
                    }}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive)}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]}
                    role="button"
                    accessibilityLabel={props.translate('iou.viewDetails')}
                >
                    <View style={[styles.reportPreviewBox, props.isHovered || isScanning || props.isWhisper ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        {hasReceipts && (
                            <ReportActionItemImages
                                images={lastThreeReceipts}
                                total={transactionsWithReceipts.length}
                                isHovered={props.isHovered || isScanning}
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
                                    {ReportUtils.isSettled(props.iouReportID) && (
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
                                    currency={props.iouReport.currency}
                                    policyID={props.policyID}
                                    chatReportID={props.chatReportID}
                                    iouReport={props.iouReport}
                                    onPress={(paymentType) => IOU.payMoneyRequest(paymentType, props.chatReport, props.iouReport)}
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
                                    onPress={() => IOU.submitReport(props.iouReport)}
                                />
                            )}
                        </View>
                    </View>
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

ReportPreview.propTypes = propTypes;
ReportPreview.defaultProps = defaultProps;
ReportPreview.displayName = 'ReportPreview';

export default compose(
    withLocalize,
    withOnyx({
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
    }),
)(ReportPreview);
