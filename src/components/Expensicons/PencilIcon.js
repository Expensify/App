import React, {memo} from 'react';
import PropTypes from 'prop-types';
import PencilSvg from '../../../assets/images/pencil.svg';
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

const PencilIcon = props => (
    <PencilSvg
        height={props.height}
        width={props.width}
        fill={props.isEnabled ? themeColors.heading : themeColors.icon}
    />
);

PencilIcon.propTypes = propTypes;
PencilIcon.defaultProps = defaultProps;

export default memo(PencilIcon);
