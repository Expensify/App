import React, {useContext, useMemo} from 'react';
import SCREENS from '@src/SCREENS';
import ProfileAvatarModalContent from './AttachmentModalContent/ProfileAvatarModalContent';
import ReportAttachmentModalContent from './AttachmentModalContent/ReportAttachmentModalContent';
import ReportAvatarModalContent from './AttachmentModalContent/ReportAvatarModalContent';
import TransactionReceiptModalContent from './AttachmentModalContent/TransactionReceiptModalContent';
import WorkspaceAvatarModalContent from './AttachmentModalContent/WorkspaceAvatarModalContent';
import AttachmentModalContext from './AttachmentModalContext';
import AttachmentModalWrapper from './AttachmentModalWrapper';
import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from './types';

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
            <ReportAttachmentModalContent params={params}>
                {({contentProps, wrapperProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={wrapperProps}
                    />
                )}
            </ReportAttachmentModalContent>
        );
    }

    if (route.name === SCREENS.TRANSACTION_RECEIPT) {
        return (
            <TransactionReceiptModalContent params={params}>
                {({contentProps, wrapperProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={wrapperProps}
                    />
                )}
            </TransactionReceiptModalContent>
        );
    }

    if (route.name === SCREENS.PROFILE_AVATAR) {
        return (
            <ProfileAvatarModalContent params={params}>
                {({contentProps, wrapperProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={wrapperProps}
                    />
                )}
            </ProfileAvatarModalContent>
        );
    }

    if (route.name === SCREENS.WORKSPACE_AVATAR) {
        return (
            <WorkspaceAvatarModalContent params={params}>
                {({contentProps, wrapperProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={wrapperProps}
                    />
                )}
            </WorkspaceAvatarModalContent>
        );
    }

    if (route.name === SCREENS.REPORT_AVATAR) {
        return (
            <ReportAvatarModalContent params={params}>
                {({contentProps, wrapperProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={wrapperProps}
                    />
                )}
            </ReportAvatarModalContent>
        );
    }

    return null;
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
