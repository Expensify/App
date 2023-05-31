import _ from 'underscore';
import React, {Component} from 'react';
import {Animated, View, AppState, Keyboard, StyleSheet} from 'react-native';
import Str from 'expensify-common/lib/str';
import RNTextInput from '../RNTextInput';
import TextInputLabel from './TextInputLabel';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import * as styleConst from './styleConst';
import * as StyleUtils from '../../styles/StyleUtils';
import variables from '../../styles/variables';
import Checkbox from '../Checkbox';
import getSecureEntryKeyboardType from '../../libs/getSecureEntryKeyboardType';
import CONST from '../../CONST';
import FormHelpMessage from '../FormHelpMessage';
import isInputAutoFilled from '../../libs/isInputAutoFilled';
import * as Pressables from '../Pressable';

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;
class BaseTextInput extends Component {
    constructor(props) {
        super(props);

        const value = props.value || props.defaultValue || '';
        const activeLabel = props.forceActiveLabel || value.length > 0 || Boolean(props.prefixCharacter);

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(activeLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y),
            labelScale: new Animated.Value(activeLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE),
            passwordHidden: props.secureTextEntry,
            textInputWidth: 0,
            prefixWidth: 0,
            selection: props.selection,
            height: variables.componentSizeLarge,

            // Value should be kept in state for the autoGrow feature to work - https://github.com/Expensify/App/pull/8232#issuecomment-1077282006
            value,
        };

