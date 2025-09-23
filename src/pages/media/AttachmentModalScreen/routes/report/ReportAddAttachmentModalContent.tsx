import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openReport} from '@libs/actions/Report';
import validateAttachmentFile from '@libs/AttachmentUtils';
import type {AttachmentValidationResult} from '@libs/AttachmentUtils';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentContentProps, AttachmentModalBaseContentProps, OnValidateFileCallback} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import useNavigateToReportOnRefresh from '@pages/media/AttachmentModalScreen/routes/hooks/useNavigateToReportOnRefresh';
import useReportAttachmentModalType from '@pages/media/AttachmentModalScreen/routes/hooks/useReportAttachmentModalType';
import type {AttachmentModalScreenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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

    // Validates the attachment file and renders the appropriate modal type or errors
    const onValidateFile: OnValidateFileCallback = useCallback((fileToValidate, setFile) => {
        if (!fileToValidate) {
            return;
        }

        function updateState(result: AttachmentValidationResult | undefined) {
            if (!result?.isValid) {
                return;
            }

            setSource(result.source);
            setFile(result.file);
        }

        if (Array.isArray(fileToValidate)) {
            Promise.all(fileToValidate.map((f) => validateAttachmentFile(f))).then((results) => {
                const firstValidResult = results.find((result) => result.isValid);
                updateState(firstValidResult);
            });
            return;
        }

        validateAttachmentFile(fileToValidate).then(updateState);
    }, []);

    const modalType = useReportAttachmentModalType(source, file);

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        return !!isLoadingApp || isEmptyReport || (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport) || (Array.isArray(file) && file.length === 0);
    }, [isOffline, report, reportID, isLoadingApp, reportMetadata?.isLoadingInitialReportActions, shouldFetchReport, file]);

    const onConfirm = useCallback(
        (f: FileObject | FileObject[]) => {
            if (Array.isArray(file) && file.length > 0) {
                onConfirmParam?.(file);
            } else {
                onConfirmParam?.(f);
            }
        },
        [onConfirmParam, file],
    );

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
    });

    const contentProps = useMemo<AttachmentModalBaseContentProps>(() => {
        if (file === undefined || (Array.isArray(file) && file.length === 0)) {
            return {
                isLoading: true,
            };
        }

        return {
            file,
            onValidateFile,
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
        };
    }, [
        file,
        onValidateFile,
        source,
        isLoading,
        isAuthTokenRequired,
        attachmentLink,
        originalFileName,
        attachmentID,
        accountID,
        headerTitle,
        shouldDisableSendButton,
        onConfirm,
        onDownloadAttachment,
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
AddAttachmentModalCarouselView.displayName = 'AddAttachmentModalCarouselView';

export default ReportAddAttachmentModalContent;
