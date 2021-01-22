import React from 'react';
import PropTypes from 'prop-types';
import MagnifyingGlassSvg from '../../../assets/images/magnifyingglass.svg';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

const propTypes = {
    // Height of the icon
    height: PropTypes.number,

    // Width of the icon
    width: PropTypes.number,
};

const defaultProps = {
    height: variables.iconSizeNormal,
    width: variables.iconSizeNormal,
};

const MagnifyingGlassIcon = props => (
    <MagnifyingGlassSvg
        height={props.height}
        width={props.width}
        fill={themeColors.icon}
    />
);

MagnifyingGlassIcon.propTypes = propTypes;
MagnifyingGlassIcon.defaultProps = defaultProps;

export default MagnifyingGlassIcon;
