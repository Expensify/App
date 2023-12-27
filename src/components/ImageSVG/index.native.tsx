import {Image} from 'expo-image';
import React from 'react';
import {ImageSourcePropType} from 'react-native';
import ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, contentFit = 'cover', style}: ImageSVGProps) {
    const tintColorProp = fill ? {tintColor: fill} : {};

    return (
        <Image
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
