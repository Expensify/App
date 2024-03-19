import React, {memo} from 'react';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';
import type AttachmentViewPdfProps from './types';

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    return (
        <BaseAttachmentViewPdf
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default memo(AttachmentViewPdf);
