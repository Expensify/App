import React, {memo, useCallback, useContext} from 'react';
import styles from '../../../../styles/styles';
import {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps} from './propTypes';
import PDFView from '../../../PDFView';
import AttachmentCarouselPagerContext from '../../AttachmentCarousel/Pager/AttachmentCarouselPagerContext';

function AttachmentViewPdf({file, encryptedSourceUrl, isFocused, isUsedInCarousel, onPress, onScaleChanged: onScaleChangedProp, onToggleKeyboard, onLoadComplete}) {
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);

    const onScaleChanged = useCallback(
        (scale) => {
            onScaleChangedProp();

            // When a pdf is shown in a carousel, we want to disable the pager scroll when the pdf is zoomed in
            if (isUsedInCarousel) {
                const shouldPagerScroll = scale === 1;

                if (attachmentCarouselPagerContext.shouldPagerScroll.value === shouldPagerScroll) return;

                attachmentCarouselPagerContext.shouldPagerScroll.value = shouldPagerScroll;
            }
        },
        [attachmentCarouselPagerContext.shouldPagerScroll, isUsedInCarousel, onScaleChangedProp],
    );

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
        />
    );
}

AttachmentViewPdf.propTypes = attachmentViewPdfPropTypes;
AttachmentViewPdf.defaultProps = attachmentViewPdfDefaultProps;

export default memo(AttachmentViewPdf);
