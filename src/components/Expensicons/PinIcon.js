import React from 'react';
import PropTypes from 'prop-types';
import PinSvg from '../../../assets/images/pin.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    isEnabled: PropTypes.bool.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
};

const defaultProps = {
    height: 20,
    width: 20,
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
