import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithCloseButton from './HeaderWithCloseButton';
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
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import SettlementButton from './SettlementButton';
import * as Policy from '../libs/actions/Policy';
import ONYXKEYS from '../ONYXKEYS';
import * as IOU from '../libs/actions/IOU';
import * as ReimbursementAccountProps from '../pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as CurrencyUtils from '../libs/CurrencyUtils';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** The chat report this report is linked to */
    chatReport: iouReportPropTypes,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Whether we're viewing a report with a single transaction in it */
    isSingleTransactionView: PropTypes.bool,

    /** The reimbursement account to use */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** Holds information about the users account */
    account: PropTypes.shape({
        /** The user's primary login */
        primaryLogin: PropTypes.string.isRequired,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isSingleTransactionView: false,
    chatReport: null,
    reimbursementAccount: null,
    account: null,
};

const MoneyRequestHeader = (props) => {
    const formattedAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(props.report), props.report.currency);
    const isSettled = ReportUtils.isSettled(props.chatReport.reportID);
    const isExpenseReport = ReportUtils.isExpenseReport(props.report);
    const payeeName = isExpenseReport ? ReportUtils.getPolicyName(props.report, props.policies) : ReportUtils.getDisplayNameForParticipant(props.report.managerEmail);
    const payeeAvatar = isExpenseReport
        ? ReportUtils.getWorkspaceAvatar(props.report)
        : ReportUtils.getAvatar(lodashGet(props.personalDetails, [props.report.managerEmail, 'avatar']), props.report.managerEmail);
    const policy = props.policies[`policy_${props.report.policyID}`];
    const shouldShowSettlementButton =
        props.account && !isSettled && (Policy.isAdminOfFreePolicy([policy]) || (props.report.type === CONST.REPORT.TYPE.IOU && props.account.primaryLogin === props.report.managerEmail));
    return (
        <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
            <HeaderWithCloseButton
                shouldShowAvatarWithDisplay
                shouldShowThreeDotsButton={!isSettled}
                threeDotsMenuItems={[
                    {
                        icon: Expensicons.Trashcan,
                        text: props.translate('common.delete'),
                        onSelected: () => {},
                    },
                ]}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(props.windowWidth)}
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                shouldShowCloseButton={false}
                shouldShowBackButton={props.isSmallScreenWidth}
                onBackButtonPress={() => Navigation.navigate(ROUTES.HOME)}
            />
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Avatar
                            source={payeeAvatar}
                            type={isExpenseReport ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR}
                            name={payeeName}
                            size={CONST.AVATAR_SIZE.HEADER}
                        />
                        <View style={[styles.flexColumn, styles.ml3]}>
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
                    <View style={[styles.flexRow]}>
                        {!props.isSingleTransactionView && <Text style={[styles.newKansasLarge]}>{formattedAmount}</Text>}
                        {isSettled && (
                            <View style={styles.moneyRequestHeaderCheckmark}>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={themeColors.iconSuccessFill}
                                />
                            </View>
                        )}
                    </View>
                </View>
                {shouldShowSettlementButton && (
                    <SettlementButton
                        currency={props.report.currency}
                        policyID={props.report.policyID}
                        shouldShowPaypal={false}
                        chatReportID={props.report.chatReportID}
                        onPress={(paymentType) => IOU.payMoneyRequest(paymentType, props.chatReport, props.report, props.reimbursementAccount && props.reimbursementAccount.state)}
                        enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                        shouldShowPaymentOptions
                    />
                )}
            </View>
        </View>
    );
};

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
MoneyRequestHeader.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        chatReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(MoneyRequestHeader);
