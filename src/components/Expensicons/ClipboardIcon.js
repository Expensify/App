import React from 'react';
import PropTypes from 'prop-types';
import ClipboardSVG from '../../../assets/images/clipboard.svg';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const ClipboardIcon = props => (
    <ClipboardSVG
        height={props.height}
        width={props.width}
    />
);

ClipboardIcon.propTypes = propTypes;

export default ClipboardIcon;
