import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,
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
        const SPACE_KEY_CODE = 32;
        if (event.keyCode !== SPACE_KEY_CODE) {
            return;
        }

        this.onToggle();
        event.stopPropagation();
        event.preventDefault();
    }

    onToggle() {
        if(this.props.disabled) {
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
            >
                {this.props.children}
            </View>
        );
    }
}

CheckboxButton.propTypes = propTypes;
CheckboxButton.displayName = 'CheckboxButton';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <CheckboxButton {...props} forwardedRef={ref} />
));
