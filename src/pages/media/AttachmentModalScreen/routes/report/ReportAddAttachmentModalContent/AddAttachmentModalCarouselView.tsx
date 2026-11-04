import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';

import type {AttachmentContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';

import type {FileObject} from '@src/types/utils/Attachment';

import React, {useEffect, useState} from 'react';

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
    let attachments: Attachment[];
    if (Array.isArray(files)) {
        attachments = files?.map((file, index) => convertFileToAttachment(file, index)) ?? [];
    } else if (!files) {
        attachments = [];
    } else {
        attachments = [convertFileToAttachment(files, 0)];
    }
    let currentAttachment;
    if (!fileToDisplay) {
        currentAttachment = convertFileToAttachment(undefined, 0);
    } else {
        const idx = Array.isArray(files) ? files.indexOf(fileToDisplay) : 0;
        currentAttachment = convertFileToAttachment(fileToDisplay, idx >= 0 ? idx : 0);
    }

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
