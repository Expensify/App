import React, {useEffect, useMemo, useState} from 'react';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import type {AttachmentContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import type {FileObject} from '@src/types/utils/Attachment';

const convertFileToAttachment = (file: FileObject | undefined, index: number): Attachment => {
    if (!file) {
        return {source: ''};
    }

    return {
        file,
        source: file.uri ?? '',
        attachmentID: file.uri ?? `local-${index}`,
    };
};

function AddAttachmentModalCarouselView({fileToDisplay, files}: AttachmentContentProps) {
    const {setAttachmentError, clearAttachmentErrors} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

    const [page, setPage] = useState<number>(0);
    const attachments = useMemo(() => {
        if (Array.isArray(files)) {
            return files?.map((file, index) => convertFileToAttachment(file, index)) ?? [];
        }

        if (!files) {
            return [];
        }

        return [convertFileToAttachment(files, 0)];
    }, [files]);
    const currentAttachment = useMemo(() => {
        if (!fileToDisplay) {
            return convertFileToAttachment(undefined, 0);
        }
        const idx = Array.isArray(files) ? files.indexOf(fileToDisplay) : 0;
        return convertFileToAttachment(fileToDisplay, idx >= 0 ? idx : 0);
    }, [fileToDisplay, files]);

    useEffect(() => {
        clearAttachmentErrors();
    }, [clearAttachmentErrors]);

    if (attachments.length === 0 || !currentAttachment) {
        return null;
    }

    return (
        <AttachmentCarouselView
            attachments={attachments}
            source={currentAttachment.source}
            page={page}
            setPage={setPage}
            autoHideArrows={autoHideArrows}
            cancelAutoHideArrow={cancelAutoHideArrows}
            setShouldShowArrows={setShouldShowArrows}
            onAttachmentError={setAttachmentError}
            shouldShowArrows={shouldShowArrows}
        />
    );
}

export default AddAttachmentModalCarouselView;
