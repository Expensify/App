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

    /** Additional styles to add to checkbox container */
    containerStyle: stylePropTypes,

    /** Callback that is called when mousedown is triggered. */
    onMouseDown: PropTypes.func,

    /** A ref to forward to the Pressable */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
};

const defaultProps = {
    isChecked: false,
    hasError: false,
    disabled: false,
    style: [],
    containerStyle: [],
    forwardedRef: undefined,
    children: null,
    onMouseDown: undefined,
};

class Checkbox extends React.Component {
    constructor(props) {
        super(props);

        this.handleSpaceKey = this.handleSpaceKey.bind(this);
        this.firePressHandlerOnClick = this.firePressHandlerOnClick.bind(this);
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

        this.props.onPress();
    }

    render() {
        return (
            <Pressable
                disabled={this.props.disabled}
                onPress={this.firePressHandlerOnClick}
                onMouseDown={this.props.onMouseDown}
                ref={this.props.forwardedRef}
                style={this.props.style}
                onKeyDown={this.handleSpaceKey}
                accessibilityRole="checkbox"
                accessibilityState={{
                    checked: this.props.isChecked,
                }}
            >
                {this.props.children ? (
                    this.props.children
                ) : (
                    <View
                        style={[
                            styles.checkboxContainer,
                            this.props.containerStyle,
                            this.props.isChecked && styles.checkedContainer,
                            this.props.hasError && styles.borderColorDanger,
                            this.props.disabled && styles.cursorDisabled,
                            this.props.isChecked && styles.borderColorFocus,
                        ]}
                        // Used as CSS selector to customize focus-visible style
                        dataSet={{checkbox: true}}
                    >
                        {this.props.isChecked && (
                            <Icon
                                src={Expensicons.Checkmark}
                                fill={themeColors.textLight}
                                height={14}
                                width={14}
                            />
                        )}
                    </View>
                )}
            </Pressable>
        );
    }
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;

export default Checkbox;
