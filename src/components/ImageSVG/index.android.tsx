import getImageRecyclingKey from '@libs/getImageRecyclingKey';

import type {ImageProps as ExpoImageProps} from 'expo-image';

import {Image} from 'expo-image';
import React, {useEffect} from 'react';

import type ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, contentFit = 'cover', style, onLoadEnd}: ImageSVGProps) {
    const isReactComponent = typeof src === 'function';

    // Call onLoadEnd immediately for React components since they don't have a loading state
    useEffect(() => {
        if (!isReactComponent) {
            return;
        }
        onLoadEnd?.();
    }, [isReactComponent, onLoadEnd]);

    if (!src) {
        return null;
    }

    // Check if src is a React component (from dynamic loading) or a static image source
    if (isReactComponent) {
        // Handle React SVG components (from dynamic loading)
        const ImageSvgComponent = src;
        const additionalProps: Pick<ImageSVGProps, 'fill'> = {};

        if (fill) {
            additionalProps.fill = fill;
        }

        return (
            <ImageSvgComponent
                width={width}
                height={height}
                style={style}
                {...additionalProps}
            />
        );
    }

    // Handle static image sources (traditional approach)
    return (
        <Image
            accessibilityIgnoresInvertColors
            onLoadEnd={onLoadEnd}
            // Caching images to memory since some SVGs are being displayed with delay
            // See issue: https://github.com/Expensify/App/issues/34881
            // Nothing flushes that cache here: Glide already trims it under memory pressure, and a per-icon flush emptied it for the whole app.
            cachePolicy="memory"
            contentFit={contentFit}
            source={src}
            recyclingKey={getImageRecyclingKey(src)}
            style={[{width, height}, style as ExpoImageProps['style']]}
            tintColor={fill}
            // On android, there's an issue where the fill color of the icon does not change,
            // unless the component is remounted. (https://github.com/Expensify/App/pull/76741#issuecomment-4245274687)
            key={fill}
        />
    );
}

export default ImageSVG;
