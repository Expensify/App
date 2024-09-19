import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportMetadata, Transaction} from '@src/types/onyx';

type TransactionReceiptOnyxProps = {
    report: OnyxEntry<Report>;
    transaction: OnyxEntry<Transaction>;
    reportMetadata: OnyxEntry<ReportMetadata>;
};

type TransactionReceiptProps = TransactionReceiptOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT>;

function TransactionReceipt({transaction, report, reportMetadata = {isLoadingInitialReportActions: true}, route}: TransactionReceiptProps) {
    const receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction);

    const imageSource = tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = route.params.readonly ?? false;

    const parentReportAction = ReportActionUtils.getReportAction(report?.parentReportID ?? '-1', report?.parentReportActionID ?? '-1');
    const canEditReceipt = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const isEReceipt = transaction && !TransactionUtils.hasReceiptSource(transaction) && TransactionUtils.hasEReceipt(transaction);
    const isTrackExpenseAction = ReportActionUtils.isTrackExpenseAction(parentReportAction);

    useEffect(() => {
        if (report && transaction) {
            return;
        }
        ReportActions.openReport(route.params.reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const moneyRequestReportID = ReportUtils.isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    const isTrackExpenseReport = ReportUtils.isTrackExpenseReport(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isTrackExpenseReport || transaction?.reportID === CONST.REPORT.SPLIT_REPORTID ? !transaction : (moneyRequestReportID ?? '-1') !== transaction?.reportID;

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile}
            report={report}
            isReceiptAttachment
            canEditReceipt={canEditReceipt && !readonly}
            allowDownload={!isEReceipt}
            isTrackExpenseAction={isTrackExpenseAction}
            originalFileName={receiptURIs?.filename}
            defaultOpen
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID ?? '-1'));
            }}
            isLoading={!transaction && reportMetadata?.isLoadingInitialReportActions}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default withOnyx<TransactionReceiptProps, TransactionReceiptOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? '-1'}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID ?? '-1'}`,
    },
    reportMetadata: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.reportID ?? '-1'}`,
    },
})(TransactionReceipt);
