import React, {useContext, useMemo} from 'react';
import ReportAttachmentsContext from '@pages/home/report/ReportAttachmentsContext';
import CONST from '@src/CONST';
import ProfileAvatarModalContent from './AttachmentModalContent/ProfileAvatarModalContent';
import ReportAttachmentModalContent from './AttachmentModalContent/ReportAttachmentModalContent';
import ReportAvatarModalContent from './AttachmentModalContent/ReportAvatarModalContent';
import WorkspaceAvatarModalContent from './AttachmentModalContent/WorkspaceAvatarModalContent';
import AttachmentModalWrapper from './AttachmentModalWrapper';
import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from './types';

function AttachmentModalScreen({route, navigation}: AttachmentModalScreenProps) {
    const attachmentId = route.params.attachmentId;
    const attachmentsContext = useContext(ReportAttachmentsContext);
    const params: AttachmentModalScreenParams = useMemo(() => {
        if (attachmentId) {
            return {...route.params, ...attachmentsContext.getAttachmentById(attachmentId)};
        }
        return route.params;
    }, [attachmentId, attachmentsContext, route.params]);

    if (route.name === CONST.ATTACHMENT_MODAL_TYPE.REPORT_ATTACHMENT) {
        return (
            <ReportAttachmentModalContent params={params}>
                {({contentProps, wrapperProps: modalProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={modalProps}
                    />
                )}
            </ReportAttachmentModalContent>
        );
    }

    if (route.name === CONST.ATTACHMENT_MODAL_TYPE.PROFILE_AVATAR) {
        return (
            <ProfileAvatarModalContent params={params}>
                {({contentProps, wrapperProps: modalProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={modalProps}
                    />
                )}
            </ProfileAvatarModalContent>
        );
    }

    if (route.name === CONST.ATTACHMENT_MODAL_TYPE.WORKSPACE_AVATAR) {
        return (
            <WorkspaceAvatarModalContent params={params}>
                {({contentProps, wrapperProps: modalProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={modalProps}
                    />
                )}
            </WorkspaceAvatarModalContent>
        );
    }

    if (route.name === CONST.ATTACHMENT_MODAL_TYPE.REPORT_AVATAR) {
        return (
            <ReportAvatarModalContent params={params}>
                {({contentProps, wrapperProps: modalProps}) => (
                    <AttachmentModalWrapper
                        navigation={navigation}
                        attachmentId={attachmentId}
                        contentProps={contentProps}
                        wrapperProps={modalProps}
                    />
                )}
            </ReportAvatarModalContent>
        );
    }

    return null;
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
