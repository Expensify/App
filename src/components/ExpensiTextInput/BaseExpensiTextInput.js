import _ from 'underscore';
import React, {Component} from 'react';
import {
    Animated, TextInput, View, TouchableWithoutFeedback,
} from 'react-native';
import Str from 'expensify-common/lib/str';
import ExpensiTextInputLabel from './ExpensiTextInputLabel';
import {propTypes, defaultProps} from './baseExpensiTextInputPropTypes';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import {setBrowserAttributes} from '../../libs/TextInputUtils';
import InlineErrorText from '../InlineErrorText';

const ACTIVE_LABEL_TRANSLATE_Y = -12;
const ACTIVE_LABEL_TRANSLATE_X = (translateX = -22) => translateX;
const ACTIVE_LABEL_SCALE = 0.8668;

const INACTIVE_LABEL_TRANSLATE_Y = 0;
const INACTIVE_LABEL_TRANSLATE_X = 0;
const INACTIVE_LABEL_SCALE = 1;

class BaseExpensiTextInput extends Component {
    constructor(props) {
        super(props);

        this.value = props.value || props.defaultValue || '';
        const activeLabel = props.forceActiveLabel || this.value.length > 0;

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(activeLabel ? ACTIVE_LABEL_TRANSLATE_Y : INACTIVE_LABEL_TRANSLATE_Y),
            labelTranslateX: new Animated.Value(activeLabel
                ? ACTIVE_LABEL_TRANSLATE_X(props.translateX) : INACTIVE_LABEL_TRANSLATE_X),
            labelScale: new Animated.Value(activeLabel ? ACTIVE_LABEL_SCALE : INACTIVE_LABEL_SCALE),
        };

        this.input = null;
        this.isLabelActive = activeLabel;
        this.onPress = this.onPress.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.setValue = this.setValue.bind(this);
    }

    componentDidMount() {
        if (!this.input) {
            return;
        }

        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (this.props.autoFocus) {
            this.input.focus();
        }
        if (this.props.name) {
            setBrowserAttributes(this.input, 'name', this.props.name);
        }
    }

    componentDidUpdate(prevProps) {
        // activate or deactivate the label when value is changed programmatically from outside
        if (prevProps.value !== this.props.value) {
            this.value = this.props.value;

            if (this.props.value) {
                this.activateLabel();
            } else if (!this.state.isFocused) {
                this.deactivateLabel();
            }
        }
    }

    onPress(event) {
        if (this.props.disabled) {
            return;
        }

        if (this.props.onPress) {
            this.props.onPress(event);
        }

        if (!event.isDefaultPrevented()) {
            this.input.focus();
        }
    }

    onFocus(event) {
        if (this.props.onFocus) { this.props.onFocus(event); }
        this.setState({isFocused: true});
        this.activateLabel();
    }

    onBlur(event) {
        if (this.props.onBlur) { this.props.onBlur(event); }
        this.setState({isFocused: false});
        this.deactivateLabel();
    }

    /**
     * Set Value & activateLabel
     *
     * @param {String} value
     * @memberof BaseExpensiTextInput
     */
    setValue(value) {
        this.value = value;
        Str.result(this.props.onChangeText, value);
        this.activateLabel();
    }

    activateLabel() {
        if (this.value.length >= 0 && !this.isLabelActive) {
            this.animateLabel(
                ACTIVE_LABEL_TRANSLATE_Y,
                ACTIVE_LABEL_TRANSLATE_X(this.props.translateX),
                ACTIVE_LABEL_SCALE,
            );
            this.isLabelActive = true;
        }
    }

    deactivateLabel() {
        if (!this.props.forceActiveLabel && this.value.length === 0) {
            this.animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_TRANSLATE_X, INACTIVE_LABEL_SCALE);
            this.isLabelActive = false;
        }
    }

    animateLabel(translateY, translateX, scale) {
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

    render() {
        const {
            label,
            value,
            placeholder,
            errorText,
            hasError,
            containerStyles,
            inputStyle,
            ignoreLabelTranslateX,
            innerRef,
            autoFocus,

            // Only present for Web
            name,
            multiline,
            ...inputProps
        } = this.props;

        const hasLabel = Boolean(label.length);
        return (
            <View>
                <View
                    style={[
                        !multiline && styles.componentHeightLarge,
                        ...containerStyles,
                    ]}
                >
                    <TouchableWithoutFeedback onPress={this.onPress} focusable={false}>
                        <View
                            style={[
                                styles.expensiTextInputContainer,
                                this.state.isFocused && styles.borderColorFocus,
                                (hasError || errorText) && styles.borderColorDanger,
                            ]}
                        >
                            {hasLabel ? (
                                <>
                                    {/* Adding this background to the label only for multiline text input,
                                    to prevent text overlaping with label when scrolling */}
                                    {multiline && <View style={styles.expensiTextInputLabelBackground} />}
                                    <ExpensiTextInputLabel
                                        label={label}
                                        labelTranslateX={
                                            ignoreLabelTranslateX
                                                ? new Animated.Value(0)
                                                : this.state.labelTranslateX
                                        }
                                        labelTranslateY={this.state.labelTranslateY}
                                        labelScale={this.state.labelScale}
                                        for={this.props.nativeID}

                                    />
                                </>
                            ) : null}
                            <TextInput
                                ref={(ref) => {
                                    if (typeof innerRef === 'function') { innerRef(ref); }
                                    this.input = ref;
                                }}
                                // eslint-disable-next-line
                                {...inputProps}
                                value={value}
                                placeholder={(this.state.isFocused || !label) ? placeholder : null}
                                placeholderTextColor={themeColors.placeholderText}
                                underlineColorAndroid="transparent"
                                style={[inputStyle, !hasLabel && styles.pv0]}
                                multiline={multiline}
                                onFocus={this.onFocus}
                                onBlur={this.onBlur}
                                onChangeText={this.setValue}
                                onPressOut={this.props.onPress}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {!_.isEmpty(errorText) && (
                    <InlineErrorText>
                        {errorText}
                    </InlineErrorText>
                )}
            </View>
        );
    }
}

BaseExpensiTextInput.propTypes = propTypes;
BaseExpensiTextInput.defaultProps = defaultProps;

export default BaseExpensiTextInput;
