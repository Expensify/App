import React from 'react';
import {Image} from 'react-native';
import {getWidthAndHeightStyle} from '../../styles/styles';
import propTypes from './propTypes';

const SVGImage = ({width, height, src}) => (
    <Image
        style={getWidthAndHeightStyle(width, height)}
        source={src}
    />
);

SVGImage.propTypes = propTypes;
SVGImage.displayName = 'SVGImage';

export default SVGImage;
