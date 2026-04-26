import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {RotationDegrees} from 'react-fast-pdf';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import ReceiptCropView from '@components/ReceiptCropView';
import type {CropRect} from '@components/ReceiptCropView';
import useAllTransactions from '@hooks/useAllTransactions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useRestartOnOdometerImagesFailure from '@hooks/useRestartOnOdometerImagesFailure';
import useThemeStyles from '@hooks/useThemeStyles';
import {detachReceipt, navigateToStartStepIfScanFileCannotBeRead, replaceReceipt, setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import {removeMoneyRequestOdometerImage, setMoneyRequestOdometerImage} from '@libs/actions/OdometerTransactionUtils';
import {openReport} from '@libs/actions/Report';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import fetchImage from '@libs/fetchImage';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import moveReceiptToDurableStorage from '@libs/moveReceiptToDurableStorage';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isTrackExpenseReport} from '@libs/ReportUtils';
import {
    getRequestType,
    hasEReceipt,
    hasMissingSmartscanFields,
    hasOdometerImageSource,
    hasReceipt,
    hasReceiptSource,
    isOdometerDistanceRequest,
    isReceiptBeingScanned,
} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps, ThreeDotsMenuItemFactory} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function TransactionReceiptModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.TRANSACTION_RECEIPT>) {
    const {reportID, transactionID, action, iouType: iouTypeParam, readonly: readonlyParam, mergeTransactionID, imageType, isEditingConfirmation, backToReport} = route.params;

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'Download', 'Crop', 'Trashcan', 'Rotate', 'Close', 'Checkmark']);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const allTransactions = useAllTransactions();
    const transactionMain = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transactionID)}`);
    const [reportMetadata = CONST.DEFAULT_REPORT_METADATA] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const policy = usePolicy(report?.policyID);
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;

    // If we have a merge transaction, we need to use the receipt from the merge transaction
    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(mergeTransactionID)}`);

    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);

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

    useRestartOnOdometerImagesFailure(isDraftTransaction && isOdometerDistanceRequest(transaction) ? transaction : undefined, reportID, iouTypeParam ?? CONST.IOU.TYPE.SUBMIT, backToReport);

    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const receiptURIs = getThumbnailAndImageURIs(transaction);
    const isLocalFile = receiptURIs.isLocalFile;
    const isAuthTokenRequired = !isLocalFile && !isDraftTransaction;
    const readonly = readonlyParam === 'true';
    // Handle odometer images when imageType is provided
    const isOdometerImage = !!imageType;
    let odometerImage: FileObject | string | undefined;
    if (isOdometerImage) {
        odometerImage = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? transaction?.comment?.odometerStartImage : transaction?.comment?.odometerEndImage;
    }
    const odometerFile = typeof odometerImage !== 'string' ? odometerImage : undefined;
    const odometerFilename = odometerFile?.name ?? (typeof odometerImage === 'string' ? odometerImage.split('/').pop() : undefined);
    const odometerUriExtension = odometerFilename?.split('.').pop()?.toLowerCase();
    const odometerFileType = (odometerFile as Partial<File>)?.type ?? (odometerUriExtension ? `image/${odometerUriExtension}` : CONST.IMAGE_FILE_FORMAT.JPEG);
    const [odometerImageSource, setOdometerImageSource] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!isOdometerImage || !odometerImage) {
            setOdometerImageSource(undefined);
            return;
        }

        if (typeof odometerImage === 'string') {
            setOdometerImageSource(odometerImage);
            return;
        }

        if ('uri' in odometerImage && typeof odometerImage.uri === 'string' && odometerImage.uri.length > 0) {
            setOdometerImageSource(odometerImage.uri);
            return;
        }

        if (!(odometerImage instanceof File)) {
            setOdometerImageSource(undefined);
            return;
        }

        const blobUrl = URL.createObjectURL(odometerImage);
        setOdometerImageSource(blobUrl);

        return () => {
            URL.revokeObjectURL(blobUrl);
        };
    }, [isOdometerImage, odometerImage]);

    // Use odometer image if imageType is provided (it's present only when we display odometer image) otherwise use receipt
    const receiptSource = isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');
    const source = isOdometerImage ? odometerImageSource : receiptSource;
    const [sourceUri, setSourceUri] = useState<ReceiptSource>('');

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest({reportAction: parentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction});
    const canDeleteReceipt = canEditFieldOfMoneyRequest({reportAction: parentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, isDeleteAction: true, transaction});

    const receiptFilename = transaction?.receipt?.filename;
    const isStitchedOdometerReceipt = isOdometerDistanceRequest(transaction) && !imageType;

    const shouldShowReplaceReceiptButton = ((canEditReceipt && !readonly) || isDraftTransaction) && !transaction?.receipt?.isTestDriveReceipt && !isStitchedOdometerReceipt;
    const shouldShowDeleteReceiptButton = canDeleteReceipt && !readonly && !isDraftTransaction && !transaction?.receipt?.isTestDriveReceipt;

    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const fileName = (isOdometerImage ? odometerFilename : receiptFilename) ?? '';
    const isImage = !!fileName && Str.isImage(fileName);
    const isPDF = !!fileName && Str.isPDF(fileName);
    const fileType = isOdometerImage ? odometerFileType : (transaction?.receipt?.type ?? CONST.IMAGE_FILE_FORMAT.JPEG);
    const isTrackExpenseActionValue = isTrackExpenseAction(parentReportAction);
    const iouType = useMemo(() => iouTypeParam ?? (isTrackExpenseActionValue ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseActionValue, iouTypeParam]);

    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [pdfRotation, setPdfRotation] = useState<RotationDegrees>(0);
    const [isRotating, setIsRotating] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [isCropSaving, setIsCropSaving] = useState(false);
    const [cropRect, setCropRect] = useState<CropRect | null>(null);
    const styles = useThemeStyles();

    useEffect(() => {
        if ((!!report && !!transaction) || isDraftTransaction) {
            return;
        }
        openReport({reportID, introSelected, betas});
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
        if (!isDraftTransaction || !iouType || !transaction || isOdometerImage) {
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

    let originalFileName = isDraftTransaction ? transaction?.receipt?.filename : receiptURIs?.filename;
    if (isOdometerImage) {
        originalFileName = odometerFile?.name;
    }
    let headerTitle: string;
    if (isOdometerImage) {
        headerTitle = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    } else {
        headerTitle = translate('common.receipt');
    }

    /**
     * Detach the receipt and close the modal.
     */
    const deleteReceiptAndClose = useCallback(() => {
        detachReceipt(transaction?.transactionID, policy, policyTagList, policyCategories);
        navigation.goBack();
    }, [navigation, transaction?.transactionID, policy, policyCategories, policyTagList]);

    /**
     * Remove odometer image and close the modal.
     */
    const deleteOdometerImageAndClose = useCallback(() => {
        if (!transaction?.transactionID || !imageType) {
            return;
        }
        removeMoneyRequestOdometerImage(transaction, imageType, isDraftTransaction, !isEditingConfirmation);
        const odometerGoBackRoute =
            isOdometerImage &&
            (isEditingConfirmation === true
                ? ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action ?? CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID)
                : ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(action ?? CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        Navigation.goBack(odometerGoBackRoute || undefined);
    }, [transaction, imageType, isDraftTransaction, isOdometerImage, isEditingConfirmation, action, iouType, transactionID, reportID, backToReport]);

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
        draftTransactionID,
    });

    const allowDownload = !isEReceipt;

    const applyDurableReceipt = useCallback(
        (imageUri: string, filename: string, file: File, isSameReceipt?: boolean) => {
            if (!transaction?.transactionID) {
                return Promise.resolve();
            }
            return moveReceiptToDurableStorage(imageUri, filename).then((durableUri) => {
                const durableFile = Object.assign(new File([file], file.name || filename, {type: file.type}), {uri: durableUri, source: durableUri});
                if (isOdometerImage) {
                    setMoneyRequestOdometerImage(transaction, imageType, durableFile, isDraftTransaction, !isEditingConfirmation);
                } else if (isDraftTransaction) {
                    setMoneyRequestReceipt(transaction.transactionID, durableUri, filename, isDraftTransaction, fileType);
                } else {
                    replaceReceipt({
                        transactionID: transaction.transactionID,
                        file: durableFile,
                        source: durableUri,
                        transactionPolicyCategories: policyCategories,
                        transactionPolicy: policy,
                        ...(isSameReceipt ? {state: transaction?.receipt?.state, isSameReceipt: true} : {}),
                    });
                }
            });
        },
        [transaction, isDraftTransaction, isOdometerImage, isEditingConfirmation, imageType, fileType, policyCategories, policy],
    );

    const rotateReceipt = useCallback(() => {
        if (!transaction?.transactionID || !sourceUri || !isImage) {
            return;
        }

        setIsRotating(true);
        cropOrRotateImage(sourceUri as string, [{rotate: -90}], {
            compress: 1,
            name: fileName,
            type: fileType,
        })
            .then((rotatedImage) => {
                if (!rotatedImage) {
                    setIsRotating(false);
                    return Promise.resolve();
                }

                const imageUriResult = 'uri' in rotatedImage && rotatedImage.uri ? rotatedImage.uri : undefined;
                if (!imageUriResult) {
                    setIsRotating(false);
                    return Promise.resolve();
                }

                const file = rotatedImage as File;
                const rotatedFilename = file.name ?? receiptFilename;

                return applyDurableReceipt(imageUriResult, rotatedFilename, file, true).then(() => {
                    setIsRotating(false);
                });
            })
            .catch(() => {
                setIsRotating(false);
            });
    }, [transaction?.transactionID, sourceUri, isImage, receiptFilename, fileName, fileType, applyDurableReceipt]);

    const shouldShowRotateAndCropReceiptButton = useMemo(
        () =>
            shouldShowReplaceReceiptButton &&
            transaction &&
            (hasReceiptSource(transaction) || (isOdometerImage && hasOdometerImageSource(transaction, imageType))) &&
            !isEReceipt &&
            !transaction?.receipt?.isTestDriveReceipt &&
            isImage,
        [shouldShowReplaceReceiptButton, transaction, isEReceipt, isOdometerImage, imageType, isImage],
    );

    const enterCropMode = useCallback(() => {
        setIsCropping(true);
        setCropRect(null);
    }, []);

    const exitCropMode = useCallback(() => {
        setIsCropping(false);
        setCropRect(null);
    }, []);

    const handleCropChange = useCallback((crop: CropRect) => {
        setCropRect(crop);
    }, []);

    const saveCrop = useCallback(() => {
        if (!transaction?.transactionID || !sourceUri || !isImage || !cropRect || cropRect.width < 1 || cropRect.height < 1) {
            exitCropMode();
            return;
        }

        setIsCropSaving(true);
        cropOrRotateImage(
            sourceUri as string,
            [
                {
                    crop: {
                        originX: Math.max(0, Math.floor(cropRect.x)),
                        originY: Math.max(0, Math.floor(cropRect.y)),
                        width: Math.max(1, Math.floor(cropRect.width)),
                        height: Math.max(1, Math.floor(cropRect.height)),
                    },
                },
            ],
            {
                compress: 1,
                name: fileName,
                type: fileType,
            },
        )
            .then((croppedImage) => {
                if (!croppedImage) {
                    setIsCropSaving(false);
                    return Promise.resolve();
                }

                const imageUriResult = 'uri' in croppedImage && croppedImage.uri ? croppedImage.uri : undefined;
                if (!imageUriResult) {
                    setIsCropSaving(false);
                    return Promise.resolve();
                }

                const file = croppedImage as File;
                const croppedFilename = file.name ?? receiptFilename;

                return applyDurableReceipt(imageUriResult, croppedFilename, file).then(() => {
                    setIsCropSaving(false);
                    exitCropMode();
                });
            })
            .catch(() => {
                setIsCropSaving(false);
            });
    }, [transaction?.transactionID, sourceUri, isImage, cropRect, receiptFilename, fileName, fileType, exitCropMode, applyDurableReceipt]);

    const threeDotsMenuItems: ThreeDotsMenuItemFactory = useCallback(
        ({file, source: innerSource, isLocalSource}) => {
            const menuItems = [];
            if ((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID) {
                menuItems.push({
                    icon: expensifyIcons.Download,
                    text: translate('common.download'),
                    onSelected: () => onDownloadAttachment({source: innerSource, file}),
                    sentryLabel: CONST.SENTRY_LABEL.RECEIPT_MODAL.DOWNLOAD_RECEIPT,
                });
            }

            const hasOnlyEReceipt = hasEReceipt(transaction) && !hasReceiptSource(transaction);
            const isDeletableReceipt =
                shouldShowDeleteReceiptButton &&
                !hasOnlyEReceipt &&
                hasReceipt(transaction) &&
                !isReceiptBeingScanned(transaction) &&
                !hasMissingSmartscanFields(transaction, transactionReport);
            const isDraftOdometer = isOdometerImage && isDraftTransaction;
            if (isDeletableReceipt || isDraftOdometer) {
                menuItems.push({
                    icon: expensifyIcons.Trashcan,
                    text: isOdometerImage ? translate('distance.odometer.deleteOdometerPhoto') : translate('receipt.deleteReceipt'),
                    onSelected: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                    shouldCallAfterModalHide: true,
                    sentryLabel: CONST.SENTRY_LABEL.RECEIPT_MODAL.DELETE_RECEIPT,
                });
            }
            return menuItems;
        },
        [
            isOdometerImage,
            isOffline,
            allowDownload,
            draftTransactionID,
            transaction,
            shouldShowDeleteReceiptButton,
            transactionReport,
            isDraftTransaction,
            translate,
            expensifyIcons,
            onDownloadAttachment,
        ],
    );

    const ExtraContent = useMemo(
        () => (
            <ConfirmModal
                title={isOdometerImage ? translate('distance.odometer.deleteOdometerPhoto') : translate('receipt.deleteReceipt')}
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
                prompt={isOdometerImage ? translate('distance.odometer.deleteOdometerPhotoConfirmation') : translate('receipt.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        ),
        [deleteReceiptAndClose, deleteOdometerImageAndClose, isDeleteReceiptConfirmModalVisible, isOdometerImage, translate],
    );

    const footerActionButtons = useMemo(() => {
        if (isCropping) {
            return (
                <View style={[styles.flexRow, styles.gap2, styles.ph5, styles.pb5, styles.justifyContentCenter]}>
                    <Button
                        onPress={exitCropMode}
                        text={translate('common.cancel')}
                        icon={expensifyIcons.Close}
                        style={styles.transactionReceiptButton}
                    />
                    <Button
                        success
                        onPress={saveCrop}
                        text={translate('common.save')}
                        isLoading={isCropSaving}
                        isDisabled={!cropRect || isCropSaving}
                        icon={expensifyIcons.Checkmark}
                        style={styles.transactionReceiptButton}
                    />
                </View>
            );
        }

        if (!shouldShowRotateAndCropReceiptButton && !shouldShowReplaceReceiptButton && !isOdometerImage) {
            return null;
        }

        return (
            <View style={[styles.flexRow, styles.gap2, styles.ph5, styles.pb5, styles.justifyContentCenter]}>
                {!!shouldShowRotateAndCropReceiptButton && (
                    <Button
                        icon={expensifyIcons.Rotate}
                        onPress={rotateReceipt}
                        text={translate('common.rotate')}
                        isLoading={isRotating}
                        isDisabled={isRotating}
                        style={styles.transactionReceiptButton}
                    />
                )}
                {!!shouldShowRotateAndCropReceiptButton && (
                    <Button
                        icon={expensifyIcons.Crop}
                        onPress={enterCropMode}
                        text={translate('receipt.crop')}
                        style={styles.transactionReceiptButton}
                    />
                )}
                {isPDF && !isNative && (
                    <Button
                        icon={expensifyIcons.Rotate}
                        onPress={() => setPdfRotation((prev) => ((prev + 270) % 360) as RotationDegrees)}
                        text={translate('common.rotate')}
                        style={styles.transactionReceiptButton}
                    />
                )}
                {(shouldShowReplaceReceiptButton || isOdometerImage) && (
                    <Button
                        icon={expensifyIcons.Camera}
                        onPress={() => {
                            const getDestinationRoute = () => {
                                return isOdometerImage
                                    ? ROUTES.ODOMETER_IMAGE.getRoute(action ?? CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, imageType, isEditingConfirmation, backToReport)
                                    : ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                          action ?? CONST.IOU.ACTION.EDIT,
                                          iouType,
                                          draftTransactionID ?? transaction?.transactionID,
                                          report?.reportID,
                                          Navigation.getActiveRoute(),
                                      );
                            };

                            Navigation.dismissModal({
                                afterTransition: () => Navigation.navigate(getDestinationRoute()),
                            });
                        }}
                        text={translate('common.replace')}
                        style={styles.transactionReceiptButton}
                    />
                )}
            </View>
        );
    }, [
        isCropping,
        shouldShowRotateAndCropReceiptButton,
        shouldShowReplaceReceiptButton,
        isOdometerImage,
        isPDF,
        styles.flexRow,
        styles.gap2,
        styles.ph5,
        styles.pb5,
        styles.justifyContentCenter,
        styles.transactionReceiptButton,
        expensifyIcons.Rotate,
        expensifyIcons.Crop,
        expensifyIcons.Camera,
        expensifyIcons.Close,
        expensifyIcons.Checkmark,
        rotateReceipt,
        translate,
        isRotating,
        enterCropMode,
        exitCropMode,
        saveCrop,
        isCropSaving,
        cropRect,
        action,
        iouType,
        transactionID,
        reportID,
        imageType,
        isEditingConfirmation,
        backToReport,
        draftTransactionID,
        transaction?.transactionID,
        report?.reportID,
        isNative,
    ]);

    const customAttachmentContent = useMemo(() => {
        if (!isCropping || (!sourceUri && !source)) {
            return null;
        }

        return (
            <ReceiptCropView
                imageUri={(sourceUri || source) as string}
                onCropChange={handleCropChange}
                isAuthTokenRequired={sourceUri ? false : isAuthTokenRequired}
            />
        );
    }, [isCropping, sourceUri, handleCropChange, isAuthTokenRequired, source]);

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
            shouldShowRotateButton: false,
            pdfRotation,
            onDownloadAttachment: allowDownload ? undefined : onDownloadAttachment,
            transaction,
            shouldMinimizeMenuButton: false,
            footerActionButtons,
            customAttachmentContent,
            attachmentViewContainerStyles: [styles.pv5, styles.ph2],
        }),
        [
            source,
            originalFileName,
            report,
            headerTitle,
            threeDotsMenuItems,
            isAuthTokenRequired,
            isTrackExpenseActionValue,
            transaction,
            reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            allowDownload,
            onDownloadAttachment,
            pdfRotation,
            footerActionButtons,
            customAttachmentContent,
            styles.pv5,
            styles.ph2,
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
