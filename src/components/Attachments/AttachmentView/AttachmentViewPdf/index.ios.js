import React, {memo} from 'react';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';
import {attachmentViewPdfDefaultProps, attachmentViewPdfPropTypes} from './propTypes';

function AttachmentViewPdf(props) {
    return (
        <BaseAttachmentViewPdf
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

AttachmentViewPdf.propTypes = attachmentViewPdfPropTypes;
AttachmentViewPdf.defaultProps = attachmentViewPdfDefaultProps;

export default memo(AttachmentViewPdf);
