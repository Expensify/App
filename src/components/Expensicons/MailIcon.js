import React, {memo} from 'react';
import PropTypes from 'prop-types';
import MailSvg from '../../../assets/images/mail.svg';
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

const MailIcon = props => (
    <MailSvg
        height={props.height}
        width={props.width}
        fill={props.isEnabled ? themeColors.heading : themeColors.icon}
    />
);

MailIcon.propTypes = propTypes;
MailIcon.defaultProps = defaultProps;

export default memo(MailIcon);
