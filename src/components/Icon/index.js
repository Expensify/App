import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import IconWrapperStyles from './IconWrapperStyles';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.func.isRequired,

    /** The width of the icon. */
    width: PropTypes.number,

    /** The height of the icon. */
    height: PropTypes.number,

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill: PropTypes.string,

    /** Is small icon */
    small: PropTypes.bool,

    /** Is inline icon */
    inline: PropTypes.bool,

    /** Is icon hovered */
    hovered: PropTypes.bool,

    /** Is icon pressed */
    pressed: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    additionalStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: themeColors.icon,
    small: false,
    inline: false,
    additionalStyles: [],
    hovered: false,
    pressed: false,
};

function Icon({src, width, height, fill, small, inline, additionalStyles, hovered, pressed}) {
    const effectiveWidth = small ? variables.iconSizeSmall : width;
    const effectiveHeight = small ? variables.iconSizeSmall : height;
    const iconStyles = [StyleUtils.getWidthAndHeightStyle(effectiveWidth, effectiveHeight), IconWrapperStyles, styles.pAbsolute, ...additionalStyles];

    const IconComponent = src;

    if (inline) {
        return (
            <View
                testID={`${src.name} Icon`}
                style={[StyleUtils.getWidthAndHeightStyle(effectiveWidth, effectiveHeight), styles.bgTransparent, styles.overflowVisible]}
            >
                <View style={iconStyles}>
                    <IconComponent
                        width={effectiveWidth}
                        height={effectiveHeight}
                        fill={fill}
                        hovered={hovered.toString()}
                        pressed={pressed.toString()}
                    />
                </View>
            </View>
        );
    }

    return (
        <View
            testID={`${src.name} Icon`}
            style={additionalStyles}
        >
            <IconComponent
                width={effectiveWidth}
                height={effectiveHeight}
                fill={fill}
                hovered={hovered.toString()}
                pressed={pressed.toString()}
            />
        </View>
    );
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;
Icon.displayName = 'Icon';

export default Icon;
