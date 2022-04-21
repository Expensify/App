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
 * This component prevents the tapped element from capturing focus.
 * We need to blur this element when clicked as it opens modal that implements focus-trapping.
 * When the modal is closed it focuses back to the last active element.
 * Therefore it shifts the element to bring it back to focus.
 * https://github.com/Expensify/App/issues/6806
 */
class PressableWithoutFocus extends React.Component {
    constructor(props) {
        super(props);
        this.pressAndBlur = this.pressAndBlur.bind(this);
    }

    pressAndBlur() {
        this.pressableRef.blur();
        this.props.onPress();
    }

    render() {
        return (
            <Pressable onPress={this.pressAndBlur} ref={el => this.pressableRef = el} style={this.props.styles}>
                {this.props.children}
            </Pressable>
        );
    }
}

PressableWithoutFocus.propTypes = propTypes;
PressableWithoutFocus.defaultProps = defaultProps;

export default PressableWithoutFocus;
