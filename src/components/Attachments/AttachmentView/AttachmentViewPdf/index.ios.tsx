import React, {memo} from 'react';

import type AttachmentViewPdfProps from './types';

import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    return <BaseAttachmentViewPdf {...props} />;
}

export default memo(AttachmentViewPdf);
