import _ from 'underscore';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import * as BrandAssets from './BrandAssets';
import * as Expensicons from './Expensicons';

const ICONS = _.extend(BrandAssets, Expensicons);

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
    if (_.contains(_.values(BrandAssets), props.icon)) {
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
