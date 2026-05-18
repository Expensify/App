import React, {useMemo} from 'react';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';
import useReportAttachmentModalType from './hooks/useReportAttachmentModalType';

function ShareDetailsAttachmentModalContent({route, navigation}: AttachmentModalScreenProps<typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT>) {
    const {source: sourceParam, originalFileName: originalFileNameParam, headerTitle, onShow, onClose} = route.params;

    const source = useMemo(() => Number(sourceParam) || (typeof sourceParam === 'string' ? tryResolveUrlFromApiRoot(decodeURIComponent(sourceParam)) : undefined), [sourceParam]);
    const originalFileName = originalFileNameParam ?? '';

    const onDownloadAttachment = useDownloadAttachment({});

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source,
            originalFileName,
            headerTitle,
            onDownloadAttachment,
        }),
        [headerTitle, onDownloadAttachment, originalFileName, source],
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

export default ShareDetailsAttachmentModalContent;
