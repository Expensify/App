import _ from 'underscore';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import * as BrandAssets from './BrandAssets';
import * as Expensicons from './Expensicons';

const ICONS = _.extend(BrandAssets, Expensicons);

const propTypes = {
    /* The asset to render. */
    icon: PropTypes.oneOf(_.values(ICONS)).isRequired,

    /* The width of the icon. */
    width: PropTypes.number,

    /* The height of the icon. */
    height: PropTypes.number,

    /* Whether or not the icon is enabled. */
    isEnabled: PropTypes.bool,

    /* The fill color for the icon */
    fill: PropTypes.string,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    isEnabled: false,
    fill: undefined,
};

const Icon = (props) => {
    const IconToRender = props.icon;
    let fillColor = props.fill;
    if (!props.fill) {
        fillColor = props.isEnabled ? themeColors.heading : themeColors.icon;
    }

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
