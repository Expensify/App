import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openReport} from '@libs/actions/Report';
import {isMultipleAttachmentsValidationResult, isSingleAttachmentValidationResult} from '@libs/AttachmentValidation';
import {getFileValidationErrorText} from '@libs/fileDownload/FileUtils';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentContentProps, AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import type {AttachmentModalScreenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useFileUploadValidation from '../hooks/useFileUploadValidation';
import useNavigateToReportOnRefresh from '../hooks/useNavigateToReportOnRefresh';
import useReportAttachmentModalType from '../hooks/useReportAttachmentModalType';

const convertFileToAttachment = (file: FileObject | undefined): Attachment => {
    if (!file) {
        return {source: ''};
    }

    return {
        file,
        source: file.uri ?? '',
    };
};

function ReportAddAttachmentModalContent({route, navigation}: AttachmentModalScreenProps<typeof SCREENS.REPORT_ADD_ATTACHMENT>) {
    const {
        attachmentID,
        file,
        source: sourceParam,
        isAuthTokenRequired,
        attachmentLink,
        originalFileName,
        accountID = CONST.DEFAULT_NUMBER_ID,
        reportID,
        shouldDisableSendButton,
        headerTitle,
        onConfirm: onConfirmParam,
        onShow,
        onClose,
    } = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        canBeMissing: false,
    });

    useNavigateToReportOnRefresh({source: sourceParam, file, reportID});

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

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

    const [source, setSource] = useState(() => Number(sourceParam) || (typeof sourceParam === 'string' ? tryResolveUrlFromApiRoot(decodeURIComponent(sourceParam)) : undefined));
    const [filesToValidate, setFilesToValidate] = useState(() => file);
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
    const isMultipleFiles = useMemo(() => Array.isArray(validFilesToUpload) && validFilesToUpload.length > 0, [validFilesToUpload]);

    const modalType = useReportAttachmentModalType(validFilesToUpload ?? file);

    const onConfirm = useCallback(
        (f: FileObject | FileObject[]) => {
            if (Array.isArray(validFilesToUpload) && validFilesToUpload.length > 0) {
                onConfirmParam?.(validFilesToUpload);
            } else {
                onConfirmParam?.(f);
            }
        },
        [onConfirmParam, validFilesToUpload],
    );

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
    });

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

        setFilesToValidate(file);
    }, [fileError, file]);

    const ExtraModals = useMemo(
        () => (
            <ConfirmModal
                title={getFileValidationErrorText(fileError).title}
                onConfirm={() => confirmAndContinue()}
                onCancel={navigation.goBack}
                isVisible={isFileErrorModalVisible}
                prompt={getFileValidationErrorText(fileError).reason}
                confirmText={translate(isMultipleFiles ? 'common.continue' : 'common.close')}
                shouldShowCancelButton={isMultipleFiles}
                cancelText={translate('common.cancel')}
            />
        ),
        [confirmAndContinue, fileError, isFileErrorModalVisible, isMultipleFiles, navigation.goBack, translate],
    );

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
            headerTitle,
            shouldDisableSendButton,
            submitRef,
            onConfirm,
            onDownloadAttachment,
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
        onConfirm,
        onDownloadAttachment,
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

export default ReportAddAttachmentModalContent;
