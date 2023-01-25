import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import * as StyleUtils from '../../styles/StyleUtils';
import IconWrapperStyles from './IconWrapperStyles';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.func.isRequired,

    /** The width of the icon. */
    width: PropTypes.number,

    /** The height of the icon. */
    height: PropTypes.number,

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue' */
    fill: PropTypes.string,

    /** Is small icon */
    small: PropTypes.bool,

    /** Is inline icon */
    inline: PropTypes.bool,

    /** Additional styles to apply to the container wrapping the icon */
    containerStyles: stylePropTypes,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: themeColors.icon,
    small: false,
    inline: false,
    containerStyles: [],
};

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent {
    render() {
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;

        if (this.props.inline) {
            return (
                <View
                    accessibilityHint={`${this.props.src.name} Icon`}
                    style={[StyleUtils.getWidthAndHeightStyle(width, height), styles.bgTransparent, styles.overflowVisible, this.props.containerStyles]}
                >
                    <View style={[StyleUtils.getWidthAndHeightStyle(width, height), IconWrapperStyles, styles.pAbsolute]}>
                        <this.props.src
                            width={width}
                            height={height}
                            fill={this.props.fill}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View accessibilityHint={`${this.props.src.name} Icon`} style={this.props.containerStyles}>
                <this.props.src
                    width={width}
                    height={height}
                    fill={this.props.fill}
                />
            </View>
        );
    }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
