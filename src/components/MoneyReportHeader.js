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

    /** The policy tied to the money request report */
    policy: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,

        /** Type of the policy */
        type: PropTypes.string,

        /** The role of the current user in the policy */
        role: PropTypes.string,
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

function MoneyReportHeader({session, personalDetails, policy, chatReport, report: moneyRequestReport, isSmallScreenWidth}) {
    const {translate} = useLocalize();
    const reportTotal = ReportUtils.getMoneyRequestTotal(moneyRequestReport);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policyType = lodashGet(policy, 'type');
    const isPolicyAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && lodashGet(policy, 'role') === CONST.POLICY.ROLE.ADMIN;
    const isManager = ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === moneyRequestReport.managerID;
    const isPayer = policyType === CONST.POLICY.TYPE.CORPORATE ? isPolicyAdmin && isApproved : isPolicyAdmin || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && isManager);
    const shouldShowSettlementButton = useMemo(
        () => isPayer && !isSettled && !moneyRequestReport.isWaitingOnBankAccount && reportTotal !== 0,
        [isPayer, isSettled, moneyRequestReport, reportTotal],
    );
    const shouldShowApproveButton = useMemo(() => {
        if (policyType !== CONST.POLICY.TYPE.CORPORATE) {
            return false;
        }
        return isManager && !isApproved && !isSettled;
    }, [policyType, isManager, isApproved, isSettled]);
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const shouldShowPaypal = Boolean(lodashGet(personalDetails, [moneyRequestReport.managerID, 'payPalMeAddress']));
    const formattedAmount = CurrencyUtils.convertToDisplayString(reportTotal, moneyRequestReport.currency);

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowAvatarWithDisplay
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
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
                            medium
                            text={translate('iou.approve')}
                            style={[styles.mnw120, styles.pv2, styles.pr0]}
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
                        onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
                        enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                        addBankAccountRoute={bankAccountRoute}
                        shouldShowPaymentOptions
                        formattedAmount={formattedAmount}
                    />
                </View>
            )}
            {shouldShowApproveButton && isSmallScreenWidth && (
                <View style={[styles.ph5, styles.pb2, isSmallScreenWidth && styles.borderBottom]}>
                    <Button
                        success
                        medium
                        text={translate('iou.approve')}
                        style={[styles.w100, styles.pr0]}
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
