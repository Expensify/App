import React from 'react';
import PropTypes from 'prop-types';
import CopyLinkSVG from '../../../assets/images/link-copy.svg';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const CopyLinkIcon = props => (
    <CopyLinkSVG
        height={props.height}
        width={props.width}
    />
);

CopyLinkIcon.propTypes = propTypes;

export default CopyLinkIcon;
