import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import withTheme, {withThemePropTypes} from '@components/withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';
import * as StyleUtils from '@styles/StyleUtils';
import variables from '@styles/variables';
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
    ...withThemeStylesPropTypes,
    ...withThemePropTypes,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: undefined,
    small: false,
    inline: false,
    additionalStyles: [],
    hovered: false,
    pressed: false,
};

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent {
    render() {
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;
        const iconStyles = [StyleUtils.getWidthAndHeightStyle(width, height), IconWrapperStyles, this.props.themeStyles.pAbsolute, ...this.props.additionalStyles];

        if (this.props.inline) {
            return (
                <View
                    testID={`${this.props.src.name} Icon`}
                    style={[StyleUtils.getWidthAndHeightStyle(width, height), this.props.themeStyles.bgTransparent, this.props.themeStyles.overflowVisible]}
                >
                    <View style={iconStyles}>
                        <this.props.src
                            width={width}
                            height={height}
                            fill={this.props.fill || this.props.theme.icon}
                            hovered={this.props.hovered.toString()}
                            pressed={this.props.pressed.toString()}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View
                testID={`${this.props.src.name} Icon`}
                style={this.props.additionalStyles}
            >
                <this.props.src
                    width={width}
                    height={height}
                    fill={this.props.fill || this.props.theme.icon}
                    hovered={this.props.hovered.toString()}
                    pressed={this.props.pressed.toString()}
                />
            </View>
        );
    }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default compose(withThemeStyles, withTheme)(Icon);
