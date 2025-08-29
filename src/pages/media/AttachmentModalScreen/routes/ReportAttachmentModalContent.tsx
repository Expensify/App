import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {View} from 'react-native';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useNavigateToReportOnRefresh from './hooks/useNavigateToReportOnRefresh';
import useReportAttachmentModalType from './hooks/useReportAttachmentModalType';

function ReportAttachmentModalContent({route, navigation}: AttachmentModalScreenProps<typeof SCREENS.ATTACHMENTS>) {
    const {attachmentID, type, source: sourceParam, isAuthTokenRequired, attachmentLink, originalFileName, accountID, reportID, hashKey, headerTitle, onShow, onClose} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        canBeMissing: false,
    });

    useNavigateToReportOnRefresh({source: sourceParam, reportID});

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();

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
        return !!isLoadingApp || isEmptyReport || (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport);
    }, [isOffline, reportID, isLoadingApp, report, reportMetadata, shouldFetchReport]);

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

    const onDownloadAttachment = useDownloadAttachment({
        isAuthTokenRequired,
    });

    const source = useMemo(() => Number(sourceParam) || (typeof sourceParam === 'string' ? tryResolveUrlFromApiRoot(decodeURIComponent(sourceParam)) : undefined), [sourceParam]);
    const modalType = useReportAttachmentModalType();

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
            type,
            report,
            shouldShowNotFoundPage: !isLoading && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
            isAuthTokenRequired: !!isAuthTokenRequired,
            attachmentLink: attachmentLink ?? '',
            originalFileName: originalFileName ?? '',
            isLoading,
            source,
            attachmentID,
            accountID,
            headerTitle,
            submitRef,
            onDownloadAttachment,
            onCarouselAttachmentChange,
        }),
        [accountID, attachmentID, attachmentLink, headerTitle, isAuthTokenRequired, isLoading, onCarouselAttachmentChange, onDownloadAttachment, originalFileName, report, source, type],
    );

    return (
        <AttachmentModalContainer<typeof SCREENS.ATTACHMENTS>
            navigation={navigation}
            contentProps={contentProps}
            modalType={modalType}
            onShow={onShow}
            onClose={onClose}
        />
    );
}
ReportAttachmentModalContent.displayName = 'ReportAttachmentModalContent';

export default ReportAttachmentModalContent;
