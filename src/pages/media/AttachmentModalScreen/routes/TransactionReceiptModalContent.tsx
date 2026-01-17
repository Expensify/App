import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import useAllTransactions from '@hooks/useAllTransactions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {detachReceipt, navigateToStartStepIfScanFileCannotBeRead, replaceReceipt, setMoneyRequestReceipt} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import fetchImage from '@libs/fetchImage';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isTrackExpenseReport} from '@libs/ReportUtils';
import {getRequestType, hasEReceipt, hasMissingSmartscanFields, hasReceipt, hasReceiptSource, isReceiptBeingScanned} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps, ThreeDotsMenuItemFactory} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function TransactionReceiptModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.TRANSACTION_RECEIPT>) {
    const {reportID, transactionID, action, iouType: iouTypeParam, readonly: readonlyParam, mergeTransactionID} = route.params;

    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const allTransactions = useAllTransactions();
    const transactionMain = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const [reportMetadata = CONST.DEFAULT_REPORT_METADATA] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);

    // If we have a merge transaction, we need to use the receipt from the merge transaction
    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(mergeTransactionID)}`, {canBeMissing: true});

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
    const source = isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');
    const [sourceUri, setSourceUri] = useState<ReceiptSource>('');

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canDeleteReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, true);

    const shouldShowReplaceReceiptButton = ((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt;
    const shouldShowDeleteReceiptButton = canDeleteReceipt && !readonly && !isDraftTransaction && !transaction?.receipt?.isTestDriveReceipt;

    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseActionValue = isTrackExpenseAction(parentReportAction);
    const iouType = useMemo(() => iouTypeParam ?? (isTrackExpenseActionValue ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseActionValue, iouTypeParam]);

    const receiptFilename = transaction?.receipt?.filename;
    const isImage = !!receiptFilename && Str.isImage(receiptFilename);

    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
        if ((!!report && !!transaction) || isDraftTransaction) {
            return;
        }
        openReport(reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!source || !isImage) {
            return;
        }

        if (!isAuthTokenRequired || typeof source !== 'string') {
            setSourceUri(source);
            return;
        }

        if (!session?.encryptedAuthToken) {
            return;
        }

        fetchImage(source, session?.encryptedAuthToken)
            .then((uri) => {
                setSourceUri(uri);
            })
            .catch(() => setSourceUri(''));
    }, [source, isAuthTokenRequired, session?.encryptedAuthToken, isDraftTransaction, isImage]);

    const receiptPath = transaction?.receipt?.source;

    useEffect(() => {
        if (!isDraftTransaction || !iouType || !transaction) {
            return;
        }

        const requestType = getRequestType(transaction);
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiptPath]);

    const moneyRequestReportID = isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isTrackExpenseReportValue = isTrackExpenseReport(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReportValue || isDraftTransaction || transaction?.reportID === CONST.REPORT.SPLIT_REPORT_ID || readonly ? !transaction : moneyRequestReportID !== transaction?.reportID;

    const originalFileName = isDraftTransaction ? transaction?.receipt?.filename : receiptURIs?.filename;
    const headerTitle = translate('common.receipt');

    /**
     * Detach the receipt and close the modal.
     */
    const deleteReceiptAndClose = useCallback(() => {
        detachReceipt(transaction?.transactionID, policy, policyCategories);
        navigation.goBack();
    }, [navigation, transaction?.transactionID, policy, policyCategories]);

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
        draftTransactionID,
    });

    const allowDownload = !isEReceipt;

    /**
     * Rotate the receipt image 90 degrees and save it automatically.
     */
    const rotateReceipt = useCallback(() => {
        if (!transaction?.transactionID || !sourceUri || !isImage) {
            return;
        }

        const receiptType = transaction?.receipt?.type ?? CONST.IMAGE_FILE_FORMAT.JPEG;

        setIsRotating(true);
        cropOrRotateImage(sourceUri as string, [{rotate: -90}], {
            compress: 1,
            name: receiptFilename,
            type: receiptType,
        })
            .then((rotatedImage) => {
                if (!rotatedImage) {
                    setIsRotating(false);
                    return;
                }

                // Both web and native return objects with uri property
                const imageUriResult = 'uri' in rotatedImage && rotatedImage.uri ? rotatedImage.uri : undefined;
                if (!imageUriResult) {
                    setIsRotating(false);
                    return;
                }

                const file = rotatedImage as File;
                const rotatedFilename = file.name ?? receiptFilename;

                if (isDraftTransaction) {
                    // Update the transaction immediately so the modal displays the rotated image right away
                    setMoneyRequestReceipt(transaction.transactionID, imageUriResult, rotatedFilename, isDraftTransaction, receiptType);
                } else {
                    replaceReceipt({
                        transactionID: transaction.transactionID,
                        file,
                        source: imageUriResult,
                        transactionPolicyCategories: policyCategories,
                        transactionPolicy: policy,
                    });
                }
                setIsRotating(false);
            })
            .catch(() => {
                setIsRotating(false);
            });
    }, [transaction?.transactionID, isDraftTransaction, sourceUri, isImage, receiptFilename, policyCategories, transaction?.receipt?.type, policy]);

    const shouldShowRotateReceiptButton = useMemo(
        () =>
            shouldShowReplaceReceiptButton &&
            transaction &&
            hasReceiptSource(transaction) &&
            !isEReceipt &&
            !transaction?.receipt?.isTestDriveReceipt &&
            (receiptFilename ? Str.isImage(receiptFilename) : false),
        [shouldShowReplaceReceiptButton, transaction, isEReceipt, receiptFilename],
    );

    const threeDotsMenuItems: ThreeDotsMenuItemFactory = useCallback(
        ({file, source: innerSource, isLocalSource}) => {
            const menuItems = [];
            if (shouldShowReplaceReceiptButton) {
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
                    sentryLabel: CONST.SENTRY_LABEL.RECEIPT_MODAL.REPLACE_RECEIPT,
                });
            }
            if ((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID) {
                menuItems.push({
                    icon: icons.Download,
                    text: translate('common.download'),
                    onSelected: () => onDownloadAttachment({source: innerSource, file}),
                    sentryLabel: CONST.SENTRY_LABEL.RECEIPT_MODAL.DOWNLOAD_RECEIPT,
                });
            }

            const hasOnlyEReceipt = hasEReceipt(transaction) && !hasReceiptSource(transaction);
            if (shouldShowDeleteReceiptButton && !hasOnlyEReceipt && hasReceipt(transaction) && !isReceiptBeingScanned(transaction) && !hasMissingSmartscanFields(transaction)) {
                menuItems.push({
                    icon: Expensicons.Trashcan,
                    text: translate('receipt.deleteReceipt'),
                    onSelected: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                    shouldCallAfterModalHide: true,
                    sentryLabel: CONST.SENTRY_LABEL.RECEIPT_MODAL.DELETE_RECEIPT,
                });
            }
            return menuItems;
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
        ],
    );

    const ExtraContent = useMemo(
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
            shouldShowRotateButton: shouldShowRotateReceiptButton,
            onRotateButtonPress: rotateReceipt,
            isRotating,
            onDownloadAttachment: allowDownload ? undefined : onDownloadAttachment,
            transaction,
            shouldMinimizeMenuButton: false,
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
            shouldShowRotateReceiptButton,
            rotateReceipt,
            isRotating,
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

export default TransactionReceiptModalContent;
