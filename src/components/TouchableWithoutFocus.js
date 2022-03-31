import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Element that should be clickable  */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    /** Callback for onPress event */
    onPress: PropTypes.func.isRequired,

    /** Styles that should be passed to touchable container */
    styles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    styles: [],
};

/**
 * This component prevents the tapped element from capturing focus
 */
class TouchableWithoutFocus extends React.Component {
    constructor(props) {
        super(props);
        this.pressAndBlur = this.pressAndBlur.bind(this);
    }

    pressAndBlur() {
        this.touchableRef.blur();
        this.props.onPress();
    }

    render() {
        return (
            <Pressable onPress={this.pressAndBlur} ref={el => this.touchableRef = el} style={this.props.styles}>
                {this.props.children}
            </Pressable>
        );
    }
}

TouchableWithoutFocus.propTypes = propTypes;
TouchableWithoutFocus.defaultProps = defaultProps;

export default TouchableWithoutFocus;
