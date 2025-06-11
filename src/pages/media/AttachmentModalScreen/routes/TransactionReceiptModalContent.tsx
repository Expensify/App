import React, {useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import {navigateToStartStepIfScanFileCannotBeRead} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isTrackExpenseReport} from '@libs/ReportUtils';
import {getRequestType, hasEReceipt, hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function TransactionReceiptModalContent({navigation, route}: AttachmentModalScreenProps) {
    const {reportID = '', transactionID = '', iouAction, iouType, readonly: readonlyProp, isFromReviewDuplicates: isFromReviewDuplicatesProp} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [transactionMain] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [reportMetadata = {isLoadingInitialReportActions: true}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});

    const isDraftTransaction = !!iouAction;
    const transaction = isDraftTransaction ? transactionDraft : transactionMain;
    const receiptURIs = getThumbnailAndImageURIs(transaction);

    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = !!readonlyProp;
    const isFromReviewDuplicates = !!isFromReviewDuplicatesProp;
    const imageSource = isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canDeleteReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, true);
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseActionValue = isTrackExpenseAction(parentReportAction);

    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);

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
        const receiptFilename = transaction?.filename;
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
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouAction, iouType, transactionID, reportID),
                    ),
                ),
        );

        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiptPath]);

    const moneyRequestReportID = isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    const isTrackExpenseReportValue = isTrackExpenseReport(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReportValue || isDraftTransaction || transaction?.reportID === CONST.REPORT.SPLIT_REPORT_ID || isFromReviewDuplicates
            ? !transaction
            : moneyRequestReportID !== transaction?.reportID;

    const contentProps = useMemo(
        () =>
            ({
                source: imageSource,
                isAuthTokenRequired: !isLocalFile && !isDraftTransaction,
                report,
                isReceiptAttachment: true,
                isDeleteReceiptConfirmModalVisible,
                canEditReceipt: ((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt,
                canDeleteReceipt: canDeleteReceipt && !readonly && !isDraftTransaction && !transaction?.receipt?.isTestDriveReceipt,
                allowDownload: !isEReceipt,
                isTrackExpenseAction: isTrackExpenseActionValue,
                originalFileName: isDraftTransaction ? transaction?.filename : receiptURIs?.filename,
                isLoading: !transaction && reportMetadata?.isLoadingInitialReportActions,
                iouAction,
                iouType,
                draftTransactionID: isDraftTransaction ? transactionID : undefined,
                shouldShowNotFoundPage,
                onRequestDeleteReceipt: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                onDeleteReceipt: () => setIsDeleteReceiptConfirmModalVisible?.(false),
            }) satisfies Partial<AttachmentModalBaseContentProps>,
        [
            canDeleteReceipt,
            canEditReceipt,
            imageSource,
            iouAction,
            iouType,
            isDeleteReceiptConfirmModalVisible,
            isDraftTransaction,
            isEReceipt,
            isLocalFile,
            isTrackExpenseActionValue,
            readonly,
            receiptURIs?.filename,
            report,
            reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            transaction,
            transactionID,
        ],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}
TransactionReceiptModalContent.displayName = 'TransactionReceiptModalContent';

export default TransactionReceiptModalContent;
