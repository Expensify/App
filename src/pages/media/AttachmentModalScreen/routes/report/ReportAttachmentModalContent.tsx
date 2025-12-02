import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {View} from 'react-native';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import {openReport} from '@libs/actions/Report';
import {getValidatedImageSource} from '@libs/AvatarUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isReportNotFound} from '@libs/ReportUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import useNavigateToReportOnRefresh from '@pages/media/AttachmentModalScreen/routes/hooks/useNavigateToReportOnRefresh';
import useReportAttachmentModalType from '@pages/media/AttachmentModalScreen/routes/hooks/useReportAttachmentModalType';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SafeString from '@src/utils/SafeString';

function ReportAttachmentModalContent({route, navigation}: AttachmentModalScreenProps<typeof SCREENS.REPORT_ATTACHMENTS>) {
    const {attachmentID, type, source: sourceParam, isAuthTokenRequired, attachmentLink, originalFileName, accountID, reportID, hashKey, headerTitle, onShow, onClose} = route.params;

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });

    const reportActionID = useMemo(() => attachmentID?.split('_')?.[0], [attachmentID]);
    const originalReportID = useOriginalReportID(reportID, reportActionID ? (reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID] ?? {reportActionID}) : undefined);
    const reportActionReportID = originalReportID ?? reportID;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportActionReportID}`, {canBeMissing: false});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportActionReportID}`, {
        canBeMissing: false,
    });

    useNavigateToReportOnRefresh({source: sourceParam, reportID});

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();

    const submitRef = useRef<View | HTMLElement>(null);

    const shouldFetchReport = useMemo(() => {
        return isEmptyObject(reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID]);
    }, [reportActions, reportActionID]);

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportActionReportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        return !!isLoadingApp || isEmptyReport || (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport);
    }, [isOffline, reportActionReportID, isLoadingApp, report, reportMetadata?.isLoadingInitialReportActions, shouldFetchReport]);

    const fetchReport = useCallback(() => {
        openReport(reportActionReportID, reportActionID);
    }, [reportActionReportID, reportActionID]);

    useEffect(() => {
        if (!reportActionReportID || !shouldFetchReport) {
            return;
        }

        fetchReport();
    }, [reportActionReportID, fetchReport, shouldFetchReport]);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.REPORT_ATTACHMENTS.getRoute({
                reportID,
                attachmentID: attachment.attachmentID,
                type,
                source: SafeString(attachment.source),
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

    const source = useMemo(() => getValidatedImageSource(sourceParam), [sourceParam]);
    const modalType = useReportAttachmentModalType(source);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !isLoading && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID;

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
            type,
            report,
            shouldShowNotFoundPage,
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
        [
            accountID,
            attachmentID,
            attachmentLink,
            headerTitle,
            isAuthTokenRequired,
            isLoading,
            onCarouselAttachmentChange,
            onDownloadAttachment,
            originalFileName,
            report,
            shouldShowNotFoundPage,
            source,
            type,
        ],
    );

    return (
        <AttachmentModalContainer<typeof SCREENS.REPORT_ATTACHMENTS>
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
