import React, {memo, useCallback, useEffect} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useAttachmentCarouselPagerActions, useAttachmentCarouselPagerState} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
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
    const state = useAttachmentCarouselPagerState();
    const actions = useAttachmentCarouselPagerActions();
    const isScrollEnabled = state === null ? undefined : state.isScrollEnabled;

    useEffect(() => {
        if (!actions) {
            return;
        }
        actions.onScaleChanged?.(1);
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
            if (state?.pagerRef && actions) {
                actions.onScaleChanged?.(newScale);
            }
        },
        [state?.pagerRef, actions, onScaleChangedProp],
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

            if (state !== null && actions && isScrollEnabled?.get()) {
                actions.onTap?.();
            }
        },
        [state, actions, isScrollEnabled, onPressProp],
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

export default memo(BaseAttachmentViewPdf);
