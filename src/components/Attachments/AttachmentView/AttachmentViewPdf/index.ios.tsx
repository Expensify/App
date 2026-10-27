import React from 'react';

import type AttachmentViewPdfProps from './types';

import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    return <BaseAttachmentViewPdf {...props} />;
}

export default AttachmentViewPdf;
