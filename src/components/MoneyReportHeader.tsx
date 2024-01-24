import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import GoogleMeetIcon from '@assets/images/google-meet.svg';
import ZoomIcon from '@assets/images/zoom-icon.svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import Button from './Button';
import HeaderWithBackButton from './HeaderWithBackButton';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import SettlementButton from './SettlementButton';

type PaymentType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;

type MoneyReportHeaderOnyxProps = {
    /** The chat report this report is linked to */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** The next step for the report */
    nextStep: OnyxEntry<OnyxTypes.ReportNextStep>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};

type MoneyReportHeaderProps = MoneyReportHeaderOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The policy tied to the money request report */
    policy: OnyxTypes.Policy;

    /** Personal details so we can get the ones for the report participants */
    personalDetails: OnyxTypes.PersonalDetailsList;
};

function MoneyReportHeader({session, personalDetails, policy, chatReport, nextStep, report: moneyRequestReport}: MoneyReportHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const {reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(moneyRequestReport);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policyType = policy?.type;
    const isPolicyAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isAutoReimbursable = ReportUtils.canBeAutoReimbursed(moneyRequestReport, policy);
    const isPaidGroupPolicy = ReportUtils.isPaidGroupPolicy(moneyRequestReport);
    const isManager = ReportUtils.isMoneyRequestReport(moneyRequestReport) && session?.accountID === moneyRequestReport.managerID;
    const isPayer = isPaidGroupPolicy
        ? // In a group policy, the admin approver can pay the report directly by skipping the approval step
          isPolicyAdmin && (isApproved || isManager)
        : isPolicyAdmin || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && isManager);
    const isDraft = ReportUtils.isDraftExpenseReport(moneyRequestReport);
    const shouldShowPayButton = useMemo(
        () => isPayer && !isDraft && !isSettled && !moneyRequestReport.isWaitingOnBankAccount && reimbursableSpend !== 0 && !ReportUtils.isArchivedRoom(chatReport) && !isAutoReimbursable,
        [isPayer, isDraft, isSettled, moneyRequestReport, reimbursableSpend, chatReport, isAutoReimbursable],
    );
    const shouldShowApproveButton = useMemo(() => {
        if (!isPaidGroupPolicy) {
            return false;
        }
        return isManager && !isDraft && !isApproved && !isSettled;
    }, [isPaidGroupPolicy, isManager, isDraft, isApproved, isSettled]);
    const shouldShowSettlementButton = shouldShowPayButton || shouldShowApproveButton;
    const shouldShowSubmitButton = isDraft && reimbursableSpend !== 0;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const shouldShowNextStep = isFromPaidPolicy && !!nextStep?.message?.length;
    const shouldShowAnyButton = shouldShowSettlementButton || shouldShowApproveButton || shouldShowSubmitButton || shouldShowNextStep;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, moneyRequestReport.currency);
    const isMoreContentShown = shouldShowNextStep || (shouldShowAnyButton && isSmallScreenWidth);

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy.isHarvestingEnabled,
        [chatReport?.isOwnPolicyExpenseChat, policy.isHarvestingEnabled],
    );

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
                            // @ts-expect-error TODO: Remove this once SettlementButton (https://github.com/Expensify/App/issues/25100) is migrated to TypeScript.
                            currency={moneyRequestReport.currency}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={chatReport?.reportID}
                            iouReport={moneyRequestReport}
                            // @ts-expect-error TODO: Remove this once IOU (https://github.com/Expensify/App/issues/24926) is migrated to TypeScript.
                            onPress={(paymentType: PaymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
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
                            success={isWaitingForSubmissionFromCurrentUser}
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
                            // @ts-expect-error TODO: Remove this once SettlementButton (https://github.com/Expensify/App/issues/25100) is migrated to TypeScript.
                            currency={moneyRequestReport.currency}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={moneyRequestReport.chatReportID}
                            iouReport={moneyRequestReport}
                            // @ts-expect-error TODO: Remove this once IOU (https://github.com/Expensify/App/issues/24926) is migrated to TypeScript.
                            onPress={(paymentType: PaymentType) => IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport)}
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
                            success={isWaitingForSubmissionFromCurrentUser}
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

export default withOnyx<MoneyReportHeaderProps, MoneyReportHeaderOnyxProps>({
    chatReport: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`,
    },
    nextStep: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.NEXT_STEP}${report.reportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(MoneyReportHeader);
