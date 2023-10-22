import React, {memo} from 'react';
import {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps} from './propTypes';
import PDFView from '../../../PDFView';

function AttachmentViewPdf({file, encryptedSourceUrl, isFocused, onPress, onScaleChanged, onToggleKeyboard, onLoadComplete, errorLabelStyles, style}) {
    return (
        <PDFView
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file.name}
            style={style}
            onToggleKeyboard={onToggleKeyboard}
            onScaleChanged={onScaleChanged}
            onLoadComplete={onLoadComplete}
            errorLabelStyles={errorLabelStyles}
        />
    );
}

AttachmentViewPdf.propTypes = attachmentViewPdfPropTypes;
AttachmentViewPdf.defaultProps = attachmentViewPdfDefaultProps;

export default memo(AttachmentViewPdf);
