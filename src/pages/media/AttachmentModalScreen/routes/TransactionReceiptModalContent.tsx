import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {detachReceipt, detachOdometerStartImage, detachOdometerEndImage, navigateToStartStepIfScanFileCannotBeRead} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isTrackExpenseReport} from '@libs/ReportUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import {getRequestType, hasEReceipt, hasMissingSmartscanFields, hasReceipt, hasReceiptSource, isReceiptBeingScanned} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps, ThreeDotsMenuItemFactory} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function TransactionReceiptModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.TRANSACTION_RECEIPT>) {
    const {
        reportID,
        transactionID,
        action,
        iouType: iouTypeParam,
        readonly: readonlyParam,
        isFromReviewDuplicates: isFromReviewDuplicatesParam,
        mergeTransactionID,
        imageType,
    } = route.params;

    const icons = useMemoizedLazyExpensifyIcons(['Download'] as const);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera'] as const);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [transactionMain] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [reportMetadata = CONST.DEFAULT_REPORT_METADATA] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);

    // If we have a merge transaction, we need to use the receipt from the merge transaction
    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, {canBeMissing: true});

    const isDraftTransaction = !!action;
    const draftTransactionID = isDraftTransaction ? transactionID : undefined;

    // Determine which transaction to use based on the scenario
    const transaction = useMemo(() => {
        if (isDraftTransaction) {
            return transactionDraft;
        }

        if (mergeTransactionID && mergeTransaction && transactionMain) {
            // If we have a merge transaction, we need to use the receipt from the merge transaction
            return {
                ...transactionMain,
                receipt: mergeTransaction.receipt,
            };
        }

        return transactionMain;
    }, [isDraftTransaction, mergeTransaction, mergeTransactionID, transactionDraft, transactionMain]);

    const receiptURIs = getThumbnailAndImageURIs(transaction);
    const isLocalFile = receiptURIs.isLocalFile;
    const isAuthTokenRequired = !isLocalFile && !isDraftTransaction;
    const readonly = readonlyParam === 'true';
    const isFromReviewDuplicates = isFromReviewDuplicatesParam === 'true';

    // Handle odometer images when imageType is provided
    const isOdometerImage = !!imageType;
    let odometerImage: File | string | undefined;
    if (isOdometerImage) {
        odometerImage = imageType === 'start' ? transaction?.comment?.odometerStartImage : transaction?.comment?.odometerEndImage;
    }

    // Get image source - use odometer image if imageType is provided, otherwise use receipt
    const getImageSource = () => {
        if (isOdometerImage && odometerImage) {
            // Web: File object, create blob URL
            if (typeof odometerImage !== 'string' && odometerImage instanceof File) {
                return URL.createObjectURL(odometerImage);
            }
            // Native: URI string, use directly
            if (typeof odometerImage === 'string') {
                return odometerImage;
            }
        }
        return isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');
    };

    const source = getImageSource();

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canDeleteReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, true);

    const shouldShowReplaceReceiptButton = ((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt;
    const shouldShowDeleteReceiptButton = canDeleteReceipt && !readonly && !isDraftTransaction && !transaction?.receipt?.isTestDriveReceipt;

    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseActionValue = isTrackExpenseAction(parentReportAction);
    const iouType = useMemo(() => iouTypeParam ?? (isTrackExpenseActionValue ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseActionValue, iouTypeParam]);

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
        const receiptFilename = transaction?.receipt?.filename;
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
    const isTrackExpenseReportValue = isTrackExpenseReport(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReportValue || isDraftTransaction || transaction?.reportID === CONST.REPORT.SPLIT_REPORT_ID || isFromReviewDuplicates
            ? !transaction
            : moneyRequestReportID !== transaction?.reportID;

    const originalFileName = isDraftTransaction ? transaction?.receipt?.filename : receiptURIs?.filename;
    let headerTitle: string;
    if (isOdometerImage) {
        headerTitle = imageType === 'start' ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    } else {
        headerTitle = translate('common.receipt');
    }

    /**
     * Detach the receipt and close the modal.
     */
    const deleteReceiptAndClose = useCallback(() => {
        detachReceipt(transaction?.transactionID, policy, policyCategories);
        navigation.goBack();
    }, [navigation, transaction?.transactionID, policy, policyCategories]);

    /**
     * Detach odometer image and close the modal.
     */
    const deleteOdometerImageAndClose = useCallback(() => {
        if (!transaction?.transactionID || !imageType) {
            return;
        }
        const isDraft = shouldUseTransactionDraft(action, iouType);
        if (imageType === 'start') {
            detachOdometerStartImage(transaction.transactionID, isDraft);
        } else {
            detachOdometerEndImage(transaction.transactionID, isDraft);
        }
        navigation.goBack();
    }, [navigation, transaction?.transactionID, imageType, action, iouType]);

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
        draftTransactionID,
    });

    const allowDownload = !isEReceipt;

    const threeDotsMenuItems: ThreeDotsMenuItemFactory = useCallback(
        ({file, source: innerSource, isLocalSource}) => {
            const menuItems = [];

            // Replace action - navigate to ODOMETER_IMAGE route for odometer images, otherwise to scan page
            if (shouldShowReplaceReceiptButton || (isOdometerImage && isDraftTransaction)) {
                menuItems.push({
                    icon: expensifyIcons.Camera,
                    text: translate('common.replace'),
                    onSelected: () => {
                        Navigation.dismissModal({
                            callback: () =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                        action ?? CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        draftTransactionID ?? transaction?.transactionID,
                                        report?.reportID,
                                        Navigation.getActiveRoute(),
                                    ),
                                ),
                        });
                    },
                });
            }

            // Download action - available for odometer images and regular receipts
            if ((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID || isOdometerImage) {
                menuItems.push({
                    icon: icons.Download,
                    text: translate('common.download'),
                    onSelected: () => {
                        // For odometer images, use the odometer image source
                        let downloadSource = innerSource;
                        if (isOdometerImage && odometerImage) {
                            if (typeof odometerImage === 'string') {
                                downloadSource = odometerImage;
                            } else if (odometerImage instanceof File) {
                                downloadSource = URL.createObjectURL(odometerImage);
                            }
                        }
                        const downloadFile = isOdometerImage && odometerImage && odometerImage instanceof File ? odometerImage : file;
                        onDownloadAttachment({source: downloadSource, file: downloadFile});
                    },
                });
            }

            // Delete action - use odometer-specific delete for odometer images
            if (isOdometerImage && isDraftTransaction) {
                menuItems.push({
                    icon: Expensicons.Trashcan,
                    text: translate('receipt.deleteReceipt'),
                    onSelected: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                    shouldCallAfterModalHide: true,
                });
            } else {
                const hasOnlyEReceipt = hasEReceipt(transaction) && !hasReceiptSource(transaction);
                if (shouldShowDeleteReceiptButton && !hasOnlyEReceipt && hasReceipt(transaction) && !isReceiptBeingScanned(transaction) && !hasMissingSmartscanFields(transaction)) {
                    menuItems.push({
                        icon: Expensicons.Trashcan,
                        text: translate('receipt.deleteReceipt'),
                        onSelected: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                        shouldCallAfterModalHide: true,
                    });
                }
            }
            return menuItems;
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        },
        [
            icons.Download,
            shouldShowReplaceReceiptButton,
            isOffline,
            allowDownload,
            draftTransactionID,
            transaction,
            shouldShowDeleteReceiptButton,
            translate,
            action,
            iouType,
            report?.reportID,
            onDownloadAttachment,
            expensifyIcons.Camera,
            isOdometerImage,
            imageType,
            odometerImage,
            isDraftTransaction,
        ],
    );

    const ExtraContent = useMemo(
        () => (
            <ConfirmModal
                title={translate('receipt.deleteReceipt')}
                isVisible={isDeleteReceiptConfirmModalVisible}
                onConfirm={() => {
                    if (isOdometerImage) {
                        deleteOdometerImageAndClose();
                    } else {
                        deleteReceiptAndClose();
                    }
                    setIsDeleteReceiptConfirmModalVisible(false);
                }}
                onCancel={() => setIsDeleteReceiptConfirmModalVisible?.(false)}
                prompt={isOdometerImage ? translate('receipt.deleteConfirmation') : translate('receipt.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        ),
        [deleteReceiptAndClose, deleteOdometerImageAndClose, isDeleteReceiptConfirmModalVisible, isOdometerImage, translate],
    );

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source,
            originalFileName,
            report,
            headerTitle,
            threeDotsMenuItems,
            isAuthTokenRequired,
            isTrackExpenseAction: isTrackExpenseActionValue,
            isLoading: !transaction && reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            shouldShowCarousel: false,
            onDownloadAttachment: allowDownload ? undefined : onDownloadAttachment,
            transaction,
        }),
        [
            allowDownload,
            headerTitle,
            isAuthTokenRequired,
            isTrackExpenseActionValue,
            onDownloadAttachment,
            originalFileName,
            report,
            reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            source,
            threeDotsMenuItems,
            transaction,
        ],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
            ExtraContent={ExtraContent}
        />
    );
}
TransactionReceiptModalContent.displayName = 'TransactionReceiptModalContent';

export default TransactionReceiptModalContent;
