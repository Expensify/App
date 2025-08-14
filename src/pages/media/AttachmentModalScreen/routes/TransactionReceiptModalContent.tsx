import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {detachReceipt, navigateToStartStepIfScanFileCannotBeRead} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isTrackExpenseReport} from '@libs/ReportUtils';
import {getRequestType, hasEReceipt, hasMissingSmartscanFields, hasReceipt, hasReceiptSource, isReceiptBeingScanned} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps, ThreeDotsMenuItemGenerator} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';

type TransactionReceiptScreenParams = Omit<AttachmentModalScreenParams, 'reportID'> & {
    reportID: string;
    transactionID: string;
    readonly?: string;
    isFromReviewDuplicates?: string;
    action?: IOUAction;
    iouType?: IOUType;
    mergeTransactionID?: string;
};

function TransactionReceiptModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.TRANSACTION_RECEIPT>) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const {reportID = '', transactionID = '', action, iouType: iouTypeParam, readonly: readonlyParam, isFromReviewDuplicates: isFromReviewDuplicatesProp} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [transactionMain] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [reportMetadata = CONST.DEFAULT_REPORT_METADATA] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});

    // If we have a merge transaction, we need to use the receipt from the merge transaction
    const mergeTransactionID = route.params.mergeTransactionID;
    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, {canBeMissing: true});
    if (mergeTransactionID && mergeTransaction && transactionMain) {
        transactionMain.receipt = mergeTransaction.receipt;
    }

    const isDraftTransaction = !!action;
    const transaction = isDraftTransaction ? transactionDraft : transactionMain;
    const draftTransactionID = isDraftTransaction ? transactionID : undefined;
    const receiptURIs = getThumbnailAndImageURIs(transaction);

    const isLocalFile = receiptURIs.isLocalFile;
    const isAuthTokenRequired = !isLocalFile && !isDraftTransaction;
    const readonly = readonlyParam === 'true';
    const isFromReviewDuplicates = !!isFromReviewDuplicatesProp;
    const source = isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

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
        if (!isDraftTransaction || !iouTypeParam || !transaction) {
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
            iouTypeParam,
            transactionID,
            reportID,
            receiptType,
            () =>
                Navigation.goBack(
                    ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        iouTypeParam,
                        transactionID,
                        reportID,
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouTypeParam, transactionID, reportID),
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

    /**
     * Detach the receipt and close the modal.
     */
    const deleteReceiptAndClose = useCallback(() => {
        detachReceipt(transaction?.transactionID);
        navigation.goBack();
    }, [navigation, transaction?.transactionID]);

    const ExtraModals = useMemo(
        () => (
            <ConfirmModal
                title={translate('receipt.deleteReceipt')}
                isVisible={isDeleteReceiptConfirmModalVisible}
                onConfirm={() => deleteReceiptAndClose()}
                onCancel={() => setIsDeleteReceiptConfirmModalVisible?.(false)}
                prompt={translate('receipt.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        ),
        [deleteReceiptAndClose, isDeleteReceiptConfirmModalVisible, translate],
    );

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
        draftTransactionID,
    });

    const allowDownload = !isEReceipt;

    const threeDotsMenuItems = useMemo(() => {
        const menuItems = [];
        const canEdit = ((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt;

        if (canEdit) {
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replace'),
                onSelected: () => {
                    Navigation.dismissModal();
                    InteractionManager.runAfterInteractions(() => {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                action ?? CONST.IOU.ACTION.EDIT,
                                iouTypeParam ?? (isTrackExpenseActionValue ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT),
                                draftTransactionID ?? transaction?.transactionID,
                                report?.reportID,
                                Navigation.getActiveRoute(),
                            ),
                        );
                    });
                },
            });
        }

        menuItems.push((({source: sourceState, file, isLocalSource}) => {
            if (!((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID)) {
                return;
            }

            return {
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => onDownloadAttachment({source: sourceState, file}),
            };
        }) satisfies ThreeDotsMenuItemGenerator);

        const hasOnlyEReceipt = hasEReceipt(transaction) && !hasReceiptSource(transaction);
        const canDelete = canDeleteReceipt && !readonly && !isDraftTransaction && !transaction?.receipt?.isTestDriveReceipt;

        if (!hasOnlyEReceipt && hasReceipt(transaction) && !isReceiptBeingScanned(transaction) && canDelete && !hasMissingSmartscanFields(transaction)) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('receipt.deleteReceipt'),
                onSelected: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                shouldCallAfterModalHide: true,
            });
        }
        return menuItems;
    }, [
        canEditReceipt,
        readonly,
        isDraftTransaction,
        transaction,
        canDeleteReceipt,
        translate,
        action,
        iouTypeParam,
        isTrackExpenseActionValue,
        draftTransactionID,
        report?.reportID,
        isOffline,
        allowDownload,
        onDownloadAttachment,
    ]);

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source,
            originalFileName: isDraftTransaction ? transaction?.filename : receiptURIs?.filename,
            report,
            headerTitle: translate('common.receipt'),
            threeDotsMenuItems,
            isAuthTokenRequired,
            isTrackExpenseAction: isTrackExpenseActionValue,
            isLoading: !transaction && reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            shouldShowCarousel: false,
            onDownloadAttachment: allowDownload ? undefined : onDownloadAttachment,
            ExtraModals,
        }),
        [
            source,
            isAuthTokenRequired,
            report,
            translate,
            threeDotsMenuItems,
            allowDownload,
            onDownloadAttachment,
            isTrackExpenseActionValue,
            isDraftTransaction,
            transaction,
            receiptURIs?.filename,
            reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            ExtraModals,
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
export type {TransactionReceiptScreenParams};
