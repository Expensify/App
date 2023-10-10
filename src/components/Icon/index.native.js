import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import IconWrapperStyles from './IconWrapperStyles';
import {Image} from 'expo-image';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.node.isRequired,

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

    /** Is icon displayed in its own color */
    displayInDefaultIconColor: PropTypes.bool,
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
    contentFit: 'cover',
    displayInDefaultIconColor: false,
};

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent {
    render() {
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;
        const iconStyles = [StyleUtils.getWidthAndHeightStyle(width, height), IconWrapperStyles, styles.pAbsolute, ...this.props.additionalStyles];
        if (this.props.inline) {
            return (
                <View
                    testID={`${this.props.src.name} Icon`}
                    style={[StyleUtils.getWidthAndHeightStyle(width, height), styles.bgTransparent, styles.overflowVisible]}
                >
                    <View style={iconStyles}>
                        <Image
                            contentFit={this.props.contentFit}
                            source={this.props.src}
                            style={{width, height}}
                            tintColor={this.props.displayInDefaultIconColor ? null : this.props.fill}
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
                <Image
                    contentFit={this.props.contentFit}
                    source={this.props.src}
                    style={{width, height}}
                    tintColor={this.props.displayInDefaultIconColor ? null : this.props.fill}
                />
            </View>
        );
    }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
