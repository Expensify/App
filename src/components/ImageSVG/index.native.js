import React from 'react';
import {Image} from 'expo-image';
import {propTypes, defaultProps} from './imageSVGPropTypes';

function ImageSVG({src, width, height, fill, contentFit, style}) {
    const tintColorProp = fill ? {tintColor: fill} : {};

    return (
        <Image
            contentFit={contentFit}
            source={src}
            style={[{width, height}, style]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...tintColorProp}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
ImageSVG.propTypes = propTypes;
ImageSVG.defaultProps = defaultProps;
export default ImageSVG;
