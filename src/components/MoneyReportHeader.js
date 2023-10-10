import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
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
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import reportPropTypes from '../pages/reportPropTypes';
import * as Policy from '../libs/actions/Policy';

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
    }),

    /** The chat report this report is linked to */
    chatReport: reportPropTypes,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Next steps buttons to take action for an expense report */
    nextStepButtons: PropTypes.objectOf(PropTypes.shape({
        /** Text of the next step button */
        text: PropTypes.string,
    })),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    chatReport: {},
    session: {
        email: null,
    },
    nextStepButtons: {},
    policy: {},
};

function MoneyReportHeader({session, personalDetails, policy, chatReport, report: moneyRequestReport, isSmallScreenWidth, nextStepButtons}) {
    const reportTotal = ReportUtils.getMoneyRequestTotal(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const isPayer = Policy.isAdminOfFreePolicy([policy]) || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === moneyRequestReport.managerID);
    const shouldShowPayButtonForFreePlan = !isSettled && isPayer && !moneyRequestReport.isWaitingOnBankAccount && reportTotal !== 0;
    const shouldShowSettlementButton = shouldShowPayButtonForFreePlan || nextStepButtons.approve || nextStepButtons.reimburse;
    const shouldShowPaymentOptions = shouldShowPayButtonForFreePlan || nextStepButtons.reimburse;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reportTotal, moneyRequestReport.currency);

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowAvatarWithDisplay
                shouldEnableDetailPageNavigation
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
                            chatReportID={chatReport.reportID}
                            iouReport={moneyRequestReport}
                            onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
                            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                            addBankAccountRoute={bankAccountRoute}
                            shouldShowPaymentOptions={shouldShowPaymentOptions}
                            style={[styles.pv2]}
                            formattedAmount={formattedAmount}
                            nextStepButtons={nextStepButtons}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                            }}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            {shouldShowSettlementButton && isSmallScreenWidth && (
                <View style={[styles.ph5, styles.pb2, isSmallScreenWidth && styles.borderBottom]}>
                    <SettlementButton
                        currency={moneyRequestReport.currency}
                        policyID={moneyRequestReport.policyID}
                        chatReportID={moneyRequestReport.chatReportID}
                        iouReport={moneyRequestReport}
                        onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
                        enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                        addBankAccountRoute={bankAccountRoute}
                        shouldShowPaymentOptions={shouldShowPaymentOptions}
                        formattedAmount={formattedAmount}
                        nextStepButtons={nextStepButtons}
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
        nextStepButtons: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_NEXT_STEP}${report.reportID}`,
            selector: (nextStep) => lodashGet(nextStep, 'buttons'),
        }
    }),
)(MoneyReportHeader);
