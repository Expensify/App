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
import useWindowDimensions from '../hooks/useWindowDimensions';
import useLocalize from '../hooks/useLocalize';

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

function MoneyRequestDetails({isSingleTransactionView, report, chatReport, session, parentReport, policy, parentReportAction, personalDetails}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    // These are only used for the single transaction view and not for expense and iou reports
    const {amount: transactionAmount, currency: transactionCurrency, comment: transactionDescription} = ReportUtils.getMoneyRequestAction(parentReportAction);
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const transactionDate = lodashGet(parentReportAction, ['created']);
    const formattedTransactionDate = DateUtils.getDateStringFromISOTimestamp(transactionDate);

    const formattedAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(report), report.currency);
    const moneyRequestReport = isSingleTransactionView ? parentReport : report;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const isExpenseReport = ReportUtils.isExpenseReport(moneyRequestReport);
    const payeeName = isExpenseReport ? ReportUtils.getPolicyName(moneyRequestReport) : ReportUtils.getDisplayNameForParticipant(moneyRequestReport.managerID);
    const payeeAvatar = isExpenseReport
    ? ReportUtils.getWorkspaceAvatar(moneyRequestReport)
    : UserUtils.getAvatar(lodashGet(personalDetails, [moneyRequestReport.managerID, 'avatar']), moneyRequestReport.managerID);
    const isPayer =
    Policy.isAdminOfFreePolicy([policy]) || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === moneyRequestReport.managerID);
    const canEdit = !isSettled && (isExpenseReport || (ReportUtils.isIOUReport(moneyRequestReport) && !isPayer))
    const shouldShowSettlementButton = moneyRequestReport.reportID && !isSettled && !isSingleTransactionView && isPayer && !moneyRequestReport.isWaitingOnBankAccount;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const shouldShowPaypal = Boolean(lodashGet(personalDetails, [moneyRequestReport.ownerAccountID, 'payPalMeAddress']));
    let description = `${translate('iou.amount')} • ${translate('iou.cash')}`;
    if (isSettled) {
        description += ` • ${translate('iou.settledExpensify')}`;
    } else if (report.isWaitingOnBankAccount) {
        description += ` • ${translate('iou.pending')}`;
    }

    const {addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(report);
    return (
        <OfflineWithFeedback
            pendingAction={addWorkspaceRoomOrChatPendingAction}
            errors={addWorkspaceRoomOrChatErrors}
            shouldShowErrorMessages={false}
        >
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb2]}>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{translate('common.to')}</Text>
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
                                        {translate('workspace.common.workspace')}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            {!isSingleTransactionView && <Text style={[styles.newKansasLarge]}>{formattedAmount}</Text>}
                            {!isSingleTransactionView && isSettled && (
                                <View style={styles.defaultCheckmarkWrapper}>
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={themeColors.iconSuccessFill}
                                    />
                                </View>
                            )}
                            {shouldShowSettlementButton && !isSmallScreenWidth && (
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
                    {shouldShowSettlementButton && isSmallScreenWidth && (
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
                {isSingleTransactionView && (
                    <>
                        <MenuItemWithTopDescription
                            title={formattedTransactionAmount}
                            shouldShowTitleIcon={isSettled}
                            titleIcon={Expensicons.Checkmark}
                            description={description}
                            titleStyle={styles.newKansasLarge}
                            disabled={isSettled}
                            shouldShowRightIcon={canEdit}
                            onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                        />
                        <MenuItemWithTopDescription
                            description={translate('common.description')}
                            title={transactionDescription}
                            disabled={isSettled}
                            shouldShowRightIcon={canEdit}
                            onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
                        />
                        <MenuItemWithTopDescription
                            description={translate('common.date')}
                            title={formattedTransactionDate}
                            shouldShowRightIcon={canEdit}
                            onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
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
