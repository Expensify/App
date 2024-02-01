import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

type TransactionReceiptOnyxProps = {
    report: OnyxEntry<Report>;
    transaction: OnyxEntry<Transaction>;
};

type TransactionReceiptProps = TransactionReceiptOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT>;

function TransactionReceipt({transaction, report}: TransactionReceiptProps) {
    const receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction);

    const imageSource = tryResolveUrlFromApiRoot(receiptURIs.image);

    const isLocalFile = receiptURIs.isLocalFile;

    const parentReportAction = ReportActionUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');
    const canEditReceipt = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile}
            report={report}
            isReceiptAttachment
            canEditReceipt={canEditReceipt}
            allowDownload
            originalFileName={transaction?.filename}
            defaultOpen
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? ''));
            }}
        />
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
