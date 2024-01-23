import React, {memo, useCallback, useContext, useEffect} from 'react';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import PDFView from '@components/PDFView';
import {attachmentViewPdfDefaultProps, attachmentViewPdfPropTypes} from './propTypes';

function BaseAttachmentViewPdf({file, encryptedSourceUrl, isFocused, isUsedInCarousel, onPress: onPressProp, onToggleKeyboard, onLoadComplete, errorLabelStyles, style}) {
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const isScrollEnabled = attachmentCarouselPagerContext === null ? undefined : attachmentCarouselPagerContext.isScrollEnabled;

    useEffect(() => {
        if (!attachmentCarouselPagerContext) {
            return;
        }
        attachmentCarouselPagerContext.onScaleChanged(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
    }, []);

    const onScaleChanged = useCallback(
        (newScale) => {
            // When a pdf is shown in a carousel, we want to disable the pager scroll when the pdf is zoomed in
            if (!isUsedInCarousel || !attachmentCarouselPagerContext) {
                return;
            }
            attachmentCarouselPagerContext.onScaleChanged(newScale);
        },
        [attachmentCarouselPagerContext, isUsedInCarousel],
    );

    const onPress = useCallback(
        (e) => {
            if (onPressProp !== undefined) {
                onPressProp(e);
            }

            if (attachmentCarouselPagerContext !== null && isScrollEnabled.value) {
                attachmentCarouselPagerContext.onTap(e);
            }
        },
        [attachmentCarouselPagerContext, isScrollEnabled, onPressProp],
    );

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

BaseAttachmentViewPdf.propTypes = attachmentViewPdfPropTypes;
BaseAttachmentViewPdf.defaultProps = attachmentViewPdfDefaultProps;
BaseAttachmentViewPdf.displayName = 'BaseAttachmentViewPdf';

export default memo(BaseAttachmentViewPdf);
