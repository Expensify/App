
import React from 'react';
import {SvgCssUri} from 'react-native-svg';
import propTypes from './propTypes';

const SVGImage = ({width, height, src}) => (
    <SvgCssUri
        width={width}
        height={height}
        uri={src}
    />
);

SVGImage.propTypes = propTypes;
SVGImage.displayName = 'SVGImage';

export default SVGImage;
