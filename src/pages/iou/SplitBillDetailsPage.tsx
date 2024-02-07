import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import MoneyRequestHeaderStatusBar from '@components/MoneyRequestHeaderStatusBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import withReportAndReportActionOrNotFound from '@pages/home/report/withReportAndReportActionOrNotFound';
import type {WithReportAndReportActionOrNotFound} from '@pages/home/report/withReportAndReportActionOrNotFound';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, Report, Session, Transaction} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import type {ReportActionBase, ReportActions} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitBillDetailsPageOnyxProps = {
    /** The personal details of the person who is logged in */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** The active report */
    report: OnyxEntry<Report>;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<ReportActions>;

    /** The current transaction */
    transaction: OnyxEntry<Transaction>;

    /** The draft transaction that holds data to be persisited on the current transaction */
    draftTransaction: OnyxEntry<Transaction>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type SplitBillDetailsPageProps = WithReportAndReportActionOrNotFound & SplitBillDetailsPageOnyxProps & StackScreenProps<SplitDetailsNavigatorParamList, typeof SCREENS.SPLIT_DETAILS.ROOT>;

function SplitBillDetailsPage({personalDetails, report, route, reportActions, transaction, draftTransaction, session}: SplitBillDetailsPageProps) {
    const styles = useThemeStyles();
    const {reportID} = report ?? {reportID: ''};
    const {translate} = useLocalize();
    const reportAction = reportActions?.[route.params.reportActionID] as ReportActionBase & OriginalMessageIOU;
    const participantAccountIDs = reportAction?.originalMessage.participantAccountIDs ?? [];

    // In case this is workspace split bill, we manually add the workspace as the second participant of the split bill
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants;
    if (ReportUtils.isPolicyExpenseChat(report)) {
        participants = [
            OptionsListUtils.getParticipantsOption({accountID: participantAccountIDs[0], selected: true, reportID: ''}, personalDetails),
            OptionsListUtils.getPolicyExpenseReportOption({...report, selected: true}),
        ];
    } else {
        participants = participantAccountIDs.map((accountID) => OptionsListUtils.getParticipantsOption({accountID, selected: true, reportID: ''}, personalDetails));
    }
    const payeePersonalDetails = personalDetails?.[reportAction?.actorAccountID ?? 0];
    const participantsExcludingPayee = participants.filter((participant) => participant.accountID !== reportAction?.actorAccountID);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    const hasSmartScanFailed = TransactionUtils.hasReceipt(transaction) && transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCANFAILED;
    const isEditingSplitBill = session?.accountID === reportAction?.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction ?? undefined);

    const {
        amount: splitAmount,
        currency: splitCurrency,
        comment: splitComment,
        merchant: splitMerchant,
        created: splitCreated,
        category: splitCategory,
        tag: splitTag,
        billable: splitBillable,
    } = ReportUtils.getTransactionDetails((isEditingSplitBill && draftTransaction) || transaction) ?? {};

    const onConfirm = useCallback(
        () => IOU.completeSplitBill(reportID, reportAction, draftTransaction ?? undefined, session?.accountID ?? 0, session?.email ?? ''),
        [reportID, reportAction, draftTransaction, session?.accountID, session?.email],
    );

    return (
        <ScreenWrapper testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={isEmptyObject(reportID) || isEmptyObject(reportAction) || isEmptyObject(transaction)}>
                <HeaderWithBackButton title={translate('common.details')} />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {isScanning && (
                        <MoneyRequestHeaderStatusBar
                            title={translate('iou.receiptStatusTitle')}
                            description={translate('iou.receiptStatusText')}
                            shouldShowBorderBottom
                        />
                    )}
                    {Boolean(participants.length) && (
                        <MoneyRequestConfirmationList
                            hasMultipleParticipants
                            payeePersonalDetails={payeePersonalDetails}
                            selectedParticipants={participantsExcludingPayee}
                            iouAmount={splitAmount}
                            iouCurrencyCode={splitCurrency}
                            iouComment={splitComment}
                            iouCreated={splitCreated}
                            iouMerchant={splitMerchant}
                            iouCategory={splitCategory}
                            iouTag={splitTag}
                            iouIsBillable={splitBillable}
                            iouType={CONST.IOU.TYPE.SPLIT}
                            isReadOnly={!isEditingSplitBill}
                            shouldShowSmartScanFields
                            receiptPath={transaction?.receipt?.source}
                            receiptFilename={transaction?.filename}
                            shouldShowFooter={false}
                            isEditingSplitBill={isEditingSplitBill}
                            hasSmartScanFailed={hasSmartScanFailed}
                            reportID={reportID}
                            reportActionID={reportAction?.reportActionID}
                            transaction={isEditingSplitBill ? draftTransaction || transaction : transaction}
                            onConfirm={onConfirm}
                            isPolicyExpenseChat={ReportUtils.isPolicyExpenseChat(report)}
                            policyID={ReportUtils.isPolicyExpenseChat(report) ? report?.policyID : null}
                        />
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

const WrappedComponent = withOnyx<SplitBillDetailsPageProps, Pick<SplitBillDetailsPageOnyxProps, 'transaction' | 'draftTransaction'>>({
    transaction: {
        key: ({route, reportActions}) => {
            const reportAction = reportActions?.[route.params.reportActionID] as (ReportActionBase & OriginalMessageIOU) | undefined;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${reportAction?.originalMessage.IOUTransactionID ?? 0}`;
        },
    },
    draftTransaction: {
        key: ({route, reportActions}) => {
            const reportAction = reportActions?.[route.params.reportActionID] as (ReportActionBase & OriginalMessageIOU) | undefined;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${reportAction?.originalMessage.IOUTransactionID ?? 0}`;
        },
    },
})(withReportAndReportActionOrNotFound(SplitBillDetailsPage));

export default withOnyx<Omit<SplitBillDetailsPageProps, 'transaction' | 'draftTransaction'>, Omit<SplitBillDetailsPageOnyxProps, 'transaction' | 'draftTransaction'>>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    reportActions: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
        canEvict: false,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WrappedComponent);
