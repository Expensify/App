import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import withLocalize from './withLocalize';
import HeaderWithBackButton from './HeaderWithBackButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import * as ReportUtils from '../libs/ReportUtils';
import participantPropTypes from './participantPropTypes';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import SettlementButton from './SettlementButton';
import Button from './Button';
import * as Policy from '../libs/actions/Policy';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import reportPropTypes from '../pages/reportPropTypes';

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
    const policy = props.policies[`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`];
    const reportTotal = ReportUtils.getMoneyRequestTotal(props.report);
    const shouldShowSettlementButton = useMemo(() => {
        if (ReportUtils.getPolicyType(moneyRequestReport, props.policies) === CONST.POLICY.TYPE.CORPORATE) {
            return Policy.isAdminOfControlPolicy([policy]) && ReportUtils.isReportApproved(moneyRequestReport);
        }

        return (
            (Policy.isAdminOfFreePolicy([policy]) ||
                (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(props.session, 'accountID', null) === moneyRequestReport.managerID)) &&
            !ReportUtils.isSettled(moneyRequestReport.reportID)
        );
    }, [moneyRequestReport, policy, props.policies, props.session]);
    const shouldShowApprovedButton = useMemo(() => {
        if (ReportUtils.getPolicyType(moneyRequestReport) === CONST.POLICY.TYPE.FREE) {
            return false;
        }
        return ReportUtils.isReportManager(moneyRequestReport) && !ReportUtils.isReportApproved(moneyRequestReport) && !ReportUtils.isSettled(moneyRequestReport.reportID);
    }, [moneyRequestReport]);
    const bankAccountRoute = ReportUtils.getBankAccountRoute(props.chatReport);
    const shouldShowPaypal = Boolean(lodashGet(props.personalDetails, [moneyRequestReport.managerID, 'payPalMeAddress']));
    const formattedAmount = CurrencyUtils.convertToDisplayString(reportTotal, props.report.currency);

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowAvatarWithDisplay
                shouldShowPinButton={false}
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
                {shouldShowApprovedButton && !props.isSmallScreenWidth && (
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Button
                            success
                            text={props.translate('iou.approve')}
                            style={[styles.mnw120]}
                            onPress={() => IOU.approveMoneyRequest(props.report)}
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
            {shouldShowApprovedButton && props.isSmallScreenWidth && (
                <View style={[styles.ph5, styles.pb2, props.isSmallScreenWidth && styles.borderBottom]}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Button
                            success
                            text={props.translate('iou.approve')}
                            style={[styles.w100]}
                            onPress={() => IOU.approveMoneyRequest(props.report)}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';
MoneyReportHeader.propTypes = propTypes;
MoneyReportHeader.defaultProps = defaultProps;

export default compose(
    withLocalize,
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
