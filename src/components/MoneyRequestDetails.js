import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import participantPropTypes from './participantPropTypes';
import Avatar from './Avatar';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import withWindowDimensions from './withWindowDimensions';
import compose from '../libs/compose';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import SettlementButton from './SettlementButton';
import * as Policy from '../libs/actions/Policy';
import ONYXKEYS from '../ONYXKEYS';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import DateUtils from '../libs/DateUtils';
import reportPropTypes from '../pages/reportPropTypes';
import * as UserUtils from '../libs/UserUtils';
import OfflineWithFeedback from './OfflineWithFeedback';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    /** The chat report this report is linked to */
    chatReport: reportPropTypes,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Whether we're viewing a report with a single transaction in it */
    isSingleTransactionView: PropTypes.bool,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isSingleTransactionView: false,
    chatReport: {},
    session: {
        email: null,
    },
    parentReport: {},
    policy: null,
};

function MoneyRequestDetails(props) {
    // These are only used for the single transaction view and not for expense and iou reports
    const {amount: transactionAmount, currency: transactionCurrency, comment: transactionDescription} = ReportUtils.getMoneyRequestAction(props.parentReportAction);
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const transactionDate = lodashGet(props.parentReportAction, ['created']);
    const formattedTransactionDate = DateUtils.getDateStringFromISOTimestamp(transactionDate);

    const reportTotal = ReportUtils.getMoneyRequestTotal(props.report);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reportTotal, props.report.currency);
    const moneyRequestReport = props.isSingleTransactionView ? props.parentReport : props.report;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const isExpenseReport = ReportUtils.isExpenseReport(moneyRequestReport);
    const payeeName = isExpenseReport ? ReportUtils.getPolicyName(moneyRequestReport) : ReportUtils.getDisplayNameForParticipant(moneyRequestReport.managerID);
    const payeeAvatar = isExpenseReport
        ? ReportUtils.getWorkspaceAvatar(moneyRequestReport)
        : UserUtils.getAvatar(lodashGet(props.personalDetails, [moneyRequestReport.managerID, 'avatar']), moneyRequestReport.managerID);
    const isPayer =
        Policy.isAdminOfFreePolicy([props.policy]) || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(props.session, 'accountID', null) === moneyRequestReport.managerID);
    const shouldShowSettlementButton =
        moneyRequestReport.reportID && !isSettled && !props.isSingleTransactionView && isPayer && !moneyRequestReport.isWaitingOnBankAccount && reportTotal !== 0;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(props.chatReport);
    const shouldShowPaypal = Boolean(lodashGet(props.personalDetails, [moneyRequestReport.ownerAccountID, 'payPalMeAddress']));
    let description = `${props.translate('iou.amount')} • ${props.translate('iou.cash')}`;
    if (isSettled) {
        description += ` • ${props.translate('iou.settledExpensify')}`;
    } else if (props.report.isWaitingOnBankAccount) {
        description += ` • ${props.translate('iou.pending')}`;
    }

    const {addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(props.report);
    return (
        <OfflineWithFeedback
            pendingAction={addWorkspaceRoomOrChatPendingAction}
            errors={addWorkspaceRoomOrChatErrors}
            shouldShowErrorMessages={false}
        >
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb2]}>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Avatar
                                source={payeeAvatar}
                                type={isExpenseReport ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR}
                                name={payeeName}
                                size={CONST.AVATAR_SIZE.DEFAULT}
                            />
                            <View style={[styles.flex1, styles.flexColumn, styles.ml3]}>
                                <Text
                                    style={[styles.headerText, styles.pre]}
                                    numberOfLines={1}
                                >
                                    {payeeName}
                                </Text>
                                {isExpenseReport && (
                                    <Text
                                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                        numberOfLines={1}
                                    >
                                        {props.translate('workspace.common.workspace')}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            {!props.isSingleTransactionView && <Text style={[styles.newKansasLarge]}>{formattedAmount}</Text>}
                            {!props.isSingleTransactionView && isSettled && (
                                <View style={styles.defaultCheckmarkWrapper}>
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={themeColors.iconSuccessFill}
                                    />
                                </View>
                            )}
                            {shouldShowSettlementButton && !props.isSmallScreenWidth && (
                                <View style={[styles.ml4]}>
                                    <SettlementButton
                                        currency={props.report.currency}
                                        policyID={props.report.policyID}
                                        shouldShowPaypal={shouldShowPaypal}
                                        chatReportID={props.chatReport.reportID}
                                        iouReport={props.report}
                                        onPress={(paymentType) => IOU.payMoneyRequest(paymentType, props.chatReport, props.report)}
                                        enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                                        addBankAccountRoute={bankAccountRoute}
                                        shouldShowPaymentOptions
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                    {shouldShowSettlementButton && props.isSmallScreenWidth && (
                        <SettlementButton
                            currency={props.report.currency}
                            policyID={props.report.policyID}
                            shouldShowPaypal={shouldShowPaypal}
                            chatReportID={props.report.chatReportID}
                            iouReport={props.report}
                            onPress={(paymentType) => IOU.payMoneyRequest(paymentType, props.chatReport, props.report)}
                            enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                            addBankAccountRoute={bankAccountRoute}
                            shouldShowPaymentOptions
                        />
                    )}
                </View>
                {props.isSingleTransactionView && (
                    <>
                        <MenuItemWithTopDescription
                            title={formattedTransactionAmount}
                            shouldShowTitleIcon={isSettled}
                            titleIcon={Expensicons.Checkmark}
                            description={description}
                            titleStyle={styles.newKansasLarge}
                            disabled={isSettled}
                            // Note: These options are temporarily disabled while we figure out the required API changes
                            // shouldShowRightIcon={!isSettled}
                            // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                        />
                        <MenuItemWithTopDescription
                            description={props.translate('common.description')}
                            title={transactionDescription}
                            disabled={isSettled}
                            // shouldShowRightIcon={!isSettled}
                            // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
                        />
                        <MenuItemWithTopDescription
                            description={props.translate('common.date')}
                            title={formattedTransactionDate}
                            // shouldShowRightIcon={!isSettled}
                            // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
                        />
                    </>
                )}
            </View>
        </OfflineWithFeedback>
    );
}

MoneyRequestDetails.displayName = 'MoneyRequestDetails';
MoneyRequestDetails.propTypes = propTypes;
MoneyRequestDetails.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        chatReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        parentReport: {
            key: (props) => `${ONYXKEYS.COLLECTION.REPORT}${props.report.parentReportID}`,
        },
    }),
)(MoneyRequestDetails);
