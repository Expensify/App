import React, {memo} from 'react';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';
import AttachmentViewPdfProps from './types';

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    const {file = {name: ''} as File, ...restProps} = props;
    return (
        <BaseAttachmentViewPdf
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            file={file}
        />
    );
}

export default memo(AttachmentViewPdf);
