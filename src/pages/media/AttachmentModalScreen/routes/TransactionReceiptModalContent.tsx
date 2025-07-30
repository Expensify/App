import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
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
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function TransactionReceiptModalContent({navigation, route}: AttachmentModalScreenProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const {reportID = '', transactionID = '', iouAction, iouType: iouTypeParam, readonly: readonlyProp, isFromReviewDuplicates: isFromReviewDuplicatesProp} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [transactionMain] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [reportMetadata = CONST.DEFAULT_REPORT_METADATA] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});

    const isDraftTransaction = !!iouAction;
    const transaction = isDraftTransaction ? transactionDraft : transactionMain;
    const receiptURIs = getThumbnailAndImageURIs(transaction);

    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = !!readonlyProp;
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
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouAction, iouTypeParam, transactionID, reportID),
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

    const downloadAttachment = useDownloadAttachment({
        isAuthTokenRequired: !isLocalFile && !isDraftTransaction,
        draftTransactionID: isDraftTransaction ? transactionID : undefined,
    });

    const draftTransactionID = isDraftTransaction ? transactionID : undefined;
    const allowDownload = !isEReceipt;

    const threeDotsMenuItems = useMemo(() => {
        const menuItems = [];
        const canEdit = ((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt;

        if (canEdit) {
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replace'),
                onSelected: () => {
                    InteractionManager.runAfterInteractions(() => {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                iouAction ?? CONST.IOU.ACTION.EDIT,
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

        const menuItemGenerator: ThreeDotsMenuItemGenerator = ({source: sourceState, file, isLocalSource}) => {
            if (!((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID)) {
                return;
            }

            return {
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => downloadAttachment({source: sourceState, file}),
            };
        };
        menuItems.push(menuItemGenerator);

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
        iouAction,
        iouTypeParam,
        isTrackExpenseActionValue,
        draftTransactionID,
        report?.reportID,
        isOffline,
        allowDownload,
        downloadAttachment,
    ]);

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source,
            isAuthTokenRequired: !isLocalFile && !isDraftTransaction,
            report,
            headerTitle: translate('common.receipt'),
            threeDotsMenuItems,
            allowDownload,
            isTrackExpenseAction: isTrackExpenseActionValue,
            originalFileName: isDraftTransaction ? transaction?.filename : receiptURIs?.filename,
            isLoading: !transaction && reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            shouldShowDownloadButton: false,
            shouldShowCarousel: false,
            onDownloadAttachment: downloadAttachment,
            ExtraModals,
        }),
        [
            source,
            isLocalFile,
            isDraftTransaction,
            report,
            translate,
            threeDotsMenuItems,
            allowDownload,
            isTrackExpenseActionValue,
            transaction,
            receiptURIs?.filename,
            reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            downloadAttachment,
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
