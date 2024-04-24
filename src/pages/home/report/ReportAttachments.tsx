import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import AttachmentModal from '@components/AttachmentModal';
import type {Attachment} from '@components/Attachments/types';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportAttachmentsProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>;

function ReportAttachments({route}: ReportAttachmentsProps) {
    const reportID = route.params.id;
    const report = ReportUtils.getReport(reportID);

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const source = Number(route.params.source) || route.params.source;

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute(reportID, CONST.ATTACHMENT_TYPE.REPORT, String(attachment.source));
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
