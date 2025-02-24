import React, {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import {openReport} from '@libs/actions/Report';
import getAttachmentSource from '@libs/AttachmentUtils';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {isReportNotFound} from '@libs/ReportUtils';
import shouldFetchReport from '@libs/shouldFetchReport';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ReportAttachmentsProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>;

function ReportAttachments({route}: ReportAttachmentsProps) {
    const reportID = route.params.reportID;
    const type = route.params.type;
    const accountID = route.params.accountID;
    const isAuthTokenRequired = route.params.isAuthTokenRequired;
    const attachmentLink = route.params.attachmentLink;
    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || CONST.DEFAULT_NUMBER_ID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID || CONST.DEFAULT_NUMBER_ID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID || CONST.DEFAULT_NUMBER_ID}`, {canEvict: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const {isOffline} = useNetwork();
    const isLoadingReportOnyx = isLoadingOnyxValue(reportResult);
    const fileName = route.params?.fileName;

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        const isEmptyReportActions = isEmptyObject(reportActions);
        return !!isLoadingApp || isEmptyReport || isEmptyReportActions;
    }, [isOffline, reportID, isLoadingApp, report, reportActions]);

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const source = Number(route.params.source) || route.params.source;
    const attachmentSource = useMemo(() => getAttachmentSource(source), [source]);

    const fetchReport = useCallback(() => {
        openReport(reportID);
    }, [reportID]);

    const fetchReportIfNeeded = useCallback(() => {
        if (isLoadingApp !== false) {
            return;
        }
        if (!shouldFetchReport(report, reportMetadata?.isOptimisticReport)) {
            return;
        }
        if (!isLoadingReportOnyx && !isEmptyObject(report)) {
            return;
        }

        fetchReport();
    }, [reportMetadata, report, isLoadingReportOnyx, isLoadingApp, fetchReport]);

    useEffect(() => {
        if (!reportID || isLoadingReportOnyx) {
            return;
        }

        fetchReportIfNeeded();
    }, [reportID, isLoadingReportOnyx, fetchReportIfNeeded]);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute(
                reportID,
                type,
                String(attachment.source),
                Number(accountID),
                attachment?.isAuthTokenRequired,
                attachment?.file?.name,
                attachment?.attachmentLink,
            );
            Navigation.navigate(routeToNavigate);
        },
        [reportID, type, accountID],
    );

    return (
        <AttachmentModal
            accountID={Number(accountID)}
            type={type}
            allowDownload
            defaultOpen
            report={report}
            isLoading={isLoading}
            source={attachmentSource}
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
