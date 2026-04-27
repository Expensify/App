import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {openReport} from '@libs/actions/Report';
import {getValidatedImageSource} from '@libs/AvatarUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canUserPerformWriteAction, isReportNotFound} from '@libs/ReportUtils';
import validateAttachmentFile from '@libs/validateAttachmentFile';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import useNavigateToReportOnRefresh from '@pages/media/AttachmentModalScreen/routes/hooks/useNavigateToReportOnRefresh';
import useReportAttachmentModalType from '@pages/media/AttachmentModalScreen/routes/hooks/useReportAttachmentModalType';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AddAttachmentModalCarouselView from './AddAttachmentModalCarouselView';

function ReportAddAttachmentModalContent({route, navigation}: AttachmentModalScreenProps<typeof SCREENS.REPORT_ADD_ATTACHMENT>) {
    const {
        attachmentID,
        file: fileParam,
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

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const {isOffline} = useNetwork();

    const submitRef = useRef<View | HTMLElement>(null);

    // Extract the reportActionID from the attachmentID (format: reportActionID_index)
    const reportActionID = useMemo(() => attachmentID?.split('_')?.[0], [attachmentID]);

    const shouldFetchReport = useMemo(() => {
        return isEmptyObject(reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID]);
    }, [reportActions, reportActionID]);

    const fetchReport = useCallback(() => {
        openReport({reportID, introSelected, reportActionID, betas});
    }, [reportID, introSelected, reportActionID, betas]);

    // Close the modal if user loses write access (e.g., admin switches "Who can post" to Admins only)
    useEffect(() => {
        if (canPerformWriteAction || !report || isEmptyObject(report)) {
            return;
        }
        Navigation.dismissModal();
    }, [canPerformWriteAction, report]);

    useEffect(() => {
        if (!reportID || !shouldFetchReport) {
            return;
        }

        fetchReport();
    }, [reportID, fetchReport, shouldFetchReport]);

    const [source, setSource] = useState(() => getValidatedImageSource(sourceParam));

    const [validFiles, setValidFiles] = useState<FileObject | FileObject[] | undefined>(fileParam);
    useEffect(() => {
        async function validateFiles() {
            if (!fileParam) {
                return;
            }

            const files = Array.isArray(fileParam) ? fileParam : [fileParam];
            const results = await Promise.all(files.map(async (file) => validateAttachmentFile(file)));

            const validResults = results.filter((r) => r.isValid);
            if (validResults.length === 0) {
                return;
            }

            const validatedFiles = validResults.map((r) => r.file);
            const firstValidSource = validResults.at(0)?.file.uri;

            setSource(firstValidSource);
            setValidFiles(validatedFiles);
        }

        validateFiles();
    }, [fileParam]);

    const modalType = useReportAttachmentModalType(source, validFiles);
    useNavigateToReportOnRefresh({source: sourceParam, file: validFiles, reportID});

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        return !!isLoadingApp || isEmptyReport || (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport) || (Array.isArray(validFiles) && validFiles.length === 0);
    }, [isOffline, report, reportID, isLoadingApp, reportMetadata?.isLoadingInitialReportActions, shouldFetchReport, validFiles]);

    const onConfirm = useCallback(
        (f: FileObject | FileObject[]) => {
            if (Array.isArray(validFiles) && validFiles.length > 0) {
                onConfirmParam?.(validFiles);
            } else {
                onConfirmParam?.(f);
            }
        },
        [validFiles, onConfirmParam],
    );

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
    });

    useNavigateToReportOnRefresh({source: sourceParam, file: validFiles, reportID});

    const contentProps = useMemo<AttachmentModalBaseContentProps>(() => {
        if (validFiles === undefined || (Array.isArray(validFiles) && validFiles.length === 0)) {
            return {
                isLoading: true,
            };
        }

        return {
            file: validFiles,
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
        validFiles,
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

export default ReportAddAttachmentModalContent;
