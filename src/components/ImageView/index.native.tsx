import React from 'react';
import Lightbox from '@components/Lightbox';
import {zoomRangeDefaultProps} from '@components/MultiGestureCanvas/propTypes';
import type * as ImageViewTypes from './types';

function ImageView({
    isAuthTokenRequired,
    url,
    onScaleChanged,
    onPress = () => {},
    style = {},
    zoomRange = zoomRangeDefaultProps.zoomRange,
    onError,
    isUsedInCarousel,
    isSingleCarouselItem,
    carouselItemIndex,
    carouselActiveItemIndex,
}: ImageViewTypes.ImageViewProps) {
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
