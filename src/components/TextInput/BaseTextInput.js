import _ from 'underscore';
import React, {Component} from 'react';
import {
    Animated, View, TouchableWithoutFeedback, Pressable, AppState, Keyboard,
    // eslint-disable-next-line no-restricted-imports
    TextInput as RNTextInput,
} from 'react-native';
import Str from 'expensify-common/lib/str';
import TextInputLabel from './TextInputLabel';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import * as styleConst from './styleConst';
import * as StyleUtils from '../../styles/StyleUtils';

class BaseTextInput extends Component {
    constructor(props) {
        super(props);

        this.value = props.value || props.defaultValue || '';
        const activeLabel = props.forceActiveLabel || this.value.length > 0;

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(activeLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y),
            labelScale: new Animated.Value(activeLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE),
            passwordHidden: props.secureTextEntry,
            textInputWidth: 0,
        };

        this.input = null;
        this.isLabelActive = activeLabel;
        this.onPress = this.onPress.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.setValue = this.setValue.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
        this.dismissKeyboardWhenBackgrounded = this.dismissKeyboardWhenBackgrounded.bind(this);
    }

    componentDidMount() {
        if (this.props.disableKeyboard) {
            this.appStateSubscription = AppState.addEventListener(
                'change',
                this.dismissKeyboardWhenBackgrounded,
            );
        }

        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!this.props.autoFocus || !this.input) {
            return;
        }

        this.input.focus();
    }

    componentDidUpdate() {
        // Activate or deactivate the label when value is changed programmatically from outside
        // Only update when value prop is provided
        if (this.props.value === undefined || this.value === this.props.value) {
            return;
        }

        this.value = this.props.value;
        this.input.setNativeProps({text: this.value});

        // In some cases, When the value prop is empty, it is not properly updated on the TextInput due to its uncontrolled nature, thus manually clearing the TextInput.
        if (this.props.value === '') {
            this.input.clear();
        }

        if (this.props.value) {
            this.activateLabel();
        } else if (!this.state.isFocused) {
            this.deactivateLabel();
        }
    }

    componentWillUnmount() {
        if (!this.props.disableKeyboard || !this.appStateSubscription) {
            return;
        }

        this.appStateSubscription.remove();
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
     * @memberof BaseTextInput
     */
    setValue(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
        this.value = value;
        Str.result(this.props.onChangeText, value);
        this.activateLabel();
    }

    activateLabel() {
        if (this.value.length < 0 || this.isLabelActive) {
            return;
        }

        this.animateLabel(
            styleConst.ACTIVE_LABEL_TRANSLATE_Y,
            styleConst.ACTIVE_LABEL_SCALE,
        );
        this.isLabelActive = true;
    }

    deactivateLabel() {
        if (this.props.forceActiveLabel || this.value.length !== 0) {
            return;
        }

        this.animateLabel(styleConst.INACTIVE_LABEL_TRANSLATE_Y, styleConst.INACTIVE_LABEL_SCALE);
        this.isLabelActive = false;
    }

    dismissKeyboardWhenBackgrounded(nextAppState) {
        if (!nextAppState.match(/inactive|background/)) {
            return;
        }

        Keyboard.dismiss();
    }

    animateLabel(translateY, scale) {
        Animated.parallel([
            Animated.spring(this.state.labelTranslateY, {
                toValue: translateY,
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
        // eslint-disable-next-line react/forbid-foreign-prop-types
        const inputProps = _.omit(this.props, _.keys(baseTextInputPropTypes.propTypes));
        const hasLabel = Boolean(this.props.label.length);
        const inputHelpText = this.props.errorText || this.props.hint;
        const formHelpStyles = this.props.errorText ? styles.formError : styles.formHelp;

        return (
            <>
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
                                    styles.textInputContainer,
                                    ...this.props.textInputContainerStyles,
                                    this.props.autoGrow && StyleUtils.getAutoGrowTextInputStyle(this.state.textInputWidth),
                                    !this.props.hideFocusedState && this.state.isFocused && styles.borderColorFocus,
                                    (this.props.hasError || this.props.errorText) && styles.borderColorDanger,
                                ]}
                            >
                                {hasLabel ? (
                                    <>
                                        {/* Adding this background to the label only for multiline text input,
                                    to prevent text overlapping with label when scrolling */}
                                        {this.props.multiline && <View style={styles.textInputLabelBackground} pointerEvents="none" />}
                                        <TextInputLabel
                                            label={this.props.label}
                                            labelTranslateY={this.state.labelTranslateY}
                                            labelScale={this.state.labelScale}
                                            for={this.props.nativeID}
                                        />
                                    </>
                                ) : null}
                                <View style={[styles.textInputAndIconContainer]}>
                                    <RNTextInput
                                        ref={(ref) => {
                                            if (typeof this.props.innerRef === 'function') { this.props.innerRef(ref); }
                                            this.input = ref;
                                        }}
                                        // eslint-disable-next-line
                                        {...inputProps}
                                        defaultValue={this.value}
                                        placeholder={(this.state.isFocused || !this.props.label) ? this.props.placeholder : null}
                                        placeholderTextColor={themeColors.placeholderText}
                                        underlineColorAndroid="transparent"
                                        style={[
                                            styles.flex1,
                                            styles.w100,
                                            this.props.inputStyle,
                                            !hasLabel && styles.pv0,
                                            this.props.secureTextEntry && styles.pr2,
                                        ]}
                                        multiline={this.props.multiline}
                                        maxLength={this.props.maxLength}
                                        onFocus={this.onFocus}
                                        onBlur={this.onBlur}
                                        onChangeText={this.setValue}
                                        secureTextEntry={this.state.passwordHidden}
                                        onPressOut={this.props.onPress}
                                        showSoftInputOnFocus={!this.props.disableKeyboard}
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
                    {(!_.isEmpty(inputHelpText) || !_.isNull(this.props.maxLength)) && (
                        <View
                            style={[
                                styles.mt1,
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.ph3,
                            ]}
                        >
                            {!_.isEmpty(inputHelpText) && (
                                <Text style={[formHelpStyles]}>{inputHelpText}</Text>
                            )}
                            {!_.isNull(this.props.maxLength) && (
                                <Text style={[formHelpStyles, styles.flex1, styles.textAlignRight]}>
                                    {this.value.length}
                                    /
                                    {this.props.maxLength}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
                {/*
                    Text input component doesn't support auto grow by default.
                    We're using a hidden text input to achieve that.
                    This text view is used to calculate width of the input value given textStyle in this component.
                    This Text component is intentionally positioned out of the screen.
                */}
                {this.props.autoGrow && (
                    <Text
                        style={[...this.props.inputStyle, styles.hiddenElementOutsideOfWindow]}
                        onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
                    >
                        {this.props.value || this.props.placeholder}
                    </Text>
                )}
            </>
        );
    }
}

BaseTextInput.propTypes = baseTextInputPropTypes.propTypes;
BaseTextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default BaseTextInput;
