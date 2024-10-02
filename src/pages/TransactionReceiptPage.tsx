import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList, RootStackParamList, State} from '@libs/Navigation/types';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import navigationRef from '@navigation/navigationRef';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type TransactionReceiptProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT>;

function TransactionReceipt({route}: TransactionReceiptProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? '-1'}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID ?? '-1'}`);
    const [reportMetadata = {isLoadingInitialReportActions: true}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.reportID ?? '-1'}`);
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

    const onModalClose = () => {
        // Receipt Page can be opened either from Reports or from Search RHP view
        // We have to handle going back to correct screens, if it was opened from RHP just close the modal, otherwise go to Report Page
        const rootState = navigationRef.getRootState() as State<RootStackParamList>;
        const secondToLastRoute = rootState.routes.at(-2);
        if (secondToLastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            Navigation.dismissModal();
        } else {
            Navigation.dismissModal(report?.reportID ?? '-1');
        }
    };

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
            onModalClose={onModalClose}
            isLoading={!transaction && reportMetadata?.isLoadingInitialReportActions}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default TransactionReceipt;
