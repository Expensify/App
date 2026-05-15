import React, {memo} from 'react';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';
import type AttachmentViewPdfProps from './types';

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    return <BaseAttachmentViewPdf {...props} />;
}

export default memo(AttachmentViewPdf);
