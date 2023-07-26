import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithBackButton from './HeaderWithBackButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import participantPropTypes from './participantPropTypes';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import SettlementButton from './SettlementButton';
import * as Policy from '../libs/actions/Policy';
import ONYXKEYS from '../ONYXKEYS';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import reportPropTypes from '../pages/reportPropTypes';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** The chat report this report is linked to */
    chatReport: reportPropTypes,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    chatReport: {},
    session: {
        email: null,
    },
};

function MoneyReportHeader(props) {
    const moneyRequestReport = props.report;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policy = props.policies[`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`];
    const isPayer =
        Policy.isAdminOfFreePolicy([policy]) || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(props.session, 'accountID', null) === moneyRequestReport.managerID);
    const shouldShowSettlementButton = !isSettled && isPayer && !moneyRequestReport.isWaitingOnBankAccount;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(props.chatReport);
    const shouldShowPaypal = Boolean(lodashGet(props.personalDetails, [moneyRequestReport.managerID, 'payPalMeAddress']));
    const formattedAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(props.report), props.report.currency);
    const {translate} = useLocalize();

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowAvatarWithDisplay
                shouldShowPinButton={false}
                shouldShowThreeDotsButton={false}
                threeDotsMenuItems={[
                    {
                        icon: Expensicons.Trashcan,
                        text: translate('common.delete'),
                        onSelected: () => {},
                    },
                ]}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(props.windowWidth)}
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                shouldShowBackButton={props.isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack(ROUTES.HOME, false, true)}
                shouldShowBorderBottom={!shouldShowSettlementButton || !props.isSmallScreenWidth}
            >
                {shouldShowSettlementButton && !props.isSmallScreenWidth && (
                    <View style={[styles.pv2]}>
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
                            style={[styles.pv2]}
                            formattedAmount={formattedAmount}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            {shouldShowSettlementButton && props.isSmallScreenWidth && (
                <View style={[styles.ph5, styles.pb2, props.isSmallScreenWidth && styles.borderBottom]}>
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
                        formattedAmount={formattedAmount}
                    />
                </View>
            )}
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';
MoneyReportHeader.propTypes = propTypes;
MoneyReportHeader.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        chatReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MoneyReportHeader);
