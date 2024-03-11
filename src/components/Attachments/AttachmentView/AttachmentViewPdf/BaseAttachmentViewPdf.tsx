import React, {memo, useCallback, useContext, useEffect} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentFile} from '@components/Attachments/types';
import PDFView from '@components/PDFView';

type BaseAttachmentViewPdfProps = {
    encryptedSourceUrl: string;
    onToggleKeyboard?: (shouldFadeOut: boolean) => void;
    onLoadComplete: (path: string) => void;

    /** Whether this AttachmentView is shown as part of a AttachmentCarousel */
    isUsedInCarousel?: boolean;

    file?: AttachmentFile;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<ViewStyle>;

    /** Whether this view is the active screen  */
    isFocused?: boolean;

    onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;

    /** Triggered when the PDF's onScaleChanged event is triggered */
    onScaleChanged: (scale: number) => void;
};

function BaseAttachmentViewPdf({
    file,
    encryptedSourceUrl,
    isFocused,
    isUsedInCarousel,
    onPress: onPressProp,
    onScaleChanged: onScaleChangedProp,
    onToggleKeyboard,
    onLoadComplete,
    errorLabelStyles,
    style,
}: BaseAttachmentViewPdfProps) {
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const isScrollEnabled = attachmentCarouselPagerContext === null ? undefined : attachmentCarouselPagerContext.isScrollEnabled;

    useEffect(() => {
        if (!attachmentCarouselPagerContext) {
            return;
        }
        attachmentCarouselPagerContext.onScaleChanged(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
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
            if (isUsedInCarousel && attachmentCarouselPagerContext) {
                attachmentCarouselPagerContext.onScaleChanged(newScale);
            }
        },
        [attachmentCarouselPagerContext, isUsedInCarousel, onScaleChangedProp],
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
            // @ts-expect-error waiting for https://github.com/Expensify/App/issues/16186 merge
            onPress={onPress}
            isFocused={isFocused}
            sourceURL={encryptedSourceUrl}
            fileName={file?.name}
            style={style}
            onToggleKeyboard={onToggleKeyboard}
            onScaleChanged={onScaleChanged}
            onLoadComplete={onLoadComplete}
            errorLabelStyles={errorLabelStyles}
        />
    );
}

BaseAttachmentViewPdf.displayName = 'BaseAttachmentViewPdf';

export default memo(BaseAttachmentViewPdf);
export type {BaseAttachmentViewPdfProps};
