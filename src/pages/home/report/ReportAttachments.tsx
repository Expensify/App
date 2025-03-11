import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import type {Attachment} from '@components/Attachments/types';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportAttachmentsProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>;

function ReportAttachments({route}: ReportAttachmentsProps) {
    const reportID = route.params.reportID;
    const attachmentID = route.params.attachmentID;
    const type = route.params.type;
    const accountID = route.params.accountID;
    const isAuthTokenRequired = route.params.isAuthTokenRequired;
    const attachmentLink = route.params.attachmentLink;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || undefined}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const fileName = route.params?.fileName;

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const source = Number(route.params.source) || route.params.source;

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
            attachmentID={attachmentID}
            source={source}
            onModalClose={() => {
                Navigation.dismissModal();
                // This enables Composer refocus when the attachments modal is closed by the browser navigation
                ComposerFocusManager.setReadyToFocus();
            }}
            onCarouselAttachmentChange={onCarouselAttachmentChange}
            shouldShowNotFoundPage={!isLoadingApp && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID}
            isAuthTokenRequired={!!isAuthTokenRequired}
            attachmentLink={attachmentLink ?? ''}
            originalFileName={fileName ?? ''}
        />
    );
}

ReportAttachments.displayName = 'ReportAttachments';

export default ReportAttachments;
