import {Image} from 'expo-image';
import React, {useEffect} from 'react';
import type {ImageSourcePropType} from 'react-native';
import type ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, contentFit = 'cover', style}: ImageSVGProps) {
    const tintColorProp = fill ? {tintColor: fill} : {};

    // Clear memory cache when unmounting images to avoid memory overload
    useEffect(() => {
        const clearMemoryCache = () => Image.clearMemoryCache();
        return () => {
            clearMemoryCache();
        };
    }, []);

    return (
        <Image
            // Caching images to memory since some SVGs are being displayed with delay
            // See issue: https://github.com/Expensify/App/issues/34881
            cachePolicy="memory"
            contentFit={contentFit}
            source={src as ImageSourcePropType}
            style={[{width, height}, style]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...tintColorProp}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
export default ImageSVG;
