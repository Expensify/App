import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import {openReport} from '@libs/actions/Report';
import {isMultipleAttachmentsValidationResult, isSingleAttachmentValidationResult} from '@libs/AttachmentValidation';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentContentProps, AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useFileErrorModal from './hooks/useFileErrorModal';
import useFileUploadValidation from './hooks/useFileUploadValidation';
import useNavigateToReportOnRefresh from './hooks/useNavigateToReportOnRefresh';
import useReportAttachmentModalType from './hooks/useReportAttachmentModalType';

const convertFileToAttachment = (file: FileObject | undefined): Attachment => {
    if (!file) {
        return {source: ''};
    }

    return {
        file,
        source: file.uri ?? '',
    };
};

function AddAttachmentModalCarouselView({fileToDisplay, files}: AttachmentContentProps) {
    const {setAttachmentError, clearAttachmentErrors} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

    const [page, setPage] = useState<number>(0);
    const attachments = useMemo(() => {
        if (Array.isArray(files)) {
            return files?.map((file) => convertFileToAttachment(file)) ?? [];
        }

        if (!files) {
            return [];
        }

        return [convertFileToAttachment(files)];
    }, [files]);
    const currentAttachment = useMemo(() => convertFileToAttachment(fileToDisplay), [fileToDisplay]);

    useEffect(() => {
        clearAttachmentErrors();
    }, [clearAttachmentErrors]);

    if (attachments.length === 0 || !currentAttachment) {
        return null;
    }

    return (
        <AttachmentCarouselView
            attachments={attachments}
            source={currentAttachment.source}
            page={page}
            setPage={setPage}
            autoHideArrows={autoHideArrows}
            cancelAutoHideArrow={cancelAutoHideArrows}
            setShouldShowArrows={setShouldShowArrows}
            onAttachmentError={setAttachmentError}
            shouldShowArrows={shouldShowArrows}
        />
    );
}

function ReportAddAttachmentModalContent({route, navigation}: AttachmentModalScreenProps) {
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

    useNavigateToReportOnRefresh({source: sourceParam, file: fileParam, reportID});

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();

    const submitRef = useRef<View | HTMLElement>(null);

    // Extract the reportActionID from the attachmentID (format: reportActionID_index)
    const reportActionID = useMemo(() => attachmentID?.split('_')?.[0], [attachmentID]);

    const shouldFetchReport = useMemo(() => {
        return isEmptyObject(reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID]);
    }, [reportActions, reportActionID]);

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

    const [source, setSource] = useState(() => Number(sourceParam) || (typeof sourceParam === 'string' ? tryResolveUrlFromApiRoot(decodeURIComponent(sourceParam)) : undefined));
    const [filesToValidate, setFilesToValidate] = useState(() => fileParam);
    const {validFilesToUpload, fileError, isFileErrorModalVisible} = useFileUploadValidation({
        files: filesToValidate,
        onValid: (result) => {
            if (isSingleAttachmentValidationResult(result)) {
                setSource(result.validatedFile.source);
            } else if (isMultipleAttachmentsValidationResult(result)) {
                setSource(result.validatedFiles.at(0)?.source);
            }
        },
    });
    const modalType = useReportAttachmentModalType(validFilesToUpload ?? fileParam);

    const onConfirm = useCallback(
        (file: FileObject | FileObject[]) => {
            if (Array.isArray(validFilesToUpload) && validFilesToUpload.length > 0) {
                onConfirmParam?.(validFilesToUpload);
            } else {
                onConfirmParam?.(file);
            }
        },
        [onConfirmParam, validFilesToUpload],
    );

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        return (
            !!isLoadingApp ||
            isEmptyReport ||
            (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport) ||
            (Array.isArray(validFilesToUpload) && validFilesToUpload.length === 0)
        );
    }, [isOffline, report, reportID, isLoadingApp, reportMetadata?.isLoadingInitialReportActions, shouldFetchReport, validFilesToUpload]);

    const confirmAndContinue = useCallback(() => {
        if (fileError !== CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            return;
        }

        setFilesToValidate(fileParam);
    }, [fileError, fileParam]);

    const ExtraModals = useFileErrorModal({
        fileError,
        isFileErrorModalVisible,
        onConfirm: confirmAndContinue,
        onCancel: navigation.goBack,
        isMultipleFiles: Array.isArray(validFilesToUpload) && validFilesToUpload.length > 0,
    });

    const contentProps = useMemo<AttachmentModalBaseContentProps>(() => {
        if (validFilesToUpload === undefined) {
            return {
                isLoading: true,
            };
        }

        return {
            file: validFilesToUpload,
            fileToDisplayIndex: 0,
            source,
            isLoading,
            isAuthTokenRequired,
            attachmentLink,
            originalFileName,
            attachmentID,
            accountID,
            onConfirm,
            headerTitle,
            shouldDisableSendButton,
            submitRef,
            onCarouselAttachmentChange,
            AttachmentContent: AddAttachmentModalCarouselView,
            ExtraModals,
        };
    }, [
        ExtraModals,
        accountID,
        attachmentID,
        attachmentLink,
        headerTitle,
        isAuthTokenRequired,
        isLoading,
        onCarouselAttachmentChange,
        onConfirm,
        originalFileName,
        shouldDisableSendButton,
        source,
        validFilesToUpload,
    ]);

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
ReportAddAttachmentModalContent.displayName = 'ReportAddAttachmentModalContent';

export default ReportAddAttachmentModalContent;
