import React from 'react';
import PropTypes from 'prop-types';
import TrashSVG from '../../../assets/images/trashcan.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const TrashIcon = props => (
    <TrashSVG
        height={props.height}
        width={props.width}
        fill={themeColors.icon}
    />
);

TrashIcon.propTypes = propTypes;

export default TrashIcon;
