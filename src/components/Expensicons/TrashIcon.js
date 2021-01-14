import React, {memo} from 'react';
import PropTypes from 'prop-types';
import TrashSvg from '../../../assets/images/trashcan.svg';
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

const TrashIcon = props => (
    <TrashSvg
        height={props.height}
        width={props.width}
        fill={props.isEnabled ? themeColors.heading : themeColors.icon}
    />
);

TrashIcon.propTypes = propTypes;
TrashIcon.defaultProps = defaultProps;

export default memo(TrashIcon);
