import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import {openReport} from '@libs/actions/Report';
import type {MultipleAttachmentsValidationError, SingleAttachmentValidationError} from '@libs/AttachmentUtils';
import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentUtils';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps, OnValidateFileCallback} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type ModalType from '@src/types/utils/ModalType';

function AddAttachmentModalContent({route, navigation}: AttachmentModalScreenProps) {
    const {
        attachmentID,
        type,
        file: fileParam,
        source: sourceParam,
        isAuthTokenRequired,
        attachmentLink,
        originalFileName,
        accountID = CONST.DEFAULT_NUMBER_ID,
        reportID,
        hashKey,
        shouldDisableSendButton,
        headerTitle,
        onConfirm: onConfirmParam,
        onShow,
    } = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        canBeMissing: false,
    });

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();

    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject[]>([]);
    const [fileError, setFileError] = useState<SingleAttachmentValidationError | MultipleAttachmentsValidationError>();
    const [isFileErrorModalVisible, setIsFileErrorModalVisible] = useState(false);
    const submitRef = useRef<View | HTMLElement>(null);

    // Extract the reportActionID from the attachmentID (format: reportActionID_index)
    const reportActionID = useMemo(() => attachmentID?.split('_')?.[0], [attachmentID]);

    const shouldFetchReport = useMemo(() => {
        return isEmptyObject(reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID]);
    }, [reportActions, reportActionID]);

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        return !!isLoadingApp || isEmptyReport || (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport) || validFilesToUpload.length === 0;
    }, [isOffline, report, reportID, isLoadingApp, reportMetadata?.isLoadingInitialReportActions, shouldFetchReport, validFilesToUpload.length]);

    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [source, setSource] = useState(() => Number(sourceParam) || (typeof sourceParam === 'string' ? tryResolveUrlFromApiRoot(decodeURIComponent(sourceParam)) : undefined));

    const fetchReport = useCallback(() => {
        openReport(reportID, reportActionID);
    }, [reportID, reportActionID]);

    useEffect(() => {
        if (!reportID || !shouldFetchReport) {
            return;
        }

        fetchReport();
    }, [reportID, fetchReport, shouldFetchReport]);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute({
                reportID,
                attachmentID: attachment.attachmentID,
                type,
                source: String(attachment.source),
                accountID,
                isAuthTokenRequired: attachment?.isAuthTokenRequired,
                originalFileName: attachment?.file?.name,
                attachmentLink: attachment?.attachmentLink,
                hashKey,
            });
            Navigation.navigate(routeToNavigate);
        },
        [reportID, type, accountID, hashKey],
    );

    const onClose = useCallback(() => {
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager.setReadyToFocus();
    }, []);

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) =>
            sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translateLocal('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        [],
    );

    // const handleOpenModal = useCallback(
    //     (inputSource: string, fileObject: FileObject) => {
    //         const inputModalType = getModalType(inputSource, fileObject);
    //         setIsModalOpen(true);
    //         setSourceState(inputSource);
    //         setFile(fileObject);
    //         setModalType(inputModalType);
    //     },
    //     [getModalType, setSourceState, setFile, setModalType],
    // );

    // Validates the attachment file and renders the appropriate modal type or errors
    const validateFile: OnValidateFileCallback = useCallback(
        (file, setFile) => {
            if (!file) {
                return;
            }

            if (Array.isArray(file)) {
                validateMultipleAttachmentFiles(file).then((result) => {
                    if (result.isValid) {
                        const validFiles = result.validatedFiles.map((f) => f.file);
                        const firstFile = validFiles.at(0);
                        const inputModalType = getModalType(firstFile?.uri ?? '', firstFile ?? {});

                        setModalType(inputModalType);
                        setValidFilesToUpload(validFiles);
                        setFile(validFiles);
                        return;
                    }

                    setFileError(result.error);
                    setIsFileErrorModalVisible(true);

                    if (result.error === CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
                        const validFiles = file.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                        setValidFilesToUpload(validFiles);
                        setFile(validFiles);
                    }
                });

                return;
            }

            validateAttachmentFile(file).then((result) => {
                if (result.isValid) {
                    const {validatedFile} = result;
                    const {source: fileSource} = validatedFile;
                    const inputModalType = getModalType(fileSource, file);

                    setModalType(inputModalType);
                    setSource(fileSource);
                    setValidFilesToUpload([validatedFile.file]);
                    setFile(validatedFile.file);

                    return;
                }

                const {error} = result;
                setFileError(error);
            });
        },
        [getModalType],
    );

    const onConfirm = useCallback(
        (file: FileObject | FileObject[]) => {
            if (validFilesToUpload.length) {
                onConfirmParam?.(validFilesToUpload);
            } else {
                onConfirmParam?.(file);
            }
        },
        [onConfirmParam, validFilesToUpload],
    );

    const confirmAndContinue = useCallback(() => {
        const newValidFilesToUpload = validFilesToUpload;
        setValidFilesToUpload([]);

        let shouldRevalidate = false;
        if (fileError === CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            shouldRevalidate = true;
        }
        setIsFileErrorModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            if (shouldRevalidate) {
                setValidFilesToUpload(newValidFilesToUpload);
            }

            setFileError(undefined);
        });
    }, [fileError, validFilesToUpload]);

    const contentTypeProps = useMemo<Partial<AttachmentModalBaseContentProps>>(
        () =>
            fileParam
                ? {
                      file: validFilesToUpload.length ? validFilesToUpload : fileParam,
                      onValidateFile: validateFile,
                  }
                : {
                      // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
                      type,
                      report,
                      shouldShowNotFoundPage: !isLoading && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
                      allowDownload: true,
                      isAuthTokenRequired: !!isAuthTokenRequired,
                      attachmentLink: attachmentLink ?? '',
                      originalFileName: originalFileName ?? '',
                      isLoading,
                  },
        [attachmentLink, fileParam, isAuthTokenRequired, isLoading, originalFileName, report, type, validFilesToUpload, validateFile],
    );

    const contentProps = useMemo<Partial<AttachmentModalBaseContentProps>>(
        () => ({
            ...contentTypeProps,
            fileError,
            isFileErrorModalVisible,
            source,
            attachmentID,
            accountID,
            onConfirm,
            headerTitle,
            shouldDisableSendButton,
            submitRef,
            onCarouselAttachmentChange,
            onFileErrorModalConfirm: confirmAndContinue,
            onFileErrorModalCancel: navigation.goBack,
        }),
        [
            accountID,
            attachmentID,
            confirmAndContinue,
            contentTypeProps,
            fileError,
            headerTitle,
            isFileErrorModalVisible,
            navigation.goBack,
            onCarouselAttachmentChange,
            onConfirm,
            shouldDisableSendButton,
            source,
        ],
    );

    // If the user refreshes during the send attachment flow, we need to navigate back to the report or home
    useEffect(() => {
        if (!!sourceParam || !!fileParam) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            if (reportID) {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            } else {
                Navigation.goBack(ROUTES.HOME);
            }
        });
    }, [sourceParam, reportID, route.name, fileParam]);

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
            modalType={modalType}
            onShow={onShow}
            onClose={onClose}
        />
    );
}
AddAttachmentModalContent.displayName = 'AddAttachmentModalContent';

export default AddAttachmentModalContent;
