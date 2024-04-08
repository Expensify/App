import React, {memo} from 'react';
import PDFView from '@components/PDFView';
import type AttachmentViewPdfProps from './types';

function AttachmentViewPdf({file, encryptedSourceUrl, isFocused, onPress, onToggleKeyboard, onLoadComplete, errorLabelStyles, style}: AttachmentViewPdfProps) {
    return (
        <PDFView
            // @ts-expect-error waiting for https://github.com/Expensify/App/issues/16186 merge
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file?.name}
            style={style}
            onToggleKeyboard={onToggleKeyboard}
            onLoadComplete={onLoadComplete}
            errorLabelStyles={errorLabelStyles}
        />
    );
}

export default memo(AttachmentViewPdf);
