import React from 'react';
import {propTypes, defaultProps} from './imageSVGPropTypes';

function ImageSVG({src, width, height, fill, hovered, pressed, style, pointerEvents, preserveAspectRatio}) {
    const ImageSvgComponent = src;
    const fillProp = fill ? {fill} : {};

    return (
        <ImageSvgComponent
            width={width}
            height={height}
            hovered={hovered.toString()}
            pressed={pressed.toString()}
            style={style}
            pointerEvents={pointerEvents}
            preserveAspectRatio={preserveAspectRatio}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...fillProp}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
ImageSVG.propTypes = propTypes;
ImageSVG.defaultProps = defaultProps;
export default ImageSVG;
