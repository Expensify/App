import React from 'react';
import {propTypes, defaultProps} from './imageSVGPropTypes';

function ImageSVG({src, width, height, fill, hovered, pressed, style}) {
    const ImageSvgComponent = src;
    const fillProp = fill ? {fill} : {};

    return (
        <ImageSvgComponent
            width={width}
            height={height}
            hovered={hovered.toString()}
            pressed={pressed.toString()}
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...fillProp}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
ImageSVG.propTypes = propTypes;
ImageSVG.defaultProps = defaultProps;
export default ImageSVG;
