import React from 'react';
import PropTypes from 'prop-types';
import MailSVG from '../../../assets/images/mail.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const MailIcon = props => (
    <MailSVG
        height={props.height}
        width={props.width}
        fill={themeColors.icon}
    />
);

MailIcon.propTypes = propTypes;

export default MailIcon;
