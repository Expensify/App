import React from 'react';
import PropTypes from 'prop-types';
import MailSVG from '../../../assets/images/mail.svg';

const propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};

const MailIcon = props => (
    <MailSVG
        height={props.height}
        width={props.width}
    />
);

MailIcon.propTypes = propTypes;

export default MailIcon;
