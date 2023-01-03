import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import * as StyleUtils from '../../styles/StyleUtils';
import IconWrapperStyles from './IconWrapperStyles';

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

    /** Is svg avatar icon */
    svgAvatar: PropTypes.bool,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: themeColors.icon,
    small: false,
    inline: false,
    svgAvatar: false,
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
                    style={[StyleUtils.getWidthAndHeightStyle(width, height), styles.bgTransparent, styles.overflowVisible]}
                >
                    <View style={[StyleUtils.getWidthAndHeightStyle(width, height),
                        IconWrapperStyles, styles.pAbsolute, this.props.svgAvatar ? styles.svgAvatarBorder : []]}
                    >
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
            <View accessibilityHint={`${this.props.src.name} Icon`} style={[this.props.svgAvatar ? styles.svgAvatarBorder : []]}>
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
