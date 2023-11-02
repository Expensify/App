import React from 'react';
import {defaultProps, propTypes} from './imageSVGPropTypes';

function ImageSVG({src, width, height, fill, hovered, pressed, style, pointerEvents, preserveAspectRatio}) {
    const ImageSvgComponent = src;
    const additionalProps = {};

    if (fill) {
        additionalProps.fill = fill;
    }

    if (pointerEvents) {
        additionalProps.pointerEvents = pointerEvents;
    }

    if (preserveAspectRatio) {
        additionalProps.preserveAspectRatio = preserveAspectRatio;
    }

    return (
        <ImageSvgComponent
            width={width}
            height={height}
            hovered={hovered.toString()}
            pressed={pressed.toString()}
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...additionalProps}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
ImageSVG.propTypes = propTypes;
ImageSVG.defaultProps = defaultProps;
export default ImageSVG;
