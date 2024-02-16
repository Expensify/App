import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportActions, Transaction} from '@src/types/onyx';

type ReceiptOnyxPropsWithoutParentReportActions = {
    isLoadingApp: OnyxEntry<boolean>;
    transaction: OnyxEntry<Transaction>;
    report: OnyxEntry<Report>;
};

type ReceiptParentReportActionsOnyxProps = {
    parentReportActions: OnyxEntry<ReportActions>;
};

type ReceiptPropsWithoutParentReportActions = ReceiptOnyxPropsWithoutParentReportActions & StackScreenProps<AuthScreensParamList, typeof SCREENS.RECEIPT>;

type ReceiptProps = ReceiptPropsWithoutParentReportActions & ReceiptParentReportActionsOnyxProps;

function Receipt({isLoadingApp = true, transaction, report, parentReportActions}: ReceiptProps) {
    const receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction);
    const imageSource = tryResolveUrlFromApiRoot(receiptURIs?.image ?? '');
    const parentReportAction = parentReportActions?.[report?.parentReportActionID ?? ''] ?? null;
    const isEReceipt = transaction && TransactionUtils.hasEReceipt(transaction);

    return (
        <AttachmentModal
            defaultOpen
            isReceiptAttachment
            source={imageSource}
            isAuthTokenRequired={!receiptURIs.isLocalFile}
            report={report}
            canEditReceipt={ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT)}
            allowDownload={!isEReceipt}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID ?? ''));
            }}
            originalFileName={receiptURIs?.filename}
            isLoading={!!isLoadingApp && !transaction}
            shouldShowNotFoundPage={!isLoadingApp && (!report || !transaction)}
        />
    );
}

Receipt.displayName = 'Receipt';

export default withOnyx<ReceiptPropsWithoutParentReportActions, ReceiptOnyxPropsWithoutParentReportActions>({
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID}`,
    },
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
})(
    withOnyx<ReceiptProps, ReceiptParentReportActionsOnyxProps>({
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
            canEvict: false,
        },
    })(Receipt),
);
