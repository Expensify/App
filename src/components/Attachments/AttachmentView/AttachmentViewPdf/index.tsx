import React, {memo} from 'react';
import PDFView from '@components/PDFView';
import type AttachmentViewPdfProps from './types';

function AttachmentViewPdf({file, encryptedSourceUrl, isFocused, onPress, onToggleKeyboard, onLoadComplete, style, isUsedAsChatAttachment, onLoadError}: AttachmentViewPdfProps) {
    return (
        <PDFView
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file?.name}
            style={style}
            onToggleKeyboard={onToggleKeyboard}
            onLoadComplete={onLoadComplete}
            isUsedAsChatAttachment={isUsedAsChatAttachment}
            onLoadError={onLoadError}
        />
    );
}

export default memo(AttachmentViewPdf);