        this.input = null;
        this.isLabelActive = activeLabel;
        this.onPress = this.onPress.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.setValue = this.setValue.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
        this.dismissKeyboardWhenBackgrounded = this.dismissKeyboardWhenBackgrounded.bind(this);
        this.storePrefixLayoutDimensions = this.storePrefixLayoutDimensions.bind(this);
    }

    componentDidMount() {
        if (this.props.disableKeyboard) {
            this.appStateSubscription = AppState.addEventListener('change', this.dismissKeyboardWhenBackgrounded);
        }

        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!this.props.autoFocus || !this.input) {
            return;
        }

        if (this.props.shouldDelayFocus) {
            this.focusTimeout = setTimeout(() => this.input.focus(), CONST.ANIMATED_TRANSITION);
            return;
        }
        this.input.focus();
    }

    componentDidUpdate(prevProps) {
        // Activate or deactivate the label when value is changed programmatically from outside
        const inputValue = _.isUndefined(this.props.value) ? this.input.value : this.props.value;
        if ((_.isUndefined(inputValue) || this.state.value === inputValue) && _.isEqual(prevProps.selection, this.props.selection)) {
            return;
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({value: inputValue, selection: this.props.selection});

        // In some cases, When the value prop is empty, it is not properly updated on the TextInput due to its uncontrolled nature, thus manually clearing the TextInput.
        if (inputValue === '') {
            this.input.clear();
        }

        if (inputValue) {
            this.activateLabel();
        } else if (!this.state.isFocused) {
            this.deactivateLabel();
        }
    }

    componentWillUnmount() {
        if (this.focusTimeout) {
            clearTimeout(this.focusTimeout);
        }

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
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
        this.setState({isFocused: true});
        this.activateLabel();
    }

    onBlur(event) {
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
        this.setState({isFocused: false});

        // If the text has been supplied by Chrome autofill, the value state is not synced with the value
        // as Chrome doesn't trigger a change event. When there is autofill text, don't deactivate label.
        if (!isInputAutoFilled(this.input)) {
            this.deactivateLabel();
        }
    }

    /**
     * Set Value & activateLabel
     *
     * @param {String} value
     * @memberof BaseTextInput
     */
    setValue(value) {
        if (this.props.onInputChange) {
            this.props.onInputChange(value);
        }
        this.setState({value});
        Str.result(this.props.onChangeText, value);
        this.activateLabel();
    }

    activateLabel() {
        if (this.state.value.length < 0 || this.isLabelActive) {
            return;
        }

        this.animateLabel(styleConst.ACTIVE_LABEL_TRANSLATE_Y, styleConst.ACTIVE_LABEL_SCALE);
        this.isLabelActive = true;
    }

    deactivateLabel() {
        if (this.props.forceActiveLabel || this.state.value.length !== 0 || this.props.prefixCharacter) {
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
                duration: styleConst.LABEL_ANIMATION_DURATION,
                useNativeDriver: true,
            }),
            Animated.spring(this.state.labelScale, {
                toValue: scale,
                duration: styleConst.LABEL_ANIMATION_DURATION,
                useNativeDriver: true,
            }),
        ]).start();
    }

    togglePasswordVisibility() {
        this.setState((prevState) => ({passwordHidden: !prevState.passwordHidden}));
    }

    storePrefixLayoutDimensions(event) {
        this.setState({prefixWidth: Math.abs(event.nativeEvent.layout.width)});
    }

    render() {
        // eslint-disable-next-line react/forbid-foreign-prop-types
        const inputProps = _.omit(this.props, _.keys(baseTextInputPropTypes.propTypes));
        const hasLabel = Boolean(this.props.label.length);
        const isEditable = _.isUndefined(this.props.editable) ? !this.props.disabled : this.props.editable;
        const inputHelpText = this.props.errorText || this.props.hint;
        const placeholder = this.props.prefixCharacter || this.state.isFocused || !hasLabel || (hasLabel && this.props.forceActiveLabel) ? this.props.placeholder : null;
        const maxHeight = StyleSheet.flatten(this.props.containerStyles).maxHeight;
        const textInputContainerStyles = _.reduce(
            [
                styles.textInputContainer,
                ...this.props.textInputContainerStyles,
                this.props.autoGrow && StyleUtils.getWidthStyle(this.state.textInputWidth),
                !this.props.hideFocusedState && this.state.isFocused && styles.borderColorFocus,
                (this.props.hasError || this.props.errorText) && styles.borderColorDanger,
                this.props.autoGrowHeight && {scrollPaddingTop: 2 * maxHeight},
            ],
            (finalStyles, s) => ({...finalStyles, ...s}),
            {},
        );
        const isMultiline = this.props.multiline || this.props.autoGrowHeight;

        return (
            <>
                <View>
                    <PressableWithoutFeedback
                        onPress={this.onPress}
                        focusable={false}
                        accessibilityLabel={this.props.label}
                        style={[
                            this.props.autoGrowHeight && styles.autoGrowHeightInputContainer(this.state.textInputHeight, maxHeight),
                            !isMultiline && styles.componentHeightLarge,
                            ...this.props.containerStyles,
                        ]}
                    >
                        <View
                            // When autoGrowHeight is true we calculate the width for the textInput, so It will break lines properly
                            // or if multiline is not supplied we calculate the textinput height, using onLayout.
                            onLayout={(event) => {
                                if (!this.props.autoGrowHeight && this.props.multiline) {
                                    return;
                                }

                                const layout = event.nativeEvent.layout;

                                this.setState((prevState) => ({
                                    width: this.props.autoGrowHeight ? layout.width : prevState.width,
                                    height: !isMultiline ? layout.height : prevState.height,
                                }));
                            }}
                            style={[
                                textInputContainerStyles,

                                // When autoGrow is on and minWidth is not supplied, add a minWidth to allow the input to be focusable.
                                this.props.autoGrow && !textInputContainerStyles.minWidth && styles.mnw2,
                            ]}
                        >
                            {hasLabel ? (
                                <>
                                    {/* Adding this background to the label only for multiline text input,
                                    to prevent text overlapping with label when scrolling */}
                                    {isMultiline && (
                                        <View
                                            style={styles.textInputLabelBackground}
                                            pointerEvents="none"
                                        />
                                    )}
                                    <TextInputLabel
                                        isLabelActive={this.isLabelActive}
                                        label={this.props.label}
                                        labelTranslateY={this.state.labelTranslateY}
                                        labelScale={this.state.labelScale}
                                        for={this.props.nativeID}
                                    />
                                </>
                            ) : null}
                            <View
                                style={[styles.textInputAndIconContainer, isMultiline && hasLabel && styles.textInputMultilineContainer]}
                                pointerEvents="box-none"
                            >
                                {Boolean(this.props.prefixCharacter) && (
                                    <View style={styles.textInputPrefixWrapper}>
                                        <Text
                                            pointerEvents="none"
                                            selectable={false}
                                            style={[styles.textInputPrefix, !hasLabel && styles.pv0]}
                                            onLayout={this.storePrefixLayoutDimensions}
                                        >
                                            {this.props.prefixCharacter}
                                        </Text>
                                    </View>
                                )}
                                <RNTextInput
                                    ref={(ref) => {
                                        if (typeof this.props.innerRef === 'function') {
                                            this.props.innerRef(ref);
                                        } else if (this.props.innerRef && _.has(this.props.innerRef, 'current')) {
                                            this.props.innerRef.current = ref;
                                        }
                                        this.input = ref;
                                    }}
                                    // eslint-disable-next-line
                                    {...inputProps}
                                    autoCorrect={this.props.secureTextEntry ? false : this.props.autoCorrect}
                                    placeholder={placeholder}
                                    placeholderTextColor={themeColors.placeholderText}
                                    underlineColorAndroid="transparent"
                                    style={[
                                        styles.flex1,
                                        styles.w100,
                                        this.props.inputStyle,
                                        (!hasLabel || isMultiline) && styles.pv0,
                                        this.props.prefixCharacter && StyleUtils.getPaddingLeft(this.state.prefixWidth + styles.pl1.paddingLeft),
                                        this.props.secureTextEntry && styles.secureInput,

                                        // Explicitly remove `lineHeight` from single line inputs so that long text doesn't disappear
                                        // once it exceeds the input space (See https://github.com/Expensify/App/issues/13802)
                                        !isMultiline && {height: this.state.height, lineHeight: undefined},

                                        // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                        this.props.autoGrowHeight && StyleUtils.getAutoGrowHeightInputStyle(this.state.textInputHeight, maxHeight),
                                    ]}
                                    multiline={isMultiline}
                                    maxLength={this.props.maxLength}
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    onChangeText={this.setValue}
                                    secureTextEntry={this.state.passwordHidden}
                                    onPressOut={this.props.onPress}
                                    showSoftInputOnFocus={!this.props.disableKeyboard}
                                    keyboardType={getSecureEntryKeyboardType(this.props.keyboardType, this.props.secureTextEntry, this.state.passwordHidden)}
                                    value={this.state.value}
                                    selection={this.state.selection}
                                    editable={isEditable}
                                    // FormSubmit Enter key handler does not have access to direct props.
                                    // `dataset.submitOnEnter` is used to indicate that pressing Enter on this input should call the submit callback.
                                    dataSet={{submitOnEnter: isMultiline && this.props.submitOnEnter}}
                                />
                                {Boolean(this.props.secureTextEntry) && (
                                    <Checkbox
                                        style={styles.textInputIconContainer}
                                        onPress={this.togglePasswordVisibility}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <Icon
                                            src={this.state.passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                            fill={themeColors.icon}
                                        />
                                    </Checkbox>
                                )}
                                {!this.props.secureTextEntry && Boolean(this.props.icon) && (
                                    <View style={[styles.textInputIconContainer, isEditable ? styles.cursorPointer : styles.pointerEventsNone]}>
                                        <Icon
                                            src={this.props.icon}
                                            fill={themeColors.icon}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </PressableWithoutFeedback>
                    {!_.isEmpty(inputHelpText) && (
                        <FormHelpMessage
                            isError={!_.isEmpty(this.props.errorText)}
                            message={inputHelpText}
                        />
                    )}
                </View>
                {/*
                    Text input component doesn't support auto grow by default.
                    We're using a hidden text input to achieve that.
                    This text view is used to calculate width or height of the input value given textStyle in this component.
                    This Text component is intentionally positioned out of the screen.
                */}
                {(this.props.autoGrow || this.props.autoGrowHeight) && (
                    // Add +2 to width so that the first digit of amount do not cut off on mWeb - https://github.com/Expensify/App/issues/8158.
                    <Text
                        style={[
                            ...this.props.inputStyle,
                            this.props.autoGrowHeight && styles.autoGrowHeightHiddenInput(this.state.width, maxHeight),
                            styles.hiddenElementOutsideOfWindow,
                            styles.visibilityHidden,
                        ]}
                        onLayout={(e) => this.setState({textInputWidth: e.nativeEvent.layout.width + 2, textInputHeight: e.nativeEvent.layout.height})}
                    >
                        {this.state.value || this.props.placeholder}
                    </Text>
                )}
            </>
        );
    }
}

BaseTextInput.propTypes = baseTextInputPropTypes.propTypes;
BaseTextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default BaseTextInput;
