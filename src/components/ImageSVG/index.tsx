import React from 'react';
import type {SvgProps} from 'react-native-svg';
import type ImageSVGProps from './types';

function ImageSVG({src, width = '100%', height = '100%', fill, hovered = false, pressed = false, style, pointerEvents, preserveAspectRatio}: ImageSVGProps) {
    const ImageSvgComponent = src as React.FC<SvgProps>;
    const additionalProps: Pick<ImageSVGProps, 'fill' | 'pointerEvents' | 'preserveAspectRatio'> = {};

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
            style={style}
            hovered={`${hovered}`}
            pressed={`${pressed}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...additionalProps}
        />
    );
}

ImageSVG.displayName = 'ImageSVG';
export default ImageSVG;
