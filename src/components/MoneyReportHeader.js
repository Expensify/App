import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import useLocalize from '../hooks/useLocalize';
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

function MoneyReportHeader({session, personalDetails, policies, chatReport, report: moneyRequestReport, isSmallScreenWidth}) {
    const {translate} = useLocalize();
    const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport.policyID}`];
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const isPolicyAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === moneyRequestReport.managerID;
    const isPayer = CONST.POLICY.TYPE.CORPORATE ? isPolicyAdmin && isApproved : isPolicyAdmin || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && isManager);
    const shouldShowSettlementButton = useMemo(() => isPayer && !isSettled, [isPayer, isSettled]);
    const shouldShowApproveButton = useMemo(() => {
        if (policy.type === CONST.POLICY.TYPE.FREE) {
            return false;
        }
        return isManager && !isApproved && !isSettled;
    }, [policy, isManager, isApproved, isSettled]);
    const reportTotal = ReportUtils.getMoneyRequestTotal(moneyRequestReport);
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const shouldShowPaypal = Boolean(lodashGet(personalDetails, [moneyRequestReport.managerID, 'payPalMeAddress']));
    const formattedAmount = CurrencyUtils.convertToDisplayString(reportTotal, moneyRequestReport.currency);

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowAvatarWithDisplay
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policies={props.policies}
                personalDetails={personalDetails}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack(ROUTES.HOME, false, true)}
                shouldShowBorderBottom={!shouldShowSettlementButton || !isSmallScreenWidth}
            >
                {shouldShowSettlementButton && !isSmallScreenWidth && (
                    <View style={[styles.pv2]}>
                        <SettlementButton
                            currency={moneyRequestReport.currency}
                            policyID={moneyRequestReport.policyID}
                            shouldShowPaypal={shouldShowPaypal}
                            chatReportID={chatReport.reportID}
                            iouReport={moneyRequestReport}
                            onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
                            enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                            addBankAccountRoute={bankAccountRoute}
                            shouldShowPaymentOptions
                            style={[styles.pv2]}
                            formattedAmount={formattedAmount}
                        />
                    </View>
                )}
                {shouldShowApproveButton && !isSmallScreenWidth && (
                    <View style={[styles.pv2]}>
                        <Button
                            success
                            text={translate('iou.approve')}
                            style={[styles.mnw120]}
                            onPress={() => IOU.approveMoneyRequest(moneyRequestReport)}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            {shouldShowSettlementButton && isSmallScreenWidth && (
                <View style={[styles.ph5, styles.pb2, isSmallScreenWidth && styles.borderBottom]}>
                    <SettlementButton
                        currency={moneyRequestReport.currency}
                        policyID={moneyRequestReport.policyID}
                        shouldShowPaypal={shouldShowPaypal}
                        chatReportID={moneyRequestReport.chatReportID}
                        iouReport={moneyRequestReport}
                        onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReportt)}
                        enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                        addBankAccountRoute={bankAccountRoute}
                        shouldShowPaymentOptions
                        formattedAmount={formattedAmount}
                    />
                </View>
            )}
            {shouldShowApproveButton && isSmallScreenWidth && (
                <View style={[styles.pv2]}>
                    <Button
                        success
                        text={translate('iou.approve')}
                        style={[styles.w100]}
                        onPress={() => IOU.approveMoneyRequest(moneyRequestReport)}
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
