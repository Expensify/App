import React, {memo} from 'react';
import type {BaseAttachmentViewPdfProps} from './BaseAttachmentViewPdf';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';

function AttachmentViewPdf(props: BaseAttachmentViewPdfProps) {
    return (
        <BaseAttachmentViewPdf
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default memo(AttachmentViewPdf);
