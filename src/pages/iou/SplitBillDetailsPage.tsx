import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import MoneyRequestHeaderStatusBar from '@components/MoneyRequestHeaderStatusBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import withReportAndReportActionOrNotFound from '@pages/home/report/withReportAndReportActionOrNotFound';
import type {WithReportAndReportActionOrNotFoundProps} from '@pages/home/report/withReportAndReportActionOrNotFound';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitBillDetailsPageProps = WithReportAndReportActionOrNotFoundProps & StackScreenProps<SplitDetailsNavigatorParamList, typeof SCREENS.SPLIT_DETAILS.ROOT>;

function SplitBillDetailsPage({route, report, reportAction}: SplitBillDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    const reportID = report?.reportID ?? '-1';
    const originalMessage = reportAction && ReportActionsUtils.isMoneyRequestAction(reportAction) ? ReportActionsUtils.getOriginalMessage(reportAction) : undefined;
    const IOUTransactionID = originalMessage?.IOUTransactionID ? originalMessage.IOUTransactionID : '-1';
    const participantAccountIDs = originalMessage?.participantAccountIDs ?? [];

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${IOUTransactionID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // In case this is workspace split expense, we manually add the workspace as the second participant of the split expense
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants: Array<Participant | ReportUtils.OptionData>;
    if (ReportUtils.isPolicyExpenseChat(report)) {
        participants = [
            OptionsListUtils.getParticipantsOption({accountID: participantAccountIDs.at(0), selected: true, reportID: ''}, personalDetails),
            OptionsListUtils.getPolicyExpenseReportOption({...report, selected: true, reportID}),
        ];
    } else {
        participants = participantAccountIDs.map((accountID) => OptionsListUtils.getParticipantsOption({accountID, selected: true, reportID: ''}, personalDetails));
    }
    const payeePersonalDetails = personalDetails?.[reportAction?.actorAccountID ?? -1];
    const participantsExcludingPayee = participants.filter((participant) => participant.accountID !== reportAction?.actorAccountID);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    const hasSmartScanFailed = TransactionUtils.hasReceipt(transaction) && transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCANFAILED;
    const isEditingSplitBill = session?.accountID === reportAction?.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const {
        amount: splitAmount,
        currency: splitCurrency,
        comment: splitComment,
        merchant: splitMerchant,
        created: splitCreated,
        category: splitCategory,
        billable: splitBillable,
    } = ReportUtils.getTransactionDetails(isEditingSplitBill && draftTransaction ? draftTransaction : transaction) ?? {};

    const onConfirm = useCallback(() => {
        setIsConfirmed(true);
        IOU.completeSplitBill(reportID, reportAction, draftTransaction, session?.accountID ?? -1, session?.email ?? '');
    }, [reportID, reportAction, draftTransaction, session?.accountID, session?.email]);

    return (
        <ScreenWrapper testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(reportAction) || isEmptyObject(transaction)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {isScanning && (
                        <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                            <MoneyRequestHeaderStatusBar
                                icon={
                                    <Icon
                                        src={Expensicons.ReceiptScan}
                                        height={variables.iconSizeSmall}
                                        width={variables.iconSizeSmall}
                                        fill={theme.icon}
                                    />
                                }
                                description={translate('iou.receiptScanInProgressDescription')}
                                shouldStyleFlexGrow={false}
                            />
                        </View>
                    )}
                    {!!participants.length && (
                        <MoneyRequestConfirmationList
                            payeePersonalDetails={payeePersonalDetails}
                            selectedParticipants={participantsExcludingPayee}
                            iouAmount={splitAmount ?? 0}
                            iouCurrencyCode={splitCurrency}
                            iouComment={splitComment}
                            iouCreated={splitCreated}
                            shouldDisplayReceipt
                            iouMerchant={splitMerchant}
                            iouCategory={splitCategory}
                            iouIsBillable={splitBillable}
                            iouType={CONST.IOU.TYPE.SPLIT}
                            isReadOnly={!isEditingSplitBill}
                            shouldShowSmartScanFields
                            receiptPath={transaction?.receipt?.source}
                            receiptFilename={transaction?.filename}
                            isEditingSplitBill={isEditingSplitBill}
                            hasSmartScanFailed={hasSmartScanFailed}
                            reportID={reportID}
                            reportActionID={reportAction?.reportActionID}
                            transaction={isEditingSplitBill && draftTransaction ? draftTransaction : transaction}
                            onConfirm={onConfirm}
                            isPolicyExpenseChat={ReportUtils.isPolicyExpenseChat(report)}
                            policyID={ReportUtils.isPolicyExpenseChat(report) ? report?.policyID : undefined}
                            action={isEditingSplitBill ? CONST.IOU.ACTION.EDIT : CONST.IOU.ACTION.CREATE}
                            onToggleBillable={(billable) => {
                                IOU.setDraftSplitTransaction(transaction?.transactionID ?? '-1', {billable});
                            }}
                            isConfirmed={isConfirmed}
                        />
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

export default withReportAndReportActionOrNotFound(SplitBillDetailsPage);
