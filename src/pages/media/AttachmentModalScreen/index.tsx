import React, {useContext, useMemo} from 'react';
import SCREENS from '@src/SCREENS';
import AttachmentModalContext from './AttachmentModalContext';
import ProfileAvatarModalContent from './routes/ProfileAvatarModalContent';
import ReportAttachmentModalContent from './routes/ReportAttachmentModalContent';
import ReportAvatarModalContent from './routes/ReportAvatarModalContent';
import TransactionReceiptModalContent from './routes/TransactionReceiptModalContent';
import WorkspaceAvatarModalContent from './routes/WorkspaceAvatarModalContent';
import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from './types';

/**
 * The attachment modal screen can take various different shapes. This is the main screen component that receives the route and
 * navigation props from the parent screen and renders the correct modal content based on the route.
 */
function AttachmentModalScreen({route, navigation}: AttachmentModalScreenProps) {
    const attachmentId = route.params.attachmentId;
    const attachmentsContext = useContext(AttachmentModalContext);
    const params: AttachmentModalScreenParams = useMemo(() => {
        if (attachmentId) {
            return {...route.params, ...attachmentsContext.getAttachmentById(attachmentId)};
        }
        return route.params;
    }, [attachmentId, attachmentsContext, route.params]);

    if (route.name === SCREENS.ATTACHMENTS) {
        return (
            <ReportAttachmentModalContent
                params={params}
                navigation={navigation}
                attachmentId={attachmentId}
            />
        );
    }

    if (route.name === SCREENS.TRANSACTION_RECEIPT) {
        return (
            <TransactionReceiptModalContent
                params={params}
                navigation={navigation}
                attachmentId={attachmentId}
            />
        );
    }

    if (route.name === SCREENS.PROFILE_AVATAR) {
        return (
            <ProfileAvatarModalContent
                params={params}
                navigation={navigation}
                attachmentId={attachmentId}
            />
        );
    }

    if (route.name === SCREENS.WORKSPACE_AVATAR) {
        return (
            <WorkspaceAvatarModalContent
                params={params}
                navigation={navigation}
                attachmentId={attachmentId}
            />
        );
    }

    if (route.name === SCREENS.REPORT_AVATAR) {
        return (
            <ReportAvatarModalContent
                params={params}
                navigation={navigation}
                attachmentId={attachmentId}
            />
        );
    }

    return null;
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
