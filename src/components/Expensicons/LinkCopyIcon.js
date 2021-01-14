import React, {memo} from 'react';
import PropTypes from 'prop-types';
import LinkCopySvg from '../../../assets/images/link-copy.svg';
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

const LinkCopyIcon = props => (
    <LinkCopySvg
        height={props.height}
        width={props.width}
        fill={props.isEnabled ? themeColors.heading : themeColors.icon}
    />
);

LinkCopyIcon.propTypes = propTypes;
LinkCopyIcon.defaultProps = defaultProps;

export default memo(LinkCopyIcon);
