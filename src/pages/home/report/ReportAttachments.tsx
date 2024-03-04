import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import type {Attachment} from '@components/AttachmentModal';
import AttachmentModal from '@components/AttachmentModal';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportAttachmentsProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_ATTACHMENTS>;

function ReportAttachments({route}: ReportAttachmentsProps) {
    const reportID = route.params.reportID;
    const report = ReportUtils.getReport(reportID);

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const decodedSource = decodeURI(route.params.source);
    const source = Number(decodedSource) || decodedSource;

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.REPORT_ATTACHMENTS.getRoute(reportID, String(attachment.source));
            Navigation.navigate(routeToNavigate);
        },
        [reportID],
    );

    return (
        <AttachmentModal
            allowDownload
            defaultOpen
            report={report}
            source={source}
            onModalHide={() => {
                Navigation.dismissModal();
                // This enables Composer refocus when the attachments modal is closed by the browser navigation
                ComposerFocusManager.setReadyToFocus();
            }}
            onCarouselAttachmentChange={onCarouselAttachmentChange}
        />
    );
}

ReportAttachments.displayName = 'ReportAttachments';

export default ReportAttachments;
