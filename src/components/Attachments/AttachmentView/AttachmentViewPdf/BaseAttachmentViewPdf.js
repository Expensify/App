import PropTypes from 'prop-types';
import React, {memo, useCallback, useContext, useEffect} from 'react';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import PDFView from '@components/PDFView';
import {attachmentViewPdfDefaultProps, attachmentViewPdfPropTypes} from './propTypes';

const propTypes = {
    /** Updates the scale value of the pdf */
    updateScale: PropTypes.func,

    ...attachmentViewPdfPropTypes,
};

const defaultProps = {
    updateScale: () => {},
    ...attachmentViewPdfDefaultProps,
};

function BaseAttachmentViewPdf({
    file,
    encryptedSourceUrl,
    isFocused,
    isUsedInCarousel,
    onPress,
    onScaleChanged: onScaleChangedProp,
    onToggleKeyboard,
    onLoadComplete,
    errorLabelStyles,
    style,
    updateScale,
}) {
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);

    useEffect(() => {
        if (!attachmentCarouselPagerContext) {
            return;
        }
        attachmentCarouselPagerContext.onPinchGestureChange(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
    }, []);

    const onScaleChanged = useCallback(
        (scale) => {
            updateScale(scale);
            onScaleChangedProp();

            // When a pdf is shown in a carousel, we want to disable the pager scroll when the pdf is zoomed in
            if (isUsedInCarousel) {
                const shouldPagerScroll = scale === 1;

                attachmentCarouselPagerContext.onPinchGestureChange(!shouldPagerScroll);

                if (attachmentCarouselPagerContext.shouldPagerScroll.value === shouldPagerScroll) {
                    return;
                }

                attachmentCarouselPagerContext.shouldPagerScroll.value = shouldPagerScroll;
            }
        },
        [attachmentCarouselPagerContext, isUsedInCarousel, onScaleChangedProp, updateScale],
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

BaseAttachmentViewPdf.propTypes = propTypes;
BaseAttachmentViewPdf.defaultProps = defaultProps;
BaseAttachmentViewPdf.displayName = 'BaseAttachmentViewPdf';

export default memo(BaseAttachmentViewPdf);
