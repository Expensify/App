import React from 'react';
import Lightbox from '@components/Lightbox';
import {zoomRangeDefaultProps} from '@components/MultiGestureCanvas/propTypes';
import type {ImageViewProps} from './types';

function ImageView({
    isAuthTokenRequired = false,
    url,
    onScaleChanged,
    onPress,
    style,
    zoomRange = zoomRangeDefaultProps.zoomRange,
    onError,
    isUsedInCarousel = false,
    isSingleCarouselItem = false,
    carouselItemIndex = 0,
    carouselActiveItemIndex = 0,
}: ImageViewProps) {
    const hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;

    return (
        <Lightbox
            source={url}
            zoomRange={zoomRange}
            isAuthTokenRequired={isAuthTokenRequired}
            onScaleChanged={onScaleChanged}
            onPress={onPress}
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
