import React from 'react';
import PropTypes from 'prop-types';
import PinSvg from '../../../assets/images/pin.svg';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

const propTypes = {
    // State of the icon (enabled or not)
    isEnabled: PropTypes.bool.isRequired,

    // Height of the icon
    height: PropTypes.number,

    // Width of the icon
    width: PropTypes.number,
};

const defaultProps = {
    height: variables.iconSizeNormal,
    width: variables.iconSizeNormal,
};

const PinIcon = props => (
    <PinSvg
        height={props.height}
        width={props.width}
        fill={props.isEnabled ? themeColors.heading : themeColors.icon}
    />
);

PinIcon.propTypes = propTypes;
PinIcon.defaultProps = defaultProps;

export default PinIcon;
