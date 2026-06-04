import {Image} from 'expo-image';
import type {ImageProps as ExpoImageProps} from 'expo-image';
import React, {useEffect} from 'react';
import getImageRecyclingKey from '@libs/getImageRecyclingKey';
import type ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, contentFit = 'cover', style, onLoadEnd}: ImageSVGProps) {
    const tintColorProp = fill ? {tintColor: fill} : {};
    const isReactComponent = typeof src === 'function';

    useEffect(() => {
        if (!isReactComponent) {
            return;
        }
        onLoadEnd?.();
    }, [isReactComponent, onLoadEnd]);
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

    if (!src) {
        return null;
    }

    // Handle static image sources (traditional approach)
    return (
        <Image
            accessibilityIgnoresInvertColors
            onLoadEnd={onLoadEnd}
            cachePolicy="memory-disk"
            contentFit={contentFit}
            source={src}
            recyclingKey={getImageRecyclingKey(src)}
            style={[{width, height}, style as ExpoImageProps['style']]}
            {...tintColorProp}
        />
    );
}

export default ImageSVG;
