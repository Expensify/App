import PDFView from '@components/PDFView';

import React, {memo} from 'react';

import type AttachmentViewPdfProps from './types';

function AttachmentViewPdf({
    file,
    encryptedSourceUrl,
    isFocused,
    onPress,
    onScaleChanged,
    onToggleKeyboard,
    onLoadComplete,
    style,
    isUsedInAttachmentModal,
    isUsedAsChatAttachment,
    onLoadError,
    rotation,
}: AttachmentViewPdfProps) {
    return (
        <PDFView
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file?.name}
            style={style}
            onScaleChanged={onScaleChanged}
            onToggleKeyboard={onToggleKeyboard}
            onLoadComplete={onLoadComplete}
            isUsedInAttachmentModal={isUsedInAttachmentModal}
            isUsedAsChatAttachment={isUsedAsChatAttachment}
            onLoadError={onLoadError}
            rotation={rotation}
        />
    );
}

export default memo(AttachmentViewPdf);
