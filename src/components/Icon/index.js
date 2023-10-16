import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
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

    /** Icon name required to create the icon test ID  */
    name: PropTypes.string,
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
    name: '',
};

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent {
    render() {
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;
        const iconStyles = [StyleUtils.getWidthAndHeightStyle(width, height), IconWrapperStyles, styles.pAbsolute, ...this.props.additionalStyles];
        const IconComponent = this.props.src;
        if (this.props.inline) {
            return (
                <View
                    testID={`Svg${this.props.name} Icon`}
                    style={[StyleUtils.getWidthAndHeightStyle(width, height), styles.bgTransparent, styles.overflowVisible]}
                >
                    <View style={iconStyles}>
                        <IconComponent
                            width={width}
                            height={height}
                            fill={this.props.fill}
                            hovered={this.props.hovered.toString()}
                            pressed={this.props.pressed.toString()}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View
                testID={`Svg${this.props.name} Icon`}
                style={this.props.additionalStyles}
            >
                <IconComponent
                    width={width}
                    height={height}
                    fill={this.props.fill}
                    hovered={this.props.hovered.toString()}
                    pressed={this.props.pressed.toString()}
                />
            </View>
        );
    }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
