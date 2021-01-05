import React from 'react';
import PropTypes from 'prop-types';
import CopyLinkSVG from '../../../assets/images/link-copy.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const CopyLinkIcon = props => (
    <CopyLinkSVG
        height={props.height}
        width={props.width}
        fill={themeColors.icon}
    />
);

CopyLinkIcon.propTypes = propTypes;

export default CopyLinkIcon;
