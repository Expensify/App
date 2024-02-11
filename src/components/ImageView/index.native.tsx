import React from 'react';
import Lightbox from '@components/Lightbox';
import {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type {ImageViewProps} from './types';

function ImageView({
    isAuthTokenRequired = false,
    url,
    style,
    zoomRange = DEFAULT_ZOOM_RANGE,
    onError,
    isUsedInCarousel = false,
    isSingleCarouselItem = false,
    carouselItemIndex = 0,
    carouselActiveItemIndex = 0,
}: ImageViewProps) {
    const hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;

    return (
        <Lightbox
            uri={url}
            zoomRange={zoomRange}
            isAuthTokenRequired={isAuthTokenRequired}
            onError={onError}
            index={carouselItemIndex}
            activeIndex={carouselActiveItemIndex}
            hasSiblingCarouselItems={hasSiblingCarouselItems}
            style={style}
        />
    );
}

ImageView.displayName = 'ImageView';

export default ImageView;
