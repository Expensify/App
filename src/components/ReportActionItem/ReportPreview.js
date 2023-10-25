import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Button from '../Button';
import Icon from '../Icon';
import Text from '../Text';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ControlSelection from '../../libs/ControlSelection';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {showContextMenuForReport} from '../ShowContextMenuContext';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import useLocalize from '../../hooks/useLocalize';
import SettlementButton from '../SettlementButton';
import * as IOU from '../../libs/actions/IOU';
import refPropTypes from '../refPropTypes';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import themeColors from '../../styles/themes/default';
import reportPropTypes from '../../pages/reportPropTypes';
import * as ReceiptUtils from '../../libs/ReceiptUtils';
import * as ReportActionUtils from '../../libs/ReportActionsUtils';
import * as TransactionUtils from '../../libs/TransactionUtils';
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

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,

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
};

function ReportPreview(props) {
    const {translate} = useLocalize();

    const managerID = props.iouReport.managerID || 0;
    const isCurrentUserManager = managerID === lodashGet(props.session, 'accountID');
    const {totalDisplaySpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(props.iouReport);

    const iouSettled = ReportUtils.isSettled(props.iouReportID);
    const iouCanceled = ReportUtils.isArchivedRoom(props.chatReport);
    const numberOfRequests = ReportActionUtils.getNumberOfMoneyRequests(props.action);
    const moneyRequestComment = lodashGet(props.action, 'childLastMoneyRequestComment', '');
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.chatReport);
    const isReportDraft = isPolicyExpenseChat && ReportUtils.isReportDraft(props.iouReport);

    const transactionsWithReceipts = ReportUtils.getTransactionsWithReceipts(props.iouReportID);
    const numberOfScanningReceipts = _.filter(transactionsWithReceipts, (transaction) => TransactionUtils.isReceiptBeingScanned(transaction)).length;
    const hasReceipts = transactionsWithReceipts.length > 0;
    const hasOnlyDistanceRequests = ReportUtils.hasOnlyDistanceRequestTransactions(props.iouReportID);
    const isScanning = hasReceipts && ReportUtils.areAllRequestsBeingSmartScanned(props.iouReportID, props.action);
    const hasErrors = hasReceipts && ReportUtils.hasMissingSmartscanFields(props.iouReportID);
    const lastThreeTransactionsWithReceipts = transactionsWithReceipts.slice(-3);
    const lastThreeReceipts = _.map(lastThreeTransactionsWithReceipts, (transaction) => ReceiptUtils.getThumbnailAndImageURIs(transaction));
    const hasNonReimbursableTransactions = ReportUtils.hasNonReimbursableTransactions(props.iouReportID);
    const hasOnlyOneReceiptRequest = numberOfRequests === 1 && hasReceipts;
    const previewSubtitle = hasOnlyOneReceiptRequest
        ? TransactionUtils.getMerchant(transactionsWithReceipts[0])
        : props.translate('iou.requestCount', {
              count: numberOfRequests,
              scanningReceipts: numberOfScanningReceipts,
          });

    const shouldShowSubmitButton = isReportDraft && reimbursableSpend !== 0;

    const getDisplayAmount = () => {
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
        if (ReportUtils.isControlPolicyExpenseChat(props.chatReport) && ReportUtils.isReportApproved(props.iouReport)) {
            return props.translate('iou.managerApproved', {manager: ReportUtils.getDisplayNameForParticipant(managerID, true)});
        }
        const managerName = isPolicyExpenseChat ? ReportUtils.getPolicyName(props.chatReport) : ReportUtils.getDisplayNameForParticipant(managerID, true);
        let paymentVerb = hasNonReimbursableTransactions ? 'iou.payerSpent' : 'iou.payerOwes';
        if (iouSettled || props.iouReport.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        }
        return props.translate(paymentVerb, {payer: managerName});
    };

    const bankAccountRoute = ReportUtils.getBankAccountRoute(props.chatReport);
    const shouldShowSettlementButton = ReportUtils.isControlPolicyExpenseChat(props.chatReport)
        ? props.policy.role === CONST.POLICY.ROLE.ADMIN && ReportUtils.isReportApproved(props.iouReport) && !iouSettled && !iouCanceled
        : !_.isEmpty(props.iouReport) && isCurrentUserManager && !isReportDraft && !iouSettled && !iouCanceled && !props.iouReport.isWaitingOnBankAccount && reimbursableSpend !== 0;

    return (
        <View style={[styles.chatItemMessage, ...props.containerStyles]}>
            <PressableWithoutFeedback
                onPress={() => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(props.iouReportID));
                }}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) => showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive)}
                style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]}
                accessibilityRole="button"
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
                            {hasErrors && (
                                <Icon
                                    src={Expensicons.DotIndicator}
                                    fill={themeColors.danger}
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
                                            fill={themeColors.iconSuccessFill}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        {!isScanning && (numberOfRequests > 1 || hasReceipts) && (
                            <View style={styles.flexRow}>
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                    <Text style={[styles.textLabelSupporting, styles.mb1, styles.lh20]}>{previewSubtitle || moneyRequestComment}</Text>
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
                                shouldShowPaymentOptions
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
                                success={props.chatReport.isOwnPolicyExpenseChat}
                                text={translate('common.submit')}
                                style={styles.mt3}
                                onPress={() => IOU.submitReport(props.iouReport)}
                            />
                        )}
                    </View>
                </View>
            </PressableWithoutFeedback>
        </View>
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
    }),
)(ReportPreview);
