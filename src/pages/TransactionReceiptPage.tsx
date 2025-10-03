import React, {useEffect} from 'react';
import AttachmentModal from '@components/AttachmentModal';
import useOnyx from '@hooks/useOnyx';
import {navigateToStartStepIfScanFileCannotBeRead} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import getReceiptFilenameFromTransaction from '@libs/getReceiptFilenameFromTransaction';
import {getReceiptFileName} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction as isTrackExpenseReportReportActionsUtils} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isTrackExpenseReport as isTrackExpenseReportReportUtils} from '@libs/ReportUtils';
import {getRequestType, hasEReceipt, hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TransactionReceiptProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT | typeof SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW>;

function TransactionReceipt({route}: TransactionReceiptProps) {
    const reportID = route.params.reportID;
    const transactionID = route.params.transactionID;
    const action = 'action' in route.params ? route.params.action : undefined;
    const iouType = 'iouType' in route.params ? route.params.iouType : undefined;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [transactionMain] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [reportMetadata = CONST.DEFAULT_REPORT_METADATA] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});

    const mergeTransactionID = 'mergeTransactionID' in route.params ? route.params.mergeTransactionID : undefined;
    const isFromReviewDuplicates = 'isFromReviewDuplicates' in route.params ? route.params.isFromReviewDuplicates === 'true' : undefined;
    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, {canBeMissing: true});

    const isDraftTransaction = !!action;

    // Determine which transaction to use based on the scenario
    let transaction;
    if (isDraftTransaction) {
        transaction = transactionDraft;
    } else if (mergeTransactionID && mergeTransaction && transactionMain) {
        // If we have a merge transaction, we need to use the receipt from the merge transaction
        transaction = {
            ...transactionMain,
            receipt: mergeTransaction.receipt,
            filename: getReceiptFileName(mergeTransaction.receipt),
        };
    } else {
        transaction = transactionMain;
    }
    const receiptURIs = getThumbnailAndImageURIs(transaction);
    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = route.params.readonly === 'true';
    const imageSource = isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canDeleteReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, true);
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseAction = isTrackExpenseReportReportActionsUtils(parentReportAction);

    useEffect(() => {
        if ((!!report && !!transaction) || isDraftTransaction) {
            return;
        }
        openReport(reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const receiptPath = transaction?.receipt?.source;

    useEffect(() => {
        if (!isDraftTransaction || !iouType || !transaction) {
            return;
        }

        const requestType = getRequestType(transaction);
        const receiptFilename = getReceiptFilenameFromTransaction(transaction);
        const receiptType = transaction?.receipt?.type;
        navigateToStartStepIfScanFileCannotBeRead(
            receiptFilename,
            receiptPath,
            () => {},
            requestType,
            iouType,
            transactionID,
            reportID,
            receiptType,
            () =>
                Navigation.goBack(
                    ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        iouType,
                        transactionID,
                        reportID,
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID),
                    ),
                ),
        );

        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiptPath]);

    const moneyRequestReportID = isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    const isTrackExpenseReport = isTrackExpenseReportReportUtils(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReport || isDraftTransaction || transaction?.reportID === CONST.REPORT.SPLIT_REPORT_ID || isFromReviewDuplicates
            ? !transaction
            : moneyRequestReportID !== transaction?.reportID;

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile && !isDraftTransaction}
            report={report}
            isReceiptAttachment
            canEditReceipt={((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt}
            canDeleteReceipt={canDeleteReceipt && !readonly && !isDraftTransaction && !transaction?.receipt?.isTestDriveReceipt}
            allowDownload={!isEReceipt}
            isTrackExpenseAction={isTrackExpenseAction}
            originalFileName={isDraftTransaction ? getReceiptFilenameFromTransaction(transaction) : receiptURIs?.filename}
            defaultOpen
            iouAction={action}
            iouType={iouType}
            draftTransactionID={isDraftTransaction ? transactionID : undefined}
            onModalClose={Navigation.dismissModal}
            isLoading={!transaction && reportMetadata?.isLoadingInitialReportActions}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default TransactionReceipt;
