import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../CONST';

const propTypes = {
    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Additional styles to add to checkbox button */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** A ref to forward to the Pressable */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),

    /** Children to wrap in CheckboxButton. */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    disabled: false,
    style: [],
    forwardedRef: undefined,
};

class CheckboxButton extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    onClick() {
        this.onToggle();
    }

    onKeyDown(event) {
        if (event.keyCode !== CONST.KEYCODE.SPACE) {
            return;
        }

        this.onToggle();
        event.stopPropagation();
        event.preventDefault();
    }

    onToggle() {
        if (this.props.disabled) {
            return;
        }

        this.props.onPress();
    }

    render() {
        return (
            <View
                focusable
                onClick={this.onClick}
                onKeyDown={this.onKeyDown}
                ref={this.props.forwardedRef}
                style={this.props.style}
            >
                {this.props.children}
            </View>
        );
    }
}

CheckboxButton.propTypes = propTypes;
CheckboxButton.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <CheckboxButton {...props} forwardedRef={ref} />
));
