import React, {memo, useCallback, useContext, useEffect} from 'react';
import type {GestureResponderEvent} from 'react-native';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import PDFView from '@components/PDFView';
import type AttachmentViewPdfProps from './types';

function BaseAttachmentViewPdf({
    file,
    encryptedSourceUrl,
    isFocused,
    onPress: onPressProp,
    onScaleChanged: onScaleChangedProp,
    onToggleKeyboard,
    onLoadComplete,
    style,
    isUsedAsChatAttachment,
    onLoadError,
}: AttachmentViewPdfProps) {
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const isScrollEnabled = attachmentCarouselPagerContext === null ? undefined : attachmentCarouselPagerContext.isScrollEnabled;

    useEffect(() => {
        if (!attachmentCarouselPagerContext) {
            return;
        }
        attachmentCarouselPagerContext.onScaleChanged(1);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
    }, []);

    /**
     * When the PDF's onScaleChanged event is triggered, we must call the context's onScaleChanged callback,
     * because we want to disable the pager scroll when the pdf is zoomed in,
     * as well as call the onScaleChanged prop of the AttachmentViewPdf component if defined.
     */
    const onScaleChanged = useCallback(
        (newScale: number) => {
            if (onScaleChangedProp !== undefined) {
                onScaleChangedProp(newScale);
            }

            // When a pdf is shown in a carousel, we want to disable the pager scroll when the pdf is zoomed in
            if (attachmentCarouselPagerContext?.pagerRef) {
                attachmentCarouselPagerContext.onScaleChanged(newScale);
            }
        },
        [attachmentCarouselPagerContext, onScaleChangedProp],
    );

    /**
     * This callback is used to pass-through the onPress event from the AttachmentViewPdf's props
     * as well trigger the onTap event from the context.
     * The onTap event should only be triggered, if the pager is currently scrollable.
     * Otherwise it means that the PDF is currently zoomed in, therefore the onTap callback should be ignored
     */
    const onPress = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (onPressProp !== undefined) {
                onPressProp(event);
            }

            if (attachmentCarouselPagerContext !== null && isScrollEnabled?.value) {
                attachmentCarouselPagerContext.onTap();
            }
        },
        [attachmentCarouselPagerContext, isScrollEnabled, onPressProp],
    );

    return (
        <PDFView
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file?.name}
            style={style}
            onToggleKeyboard={onToggleKeyboard}
            onScaleChanged={onScaleChanged}
            onLoadComplete={onLoadComplete}
            isUsedAsChatAttachment={isUsedAsChatAttachment}
            onLoadError={onLoadError}
        />
    );
}

BaseAttachmentViewPdf.displayName = 'BaseAttachmentViewPdf';

export default memo(BaseAttachmentViewPdf);
