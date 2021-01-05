import React from 'react';
import PropTypes from 'prop-types';
import ClipboardSVG from '../../../assets/images/clipboard.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const ClipboardIcon = props => (
    <ClipboardSVG
        height={props.height}
        width={props.width}
        fill={themeColors.icon}
    />
);

ClipboardIcon.propTypes = propTypes;

export default ClipboardIcon;
