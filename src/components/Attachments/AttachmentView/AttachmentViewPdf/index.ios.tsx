import React, {memo} from 'react';
import type {AttachmentViewPdfProps} from './BaseAttachmentViewPdf';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    return (
        <BaseAttachmentViewPdf
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default memo(AttachmentViewPdf);
