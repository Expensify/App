import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';

const propTypes = {
    /** Whether checkbox is checked */
    isChecked: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** Children (icon) for Checkbox */
    children: PropTypes.node,

    /** Additional styles to add to checkbox button */
    style: stylePropTypes,

    /** Callback that is called when mousedown is triggered. */
    onMouseDown: PropTypes.func,

    /** A ref to forward to the Pressable */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),
};

const defaultProps = {
    isChecked: false,
    hasError: false,
    disabled: false,
    style: [],
    forwardedRef: undefined,
    children: null,
    onMouseDown: undefined,
};

class Checkbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFocused: false,
        };

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.handleSpaceKey = this.handleSpaceKey.bind(this);
        this.firePressHandlerOnClick = this.firePressHandlerOnClick.bind(this);
    }

    onFocus() {
        this.setState({isFocused: true});
    }

    onBlur() {
        this.setState({isFocused: false});
    }

    handleSpaceKey(event) {
        if (event.code !== 'Space') {
            return;
        }

        this.props.onPress();
    }

    firePressHandlerOnClick(event) {
        // Pressable can be triggered with Enter key and by a click. As this is a checkbox,
        // We do not want to toggle it, when Enter key is pressed.
        if (event.type && event.type !== 'click') {
            return;
        }

        const wasChecked = this.props.isChecked;

        // Make sure the checkbox gets unfocused when it's about to be unselected
        if (this.state.isFocused && wasChecked) {
            this.onBlur();
        }

        this.props.onPress();
    }

    render() {
        return (
            <Pressable
                disabled={this.props.disabled}
                onPress={this.firePressHandlerOnClick}
                onMouseDown={this.props.onMouseDown}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                ref={this.props.forwardedRef}
                onPressOut={this.onBlur}
                style={this.props.style}
                onKeyDown={this.handleSpaceKey}
                accessibilityRole="checkbox"
                accessibilityState={{
                    checked: this.props.isChecked,
                }}
            >
                {this.props.children
                    ? this.props.children
                    : (
                        <View
                            style={[
                                styles.checkboxContainer,
                                this.props.isChecked && styles.checkedContainer,
                                this.props.hasError && styles.borderColorDanger,
                                this.props.disabled && styles.cursorDisabled,
                                (this.state.isFocused || this.props.isChecked) && styles.borderColorFocus,
                            ]}
                        >
                            {this.props.isChecked && <Icon src={Expensicons.Checkmark} fill={themeColors.textLight} height={14} width={14} />}
                        </View>
                    )}
            </Pressable>
        );
    }
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;

export default Checkbox;
