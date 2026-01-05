import {Image} from 'expo-image';
import React, {useEffect} from 'react';
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
                // eslint-disable-next-line react/jsx-props-no-spreading
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
            onLoadEnd={onLoadEnd}
            contentFit={contentFit}
            source={src}
            style={[{width, height}, style]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...tintColorProp}
            // Temporary solution only, since other cache policies are causing memory leaks on iOS
            cachePolicy="none"
        />
    );
}

export default ImageSVG;
