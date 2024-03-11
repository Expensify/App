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

    const parentReportAction = ReportActionUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');
    const canEditReceipt = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const isEReceipt = transaction && TransactionUtils.hasEReceipt(transaction);

    useEffect(() => {
        if (report && transaction) {
            return;
        }
        ReportActions.openReport(route.params.reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile}
            report={report}
            isReceiptAttachment
            canEditReceipt={canEditReceipt}
            allowDownload={!isEReceipt}
            originalFileName={receiptURIs?.filename}
            defaultOpen
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? ''));
            }}
            isLoading={!transaction && reportMetadata?.isLoadingInitialReportActions}
            shouldShowNotFoundPage={(report?.parentReportID ?? '') !== transaction?.reportID}
        />
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default withOnyx<TransactionReceiptProps, TransactionReceiptOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? '0'}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID ?? '0'}`,
    },
    reportMetadata: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.reportID ?? '0'}`,
    },
})(TransactionReceipt);
