import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import GoogleMeetIcon from '@assets/images/google-meet.svg';
import ZoomIcon from '@assets/images/zoom-icon.svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import nextStepPropTypes from '@pages/nextStepPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import HeaderWithBackButton from './HeaderWithBackButton';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import participantPropTypes from './participantPropTypes';
import SettlementButton from './SettlementButton';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const reimbursableTotal = ReportUtils.getMoneyRequestReimbursableTotal(moneyRequestReport);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policyType = lodashGet(policy, 'type');
    const isPolicyAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && lodashGet(policy, 'role') === CONST.POLICY.ROLE.ADMIN;
    const isGroupPolicy = _.contains([CONST.POLICY.TYPE.CORPORATE, CONST.POLICY.TYPE.TEAM], policyType);
    const isManager = ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === moneyRequestReport.managerID;
    const isPayer = isGroupPolicy
        ? // In a group policy, the admin approver can pay the report directly by skipping the approval step
          isPolicyAdmin && (isApproved || isManager)
        : isPolicyAdmin || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && isManager);
    const isDraft = ReportUtils.isDraftExpenseReport(moneyRequestReport);
    const shouldShowPayButton = useMemo(
        () => isPayer && !isDraft && !isSettled && !moneyRequestReport.isWaitingOnBankAccount && reimbursableTotal !== 0 && !ReportUtils.isArchivedRoom(chatReport),
        [isPayer, isDraft, isSettled, moneyRequestReport, reimbursableTotal, chatReport],
    );
    const shouldShowApproveButton = useMemo(() => {
        if (!isGroupPolicy) {
            return false;
        }
        return isManager && !isDraft && !isApproved && !isSettled;
    }, [isGroupPolicy, isManager, isDraft, isApproved, isSettled]);
    const shouldShowSettlementButton = shouldShowPayButton || shouldShowApproveButton;
    const shouldShowSubmitButton = isDraft && reimbursableTotal !== 0;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const shouldShowNextStep = isFromPaidPolicy && nextStep && !_.isEmpty(nextStep.message);
    const shouldShowAnyButton = shouldShowSettlementButton || shouldShowApproveButton || shouldShowSubmitButton || shouldShowNextStep;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reimbursableTotal, moneyRequestReport.currency);
    const isMoreContentShown = shouldShowNextStep || (shouldShowAnyButton && isSmallScreenWidth);

    const threeDotsMenuItems = [HeaderUtils.getPinMenuItem(moneyRequestReport)];
    if (!ReportUtils.isArchivedRoom(chatReport)) {
        threeDotsMenuItems.push({
            icon: ZoomIcon,
            text: translate('videoChatButtonAndMenu.zoom'),
            onSelected: Session.checkIfActionIsAllowed(() => {
                Link.openExternalLink(CONST.NEW_ZOOM_MEETING_URL);
            }),
        });
        threeDotsMenuItems.push({
            icon: GoogleMeetIcon,
            text: translate('videoChatButtonAndMenu.googleMeet'),
            onSelected: Session.checkIfActionIsAllowed(() => {
                Link.openExternalLink(CONST.NEW_GOOGLE_MEET_MEETING_URL);
            }),
        });
    }

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
                shouldShowBorderBottom={!(shouldShowAnyButton && isSmallScreenWidth) && !(shouldShowNextStep && !isSmallScreenWidth)}
                shouldShowThreeDotsButton
                threeDotsMenuItems={threeDotsMenuItems}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
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
                            shouldHidePaymentOptions={!shouldShowPayButton}
                            shouldShowApproveButton={shouldShowApproveButton}
                            style={[styles.pv2]}
                            formattedAmount={formattedAmount}
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
                            shouldHidePaymentOptions={!shouldShowPayButton}
                            shouldShowApproveButton={shouldShowApproveButton}
                            formattedAmount={formattedAmount}
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
                {shouldShowNextStep && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <MoneyReportHeaderStatusBar nextStep={nextStep} />
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
