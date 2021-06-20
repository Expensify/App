import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
    Animated, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const ACTIVE_LABEL_TRANSLATE_Y = -10;
const ACTIVE_LABEL_TRANSLATE_X = -9;
const ACTIVE_LABEL_SCALE = 0.8661;

const INACTIVE_LABEL_TRANSLATE_Y = 0;
const INACTIVE_LABEL_TRANSLATE_X = 0;
const INACTIVE_LABEL_SCALE = 1;

const propTypes = {
    /** Input label */
    label: PropTypes.string,

    /** Input value */
    value: PropTypes.string.isRequired,

    /** Input value placeholder */
    placeholder: PropTypes.string,

    /** Callback that is called when the text input's text changes.
     * Changed text is passed as an argument to the callback handler.
     */
    onChangeText: PropTypes.func.isRequired,

    /** Input with error  */
    error: PropTypes.bool,
};

const defaultProps = {
    label: '',
    placeholder: '',
    error: false,
};

class ExpensiTextInput extends Component {
    constructor(props) {
        super(props);

        const hasValue = props.value.length > 0;

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(hasValue ? ACTIVE_LABEL_TRANSLATE_Y : INACTIVE_LABEL_TRANSLATE_Y),
            labelTranslateX: new Animated.Value(hasValue ? ACTIVE_LABEL_TRANSLATE_X : INACTIVE_LABEL_TRANSLATE_X),
            labelScale: new Animated.Value(hasValue ? ACTIVE_LABEL_SCALE : INACTIVE_LABEL_SCALE),
        };

        this.input = null;
    }

    animateLabel = (translateY, translateX, scale) => {
        Animated.parallel([
            Animated.spring(this.state.labelTranslateY, {
                toValue: translateY,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.state.labelTranslateX, {
                toValue: translateX,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.state.labelScale, {
                toValue: scale,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }

    onFocus = () => {
        this.setState({isFocused: true});
        if (this.props.value.length === 0) {
            this.animateLabel(ACTIVE_LABEL_TRANSLATE_Y, ACTIVE_LABEL_TRANSLATE_X, ACTIVE_LABEL_SCALE);
        }
    }

    onBlur = () => {
        this.setState({isFocused: false});
        if (this.props.value.length === 0) {
            this.animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_TRANSLATE_X, INACTIVE_LABEL_SCALE);
        }
    }

    render() {
        const {
            label, value, placeholder, onChangeText, error,
        } = this.props;
        const {
            isFocused, labelTranslateY, labelTranslateX, labelScale,
        } = this.state;

        const hasLabel = !!label.length;
        return (
            <TouchableWithoutFeedback onPress={() => this.input.focus()}>
                <View
                    style={[
                        styles.expensiTextInputContainer,
                        !hasLabel && styles.expensiTextInputContainerWithoutLabel,
                        isFocused && styles.expensiTextInputContainerOnFocus,
                        error && styles.expensiTextInputContainerOnError,
                    ]}
                >
                    {hasLabel > 0 && (
                        <Animated.Text
                            style={[
                                styles.expensiTextInputLabel,
                                styles.expensiTextInputLabelTransformation(
                                    labelTranslateY,
                                    labelTranslateX,
                                    labelScale,
                                ),
                            ]}
                        >
                            {label}
                        </Animated.Text>
                    )}
                    <TextInput
                        ref={ref => this.input = ref}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        placeholder={isFocused || !label ? placeholder : null}
                        placeholderTextColor={themeColors.placeholderText}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

ExpensiTextInput.propTypes = propTypes;
ExpensiTextInput.defaultProps = defaultProps;

export default ExpensiTextInput;
