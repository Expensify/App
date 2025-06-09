import React, {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import {openReport} from '@libs/actions/Report';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportAttachmentsProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>;

function ReportAttachments({route}: ReportAttachmentsProps) {
    const reportID = route.params.reportID;
    const attachmentID = route.params.attachmentID;
    const type = route.params.type;
    const hashKey = route.params.hashKey;
    const accountID = route.params.accountID;
    const isAuthTokenRequired = route.params.isAuthTokenRequired;
    const attachmentLink = route.params.attachmentLink;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        canBeMissing: false,
    });
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});
    const {isOffline} = useNetwork();
    const fileName = route.params?.fileName;

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

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const source = Number(route.params.source) || tryResolveUrlFromApiRoot(decodeURIComponent(route.params.source));

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
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute(
                reportID,
                attachment.attachmentID,
                type,
                String(attachment.source),
                Number(accountID),
                attachment?.isAuthTokenRequired,
                attachment?.file?.name,
                attachment?.attachmentLink,
                hashKey,
            );
            Navigation.navigate(routeToNavigate);
        },
        [reportID, type, accountID, hashKey],
    );

    return (
        <AttachmentModal
            accountID={Number(accountID)}
            type={type}
            allowDownload
            defaultOpen
            report={report}
            attachmentID={attachmentID}
            isLoading={isLoading}
            source={source}
            onModalClose={() => {
                Navigation.dismissModal();
                // This enables Composer refocus when the attachments modal is closed by the browser navigation
                ComposerFocusManager.setReadyToFocus();
            }}
            onCarouselAttachmentChange={onCarouselAttachmentChange}
            shouldShowNotFoundPage={!isLoading && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID}
            isAuthTokenRequired={!!isAuthTokenRequired}
            attachmentLink={attachmentLink ?? ''}
            originalFileName={fileName ?? ''}
        />
    );
}

ReportAttachments.displayName = 'ReportAttachments';

export default ReportAttachments;
