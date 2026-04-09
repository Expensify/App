import React, {useEffect, useRef} from 'react';
import type {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {openReport} from '@libs/actions/Report';
import {getValidatedImageSource} from '@libs/AvatarUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canUserPerformWriteAction, isReportNotFound} from '@libs/ReportUtils';
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

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
    });
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const {isOffline} = useNetwork();

    const submitRef = useRef<View | HTMLElement>(null);

    // Extract the reportActionID from the attachmentID (format: reportActionID_index)
    const reportActionID = attachmentID?.split('_')?.[0];

    const shouldFetchReport = isEmptyObject(reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID]);

    const fetchReport = () => {
        openReport({reportID, introSelected, reportActionID, betas});
    };

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

    const source = getValidatedImageSource(sourceParam);

    const modalType = useReportAttachmentModalType(source, file);
    useNavigateToReportOnRefresh({source: sourceParam, file, reportID});

    let isLoading = false;
    const isEmptyReport = isEmptyObject(report);
    isLoading =
        (!isOffline && !isReportNotFound(report) && !!reportID && !!isLoadingApp) ||
        isEmptyReport ||
        (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport) ||
        (Array.isArray(file) && file.length === 0);

    const onConfirm = (f: FileObject | FileObject[]) => {
        if (Array.isArray(file) && file.length > 0) {
            onConfirmParam?.(file);
        } else {
            onConfirmParam?.(f);
        }
    };

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
    });

    useNavigateToReportOnRefresh({source: sourceParam, file, reportID});

    let contentProps: AttachmentModalBaseContentProps;
    if (file === undefined || (Array.isArray(file) && file.length === 0)) {
        contentProps = {
            isLoading: true,
        };
    } else {
        contentProps = {
            file,
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
    }

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
