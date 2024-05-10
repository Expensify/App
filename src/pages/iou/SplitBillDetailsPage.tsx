import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
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
import type {WithReportAndReportActionOrNotFoundProps} from '@pages/home/report/withReportAndReportActionOrNotFound';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitBillDetailsPageTransactionOnyxProps = {
    /** The current transaction */
    transaction: OnyxEntry<Transaction>;

    /** The draft transaction that holds data to be persisited on the current transaction */
    draftTransaction: OnyxEntry<Transaction>;
};

type SplitBillDetailsPageOnyxPropsWithoutTransaction = {
    /** The personal details of the person who is logged in */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** The active report */
    report: OnyxEntry<Report>;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<ReportActions>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type SplitBillDetailsPageOnyxProps = SplitBillDetailsPageTransactionOnyxProps & SplitBillDetailsPageOnyxPropsWithoutTransaction;

type SplitBillDetailsPageProps = WithReportAndReportActionOrNotFoundProps &
    SplitBillDetailsPageOnyxProps &
    StackScreenProps<SplitDetailsNavigatorParamList, typeof SCREENS.SPLIT_DETAILS.ROOT>;

function SplitBillDetailsPage({personalDetails, report, route, reportActions, transaction, draftTransaction, session}: SplitBillDetailsPageProps) {
    const styles = useThemeStyles();
    const reportID = report?.reportID ?? '';
    const {translate} = useLocalize();
    const reportAction = useMemo(() => reportActions?.[route.params.reportActionID] ?? ({} as ReportAction), [reportActions, route.params.reportActionID]);
    const participantAccountIDs = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? reportAction?.originalMessage.participantAccountIDs ?? [] : [];

    // In case this is workspace split expense, we manually add the workspace as the second participant of the split expense
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants: Array<Participant | ReportUtils.OptionData>;
    if (ReportUtils.isPolicyExpenseChat(report)) {
        participants = [
            OptionsListUtils.getParticipantsOption({accountID: participantAccountIDs[0], selected: true, reportID: ''}, personalDetails),
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

    const {
        amount: splitAmount,
        currency: splitCurrency,
        comment: splitComment,
        merchant: splitMerchant,
        created: splitCreated,
        category: splitCategory,
        billable: splitBillable,
    } = ReportUtils.getTransactionDetails(isEditingSplitBill && draftTransaction ? draftTransaction : transaction) ?? {};

    const onConfirm = useCallback(
        () => IOU.completeSplitBill(reportID, reportAction, draftTransaction, session?.accountID ?? 0, session?.email ?? ''),
        [reportID, reportAction, draftTransaction, session?.accountID, session?.email],
    );

    return (
        <ScreenWrapper testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(reportAction) || isEmptyObject(transaction)}>
                <HeaderWithBackButton title={translate('common.details')} />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {isScanning && (
                        <MoneyRequestHeaderStatusBar
                            title={translate('iou.receiptStatusTitle')}
                            description={translate('iou.receiptStatusText')}
                            shouldShowBorderBottom
                        />
                    )}
                    {!!participants.length && (
                        <MoneyRequestConfirmationList
                            payeePersonalDetails={payeePersonalDetails}
                            selectedParticipants={participantsExcludingPayee}
                            iouAmount={splitAmount ?? 0}
                            iouCurrencyCode={splitCurrency}
                            iouComment={splitComment}
                            iouCreated={splitCreated}
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
                        />
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

const WrappedComponent = withOnyx<SplitBillDetailsPageProps, SplitBillDetailsPageTransactionOnyxProps>({
    transaction: {
        key: ({route, reportActions}) => {
            const reportAction = reportActions?.[route.params.reportActionID];
            const IOUTransactionID =
                reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction?.originalMessage?.IOUTransactionID ? reportAction.originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`;
        },
    },
    draftTransaction: {
        key: ({route, reportActions}) => {
            const reportAction = reportActions?.[route.params.reportActionID];
            const IOUTransactionID =
                reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction?.originalMessage?.IOUTransactionID ? reportAction.originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${IOUTransactionID}`;
        },
    },
})(withReportAndReportActionOrNotFound(SplitBillDetailsPage));

export default withOnyx<Omit<SplitBillDetailsPageProps, keyof SplitBillDetailsPageTransactionOnyxProps>, SplitBillDetailsPageOnyxPropsWithoutTransaction>({
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
