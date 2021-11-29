import _ from 'underscore';
import React, {Component} from 'react';
import {
    Animated, TextInput, View, TouchableWithoutFeedback, Pressable,
} from 'react-native';
import Str from 'expensify-common/lib/str';
import ExpensiTextInputLabel from './ExpensiTextInputLabel';
import {propTypes, defaultProps} from './baseExpensiTextInputPropTypes';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
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
            passwordHidden: props.secureTextEntry,
        };

        this.input = null;
        this.isLabelActive = activeLabel;
        this.onPress = this.onPress.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.setValue = this.setValue.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
    }

    componentDidMount() {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!this.props.autoFocus || !this.input) {
            return;
        }

        this.input.focus();
    }

    componentDidUpdate(prevProps) {
        // activate or deactivate the label when value is changed programmatically from outside
        if (prevProps.value === this.props.value) {
            return;
        }

        this.value = this.props.value;

        if (this.props.value) {
            this.activateLabel();
        } else if (!this.state.isFocused) {
            this.deactivateLabel();
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
        if (this.value.length < 0 || this.isLabelActive) {
            return;
        }

        this.animateLabel(
            ACTIVE_LABEL_TRANSLATE_Y,
            ACTIVE_LABEL_TRANSLATE_X(this.props.translateX),
            ACTIVE_LABEL_SCALE,
        );
        this.isLabelActive = true;
    }

    deactivateLabel() {
        if (this.props.forceActiveLabel || this.value.length !== 0) {
            return;
        }

        this.animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_TRANSLATE_X, INACTIVE_LABEL_SCALE);
        this.isLabelActive = false;
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

    togglePasswordVisibility() {
        this.setState(prevState => ({passwordHidden: !prevState.passwordHidden}));
    }

    render() {
        const inputProps = _.omit(this.props, _.keys(propTypes));
        const hasLabel = Boolean(this.props.label.length);
        return (
            <View>
                <View
                    style={[
                        !this.props.multiline && styles.componentHeightLarge,
                        ...this.props.containerStyles,
                    ]}
                >
                    <TouchableWithoutFeedback onPress={this.onPress} focusable={false}>
                        <View
                            style={[
                                styles.expensiTextInputContainer,
                                this.state.isFocused && styles.borderColorFocus,
                                (this.props.hasError || this.props.errorText) && styles.borderColorDanger,
                            ]}
                        >
                            {hasLabel ? (
                                <>
                                    {/* Adding this background to the label only for multiline text input,
                                    to prevent text overlapping with label when scrolling */}
                                    {this.props.multiline && <View style={styles.expensiTextInputLabelBackground} />}
                                    <ExpensiTextInputLabel
                                        label={this.props.label}
                                        labelTranslateX={
                                            this.props.ignoreLabelTranslateX
                                                ? new Animated.Value(0)
                                                : this.state.labelTranslateX
                                        }
                                        labelTranslateY={this.state.labelTranslateY}
                                        labelScale={this.state.labelScale}
                                    />
                                </>
                            ) : null}
                            <View style={[styles.flexRow]}>
                                <TextInput
                                    ref={(ref) => {
                                        if (typeof this.props.innerRef === 'function') { this.props.innerRef(ref); }
                                        this.input = ref;
                                    }}
                                    // eslint-disable-next-line
                                    {...inputProps}
                                    value={this.props.value}
                                    placeholder={(this.state.isFocused || !this.props.label) ? this.props.placeholder : null}
                                    placeholderTextColor={themeColors.placeholderText}
                                    underlineColorAndroid="transparent"
                                    style={[this.props.inputStyle, styles.flex1, styles.w100, !hasLabel && styles.pv0, this.props.secureTextEntry && styles.expensiTextInputWithIcon]}
                                    multiline={this.props.multiline}
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    onChangeText={this.setValue}
                                    secureTextEntry={this.state.passwordHidden}
                                    onPressOut={this.props.onPress}
                                    translateX={this.props.translateX}
                                />
                                {this.props.secureTextEntry && (
                                <Pressable
                                    accessibilityRole="button"
                                    style={styles.secureInputEyeButton}
                                    onPress={this.togglePasswordVisibility}
                                >
                                    <Icon
                                        src={this.state.passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                        fill={themeColors.icon}
                                    />
                                </Pressable>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {!_.isEmpty(this.props.errorText) && (
                    <InlineErrorText>
                        {this.props.errorText}
                    </InlineErrorText>
                )}
            </View>
        );
    }
}

BaseExpensiTextInput.propTypes = propTypes;
BaseExpensiTextInput.defaultProps = defaultProps;

export default BaseExpensiTextInput;
