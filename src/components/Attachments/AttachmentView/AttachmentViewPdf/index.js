import React, {memo} from 'react';
import styles from '../../../../styles/styles';
import {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps} from './propTypes';
import PDFView from '../../../PDFView';

function AttachmentViewPdf({file, encryptedSourceUrl, isFocused, onPress, onScaleChanged, onToggleKeyboard, onLoadComplete, errorLabelStyles}) {
    return (
        <PDFView
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file.name}
            style={styles.imageModalPDF}
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
