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
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';

type ReportAttachmentsProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_ATTACHMENTS>;

function CommonAttachments({route}: ReportAttachmentsProps) {
    const source = Number(route.params.source) || route.params.source;
    const imageSource = tryResolveUrlFromApiRoot(source);
    return (
        <AttachmentModal
            allowDownload
            defaultOpen
            source={source}
            onModalClose={() => {
                Navigation.goBack();
            }}
            originalFileName='test-image.jpg'
            onModalHide={() => {
                Navigation.dismissModal();
                // This enables Composer refocus when the attachments modal is closed by the browser navigation
                ComposerFocusManager.setReadyToFocus();
            }}

        />
    );
}

CommonAttachments.displayName = 'CommonAttachments';

export default CommonAttachments;
