import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.func.isRequired,

    /** The width of the icon. */
    width: PropTypes.number,

    /** The height of the icon. */
    height: PropTypes.number,

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue' */
    fill: PropTypes.string,
};

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: themeColors.icon,
};

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent {
    render() {
        const IconToRender = this.props.src;
        return (
            <IconToRender
                width={this.props.width}
                height={this.props.height}
                fill={this.props.fill}
            />
        );
    }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
