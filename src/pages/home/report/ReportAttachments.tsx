import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import AttachmentModal from '@components/AttachmentModal';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type File = {
    name: string;
};

type Attachment = {
    file: File;
    hasBeenFlagged: boolean;
    isAuthTokenRequired: boolean;
    isReceipt: boolean;
    reportActionID: string;
    source: string;
};

type ReportAttachmentsProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_ATTACHMENTS>;

function ReportAttachments({route}: ReportAttachmentsProps) {
    const reportID = route.params.reportID;
    const report = ReportUtils.getReport(reportID);

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const decodedSource = decodeURI(route.params.source);
    const source = Number(decodedSource) || decodedSource;

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.REPORT_ATTACHMENTS.getRoute(reportID, attachment.source);
            Navigation.navigate(routeToNavigate);
        },
        [reportID],
    );

    return (
        <AttachmentModal
            // @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript.
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
