import React from 'react';
import PropTypes from 'prop-types';
import PencilSVG from '../../../assets/images/pencil.svg';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const PencilIcon = props => (
    <PencilSVG
        height={props.height}
        width={props.width}
    />
);

PencilIcon.propTypes = propTypes;

export default PencilIcon;
