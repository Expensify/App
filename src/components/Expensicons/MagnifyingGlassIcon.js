import React from 'react';
import PropTypes from 'prop-types';
import MagnifyingGlassSvg from '../../../assets/images/magnifyingglass.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
};

const defaultProps = {
    height: 20,
    width: 20,
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
