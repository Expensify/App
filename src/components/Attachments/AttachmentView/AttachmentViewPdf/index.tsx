import React, {memo} from 'react';
import PDFView from '@components/PDFView';
import AttachmentViewPdfProps from './types';

function AttachmentViewPdf({file = {name: ''}, encryptedSourceUrl, isFocused, onPress, onScaleChanged, onToggleKeyboard, onLoadComplete, errorLabelStyles, style}: AttachmentViewPdfProps) {
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

export default memo(AttachmentViewPdf);
