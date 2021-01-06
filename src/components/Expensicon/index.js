import React from 'react';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import Expensicons from './Icons';
import ICON_NAMES from './ICON_NAMES';

const propTypes = {
    name: PropTypes.oneOf(Object.values(ICON_NAMES)).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    isEnabled: PropTypes.bool,
};

const defaultProps = {
    width: variables.iconSizeSmall,
    height: variables.iconSizeSmall,
    isEnabled: false,
};

const Expensicon = (props) => {
    const Icon = Expensicons[props.name].icon;
    let fillColor = props.isEnabled ? themeColors.heading : themeColors.icon;

    // If we have a colored asset, do not pass a fill color
    if (Expensicons[props.name].isAssetColored) {
        fillColor = undefined;
    }

    return (
        <Icon
            width={props.width}
            height={props.height}
            fill={fillColor}
        />
    );
};

Expensicon.propTypes = propTypes;
Expensicon.defaultProps = defaultProps;

export default Expensicon;
