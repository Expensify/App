import {Image} from 'expo-image';
import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import CONST from '@src/CONST';
import type ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, contentFit = 'cover', style, onLoadEnd}: ImageSVGProps) {
    const tintColorProp = fill ? {tintColor: fill} : {};

    return (
        <Image
            onLoadEnd={onLoadEnd}
            cachePolicy="memory-disk"
            contentFit={contentFit}
            source={src as ImageSourcePropType}
            style={[{width, height}, style]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...tintColorProp}
            transition={CONST.IMAGE_SVG_TRANSITION_DURATION}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
export default ImageSVG;
