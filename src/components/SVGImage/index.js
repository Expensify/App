import React from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import {getWidthAndHeightStyle} from '../../styles/styles';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.string.isRequired,

    /** The width of the icon. */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** The height of the icon. */
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const SVGImage = ({width, height, src}) => (
    <Image
        style={getWidthAndHeightStyle(width, height)}
        source={src}
    />
);

SVGImage.propTypes = propTypes;

export default SVGImage;
