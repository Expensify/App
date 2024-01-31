import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

type TransactionReceiptOnyxProps = {
    report: OnyxEntry<Report>;
    transaction: OnyxEntry<Transaction>;
};

type TransactionReceiptProps = TransactionReceiptOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT>;

function TransactionReceipt({transaction = {} as Transaction, report = {} as Report}: TransactionReceiptProps) {
    const receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction as Transaction);

    const imageSource = tryResolveUrlFromApiRoot(receiptURIs.image);

    const isLocalFile = receiptURIs.isLocalFile;

    // const canEditReceipt = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile}
            report={report}
            isReceiptAttachment
            canEditReceipt={true}
            allowDownload
            originalFileName={transaction?.filename}
            defaultOpen
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? ''));
            }}
        ></AttachmentModal>
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default withOnyx<TransactionReceiptProps, TransactionReceiptOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? ''}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID ?? ''}`,
    },
})(TransactionReceipt);
