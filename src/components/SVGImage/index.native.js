
import React from 'react';
import {SvgCssUri} from 'react-native-svg';
import PropTypes from 'prop-types';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.string.isRequired,

    /** The width of the icon. */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** The height of the icon. */
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const SVGImage = ({width, height, src}) => (
    <SvgCssUri
        width={width}
        height={height}
        uri={src}
    />
);

SVGImage.propTypes = propTypes;

export default SVGImage;
