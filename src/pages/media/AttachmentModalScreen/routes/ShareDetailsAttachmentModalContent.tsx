import React, {useMemo} from 'react';
import {getValidatedImageSource} from '@libs/AvatarUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';
import useReportAttachmentModalType from './hooks/useReportAttachmentModalType';

function ShareDetailsAttachmentModalContent({route, navigation}: AttachmentModalScreenProps<typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT>) {
    const {source: sourceParam, originalFileName, headerTitle, onShow, onClose} = route.params;

    const source = useMemo(() => getValidatedImageSource(sourceParam), [sourceParam]);

    const onDownloadAttachment = useDownloadAttachment({});

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source: sourceParam,
            originalFileName: originalFileName ?? '',
            headerTitle,
            onDownloadAttachment,
        }),
        [headerTitle, onDownloadAttachment, originalFileName, sourceParam],
    );

    const modalType = useReportAttachmentModalType(source);
    return (
        <AttachmentModalContainer<typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT>
            navigation={navigation}
            contentProps={contentProps}
            modalType={modalType}
            onShow={onShow}
            onClose={onClose}
        />
    );
}
ShareDetailsAttachmentModalContent.displayName = 'ReportAttachmentModalContent';

export default ShareDetailsAttachmentModalContent;
