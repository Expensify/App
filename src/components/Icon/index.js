import React, {PureComponent} from 'react';
import {View, Platform} from 'react-native';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

// const inlineTop = Platform.OS === 'ios' ? 0.5 : 2;

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

    /** Is small icon */
    inline: PropTypes.bool,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: themeColors.icon,
    small: false,
    inline: false,
};

const inlineTop = Platform.OS === 'ios' ? 1 : 2;

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent {
    render() {
        const inline = this.props.inline;
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;
        const IconToRender = this.props.src;

        if (inline) {
            return (
                <View style={{
                    width, height, overflow: 'visible', backgroundColor: 'transparent',
                }}
                >
                    <View style={{
                        width,
                        height,
                        position: 'absolute',
                        top: inlineTop,
                    }}
                    >
                        <IconToRender
                            width={width}
                            height={height}
                            fill={this.props.fill}
                        />
                    </View>
                </View>
            );
        }

        return (
            <IconToRender
                width={width}
                height={height}
                fill={this.props.fill}
            />
        );
    }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
