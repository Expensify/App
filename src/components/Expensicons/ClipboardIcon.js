import React, {memo} from 'react';
import PropTypes from 'prop-types';
import ClipboardSvg from '../../../assets/images/clipboard.svg';
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

const ClipboardIcon = props => (
    <ClipboardSvg
        height={props.height}
        width={props.width}
        fill={props.isEnabled ? themeColors.heading : themeColors.icon}
    />
);

ClipboardIcon.propTypes = propTypes;
ClipboardIcon.defaultProps = defaultProps;

export default memo(ClipboardIcon);
