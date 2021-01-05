import React from 'react';
import PropTypes from 'prop-types';
import TrashSVG from '../../../assets/images/trashcan.svg';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const TrashIcon = props => (
    <TrashSVG
        height={props.height}
        width={props.width}
    />
);

TrashIcon.propTypes = propTypes;

export default TrashIcon;
