import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import SettlementButton from './SettlementButton';

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
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function MoneyReportHeader({session, policy, chatReport, nextStep, report: moneyRequestReport}: MoneyReportHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const {reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<'pay' | 'approve'>();
    const canAllowSettlement = ReportUtils.hasUpdatedTotal(moneyRequestReport);
    const policyType = policy?.type;
    const isPayer = ReportUtils.isPayer(session, moneyRequestReport);
    const isDraft = ReportUtils.isOpenExpenseReport(moneyRequestReport);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const cancelPayment = useCallback(() => {
        if (!chatReport) {
            return;
        }
        IOU.cancelPayment(moneyRequestReport, chatReport);
        setIsConfirmModalVisible(false);
    }, [moneyRequestReport, chatReport]);

    const shouldShowPayButton = useMemo(() => IOU.canIOUBePaid(moneyRequestReport, chatReport, policy), [moneyRequestReport, chatReport, policy]);

    const shouldShowApproveButton = useMemo(() => IOU.canApproveIOU(moneyRequestReport, chatReport, policy), [moneyRequestReport, chatReport, policy]);

    const shouldDisableApproveButton = shouldShowApproveButton && !ReportUtils.isAllowedToApproveExpenseReport(moneyRequestReport);

    const shouldShowSettlementButton = shouldShowPayButton || shouldShowApproveButton;

    const shouldShowSubmitButton = isDraft && reimbursableSpend !== 0;
    const shouldDisableSubmitButton = shouldShowSubmitButton && !ReportUtils.isAllowedToSubmitDraftExpenseReport(moneyRequestReport);
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const shouldShowNextStep = !ReportUtils.isClosedExpenseReportWithNoExpenses(moneyRequestReport) && isFromPaidPolicy && !!nextStep?.message?.length;
    const shouldShowAnyButton = shouldShowSettlementButton || shouldShowApproveButton || shouldShowSubmitButton || shouldShowNextStep;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, moneyRequestReport.currency);
    const [nonHeldAmount, fullAmount] = ReportUtils.getNonHeldAndFullAmount(moneyRequestReport);
    const displayedAmount = ReportUtils.hasHeldExpenses(moneyRequestReport.reportID) && canAllowSettlement ? nonHeldAmount : formattedAmount;
    const isMoreContentShown = shouldShowNextStep || (shouldShowAnyButton && isSmallScreenWidth);

    const confirmPayment = (type?: PaymentMethodType | undefined) => {
        if (!type) {
            return;
        }
        setPaymentType(type);
        setRequestType('pay');
        if (ReportUtils.hasHeldExpenses(moneyRequestReport.reportID)) {
            setIsHoldMenuVisible(true);
        } else if (chatReport) {
            IOU.payMoneyRequest(type, chatReport, moneyRequestReport, false);
        }
    };

    const confirmApproval = () => {
        setRequestType('approve');
        if (ReportUtils.hasHeldExpenses(moneyRequestReport.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            IOU.approveMoneyRequest(moneyRequestReport, true);
        }
    };

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    const threeDotsMenuItems = [HeaderUtils.getPinMenuItem(moneyRequestReport)];
    if (isPayer && isSettled && ReportUtils.isExpenseReport(moneyRequestReport)) {
        threeDotsMenuItems.push({
            icon: Expensicons.Trashcan,
            text: translate('iou.cancelPayment'),
            onSelected: () => setIsConfirmModalVisible(true),
        });
    }

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldEnableDetailPageNavigation
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack(undefined, false, true)}
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
                            confirmApproval={confirmApproval}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={chatReport?.reportID}
                            iouReport={moneyRequestReport}
                            onPress={confirmPayment}
                            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                            addBankAccountRoute={bankAccountRoute}
                            shouldHidePaymentOptions={!shouldShowPayButton}
                            shouldShowApproveButton={shouldShowApproveButton}
                            shouldDisableApproveButton={shouldDisableApproveButton}
                            style={[styles.pv2]}
                            formattedAmount={!ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID) ? displayedAmount : ''}
                            isDisabled={!canAllowSettlement}
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
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            <View style={isMoreContentShown ? [styles.dFlex, styles.flexColumn, styles.borderBottom] : []}>
                {shouldShowSettlementButton && isSmallScreenWidth && (
                    <View style={[styles.ph5, styles.pb2]}>
                        <SettlementButton
                            currency={moneyRequestReport.currency}
                            confirmApproval={confirmApproval}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={moneyRequestReport.chatReportID}
                            iouReport={moneyRequestReport}
                            onPress={confirmPayment}
                            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                            addBankAccountRoute={bankAccountRoute}
                            shouldHidePaymentOptions={!shouldShowPayButton}
                            shouldShowApproveButton={shouldShowApproveButton}
                            formattedAmount={!ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID) ? displayedAmount : ''}
                            shouldDisableApproveButton={shouldDisableApproveButton}
                            isDisabled={!canAllowSettlement}
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
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                )}
                {shouldShowNextStep && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <MoneyReportHeaderStatusBar nextStep={nextStep} />
                    </View>
                )}
            </View>
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID) ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                />
            )}
            <ConfirmModal
                title={translate('iou.cancelPayment')}
                isVisible={isConfirmModalVisible}
                onConfirm={cancelPayment}
                onCancel={() => setIsConfirmModalVisible(false)}
                prompt={translate('iou.cancelPaymentConfirmation')}
                confirmText={translate('iou.cancelPayment')}
                cancelText={translate('common.dismiss')}
                danger
            />
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
