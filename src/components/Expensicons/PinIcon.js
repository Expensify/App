import React, {memo} from 'react';
import PropTypes from 'prop-types';
import PinSvg from '../../../assets/images/pin.svg';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

const propTypes = {
    isEnabled: PropTypes.bool.isRequired,
    height: PropTypes.number,
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

export default memo(PinIcon);
