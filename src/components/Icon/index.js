import _ from 'underscore';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import * as BRAND_ASSETS from './BRAND_ASSETS';
import * as EXPENSICONS from './EXPENSICONS';

const ICONS = _.extend(BRAND_ASSETS, EXPENSICONS);

const propTypes = {
    icon: PropTypes.oneOf(_.values(ICONS)).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    isEnabled: PropTypes.bool,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    isEnabled: false,
};

const Icon = (props) => {
    const IconToRender = props.icon;
    let fillColor = props.isEnabled ? themeColors.heading : themeColors.icon;

    // Do not pass a fill color for brand assets
    if (_.contains(_.values(BRAND_ASSETS), props.icon)) {
        fillColor = undefined;
    }

    return (
        <IconToRender
            width={props.width}
            height={props.height}
            fill={fillColor}
        />
    );
};

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default memo(Icon);
