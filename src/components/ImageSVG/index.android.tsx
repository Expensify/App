import {Image} from 'expo-image';
import React, {useEffect} from 'react';
import type ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, contentFit = 'cover', style, onLoadEnd}: ImageSVGProps) {
    const tintColorProp = fill ? {tintColor: fill} : {};
    const isReactComponent = typeof src === 'function';

    // Clear memory cache when unmounting images to avoid memory overload
    useEffect(() => {
        const clearMemoryCache = () => Image.clearMemoryCache();
        return () => {
            clearMemoryCache();
        };
    }, []);

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
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...additionalProps}
            />
        );
    }

    // Handle static image sources (traditional approach)
    return (
        <Image
            onLoadEnd={onLoadEnd}
            // Caching images to memory since some SVGs are being displayed with delay
            // See issue: https://github.com/Expensify/App/issues/34881
            cachePolicy="memory"
            contentFit={contentFit}
            source={src}
            style={[{width, height}, style]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...tintColorProp}
        />
    );
}

export default ImageSVG;
