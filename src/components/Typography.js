import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import fontFamily from '../style/fontFamily';

const propTypes = {
    // The color of the text
    color: PropTypes.string,

    // The size of the text
    fontSize: PropTypes.number,

    // The alignment of the text
    textAlign: PropTypes.any,

    // Any children to display
    children: PropTypes.node,

    // The family of the font to use
    family: PropTypes.string,

    // Any additional styles to apply
    style: PropTypes.any,
};
const defaultProps = {
    color: '#ffffff',
    fontSize: 13,
    family: 'Fabriga',
    textAlign: null,
    children: null,
    style: null,
};

const Typography = ({
    color,
    fontSize,
    textAlign,
    children,
    family,
    style,
    ...props
}) => {
    const componentStyle = {
        color,
        fontSize,
        lineHeight: fontSize + 4,
        textAlign,
        ...fontFamily[family],
        ...style,
    };

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Text style={componentStyle} {...props}>{children}</Text>
    );
};

Typography.defaultProps = propTypes;

Typography.propTypes = defaultProps;

export default Typography;
