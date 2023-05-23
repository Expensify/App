import React from 'react';
import {SvgCssUri} from 'react-native-svg';
import propTypes from './propTypes';

const SVGImage = (props) => (
    <SvgCssUri
        width={props.width}
        height={props.height}
        uri={props.src}
    />
);

SVGImage.propTypes = propTypes;
SVGImage.displayName = 'SVGImage';

export default SVGImage;
