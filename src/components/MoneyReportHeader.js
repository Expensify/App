import React, {useMemo} from 'react';
import _ from 'underscore';
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
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import SettlementButton from './SettlementButton';
import Button from './Button';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import reportPropTypes from '../pages/reportPropTypes';
import nextStepPropTypes from '../pages/nextStepPropTypes';

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

    /** The next step for the report */
    nextStep: nextStepPropTypes,

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
    nextStep: {},
    session: {
        email: null,
    },
    policy: {},
};

function MoneyReportHeader({session, personalDetails, policy, chatReport, nextStep, report: moneyRequestReport, isSmallScreenWidth}) {
    const {translate} = useLocalize();
    const reimbursableTotal = ReportUtils.getMoneyRequestReimbursableTotal(moneyRequestReport);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policyType = lodashGet(policy, 'type');
    const isPolicyAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && lodashGet(policy, 'role') === CONST.POLICY.ROLE.ADMIN;
    const isManager = ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === moneyRequestReport.managerID;
    const isPayer = policyType === CONST.POLICY.TYPE.CORPORATE ? isPolicyAdmin && isApproved : isPolicyAdmin || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && isManager);
    const isDraft = ReportUtils.isReportDraft(moneyRequestReport);
    const shouldShowSettlementButton = useMemo(
        () => isPayer && !isDraft && !isSettled && !moneyRequestReport.isWaitingOnBankAccount && reimbursableTotal !== 0 && !ReportUtils.isArchivedRoom(chatReport),
        [isPayer, isDraft, isSettled, moneyRequestReport, reimbursableTotal, chatReport],
    );
    const shouldShowApproveButton = useMemo(() => {
        if (policyType !== CONST.POLICY.TYPE.CORPORATE) {
            return false;
        }
        return isManager && !isDraft && !isApproved && !isSettled;
    }, [policyType, isManager, isDraft, isApproved, isSettled]);
    const shouldShowSubmitButton = isDraft && reimbursableTotal !== 0;
    const shouldShowNextSteps = isDraft && nextStep && (!_.isEmpty(nextStep.message) || !_.isEmpty(nextStep.expenseMessage));
    const shouldShowAnyButton = shouldShowSettlementButton || shouldShowApproveButton || shouldShowSubmitButton || shouldShowNextSteps;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reimbursableTotal, moneyRequestReport.currency);
    const isMoreContentShown = shouldShowNextSteps || (shouldShowAnyButton && isSmallScreenWidth);

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
                // Shows border if no buttons or next steps are showing below the header
                shouldShowBorderBottom={!(shouldShowAnyButton && isSmallScreenWidth) && !(shouldShowNextSteps && !isSmallScreenWidth)}
            >
                {shouldShowSettlementButton && !isSmallScreenWidth && (
                    <View style={styles.pv2}>
                        <SettlementButton
                            currency={moneyRequestReport.currency}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={chatReport.reportID}
                            iouReport={moneyRequestReport}
                            onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
                            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                            addBankAccountRoute={bankAccountRoute}
                            shouldShowPaymentOptions
                            style={[styles.pv2]}
                            formattedAmount={formattedAmount}
                        />
                    </View>
                )}
                {shouldShowApproveButton && !isSmallScreenWidth && (
                    <View style={styles.pv2}>
                        <Button
                            success
                            medium
                            text={translate('iou.approve')}
                            style={[styles.mnw120, styles.pv2, styles.pr0]}
                            onPress={() => IOU.approveMoneyRequest(moneyRequestReport)}
                        />
                    </View>
                )}
                {shouldShowSubmitButton && !isSmallScreenWidth && (
                    <View style={styles.pv2}>
                        <Button
                            medium
                            success={chatReport.isOwnPolicyExpenseChat}
                            text={translate('common.submit')}
                            style={[styles.mnw120, styles.pv2, styles.pr0]}
                            onPress={() => IOU.submitReport(moneyRequestReport)}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            <View style={isMoreContentShown ? [styles.dFlex, styles.flexColumn, styles.borderBottom] : []}>
                {shouldShowNextSteps && (
                    <View style={[styles.ph5, styles.pb2]}>
                        <MoneyReportHeaderStatusBar nextStep={nextStep} />
                    </View>
                )}
                {shouldShowSettlementButton && isSmallScreenWidth && (
                    <View style={[styles.ph5, styles.pb2]}>
                        <SettlementButton
                            currency={moneyRequestReport.currency}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={moneyRequestReport.chatReportID}
                            iouReport={moneyRequestReport}
                            onPress={(paymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
                            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                            addBankAccountRoute={bankAccountRoute}
                            shouldShowPaymentOptions
                            formattedAmount={formattedAmount}
                        />
                    </View>
                )}
                {shouldShowApproveButton && isSmallScreenWidth && (
                    <View style={[styles.ph5, styles.pb2]}>
                        <Button
                            success
                            medium
                            text={translate('iou.approve')}
                            style={[styles.w100, styles.pr0]}
                            onPress={() => IOU.approveMoneyRequest(moneyRequestReport)}
                        />
                    </View>
                )}
                {shouldShowSubmitButton && isSmallScreenWidth && (
                    <View style={[styles.ph5, styles.pb2]}>
                        <Button
                            medium
                            success={chatReport.isOwnPolicyExpenseChat}
                            text={translate('common.submit')}
                            style={[styles.w100, styles.pr0]}
                            onPress={() => IOU.submitReport(moneyRequestReport)}
                        />
                    </View>
                )}
            </View>
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
        nextStep: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.NEXT_STEP}${report.reportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MoneyReportHeader);
