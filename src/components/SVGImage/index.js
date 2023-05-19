import React from 'react';
import {Image} from 'react-native';
import * as StyleUtils from '../../styles/StyleUtils';
import propTypes from './propTypes';

const SVGImage = (props) => (
    <Image
        style={StyleUtils.getWidthAndHeightStyle(props.width, props.height)}
        source={props.src}
        resizeMode={props.resizeMode}
    />
);

SVGImage.propTypes = propTypes;
SVGImage.displayName = 'SVGImage';

export default SVGImage;
