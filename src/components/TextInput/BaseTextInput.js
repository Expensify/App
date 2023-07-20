import _ from 'underscore';
import React, {useState, useRef, useEffect, useCallback} from 'react';
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
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import withLocalize from '../withLocalize';

function BaseTextInput(props) {
    const inputValue = props.value || props.defaultValue || '';
    const initialActiveLabel = props.forceActiveLabel || inputValue.length > 0 || Boolean(props.prefixCharacter);

    const [isFocused, setIsFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(props.secureTextEntry);
    const [textInputWidth, setTextInputWidth] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [prefixWidth, setPrefixWidth] = useState(0);
    const [height, setHeight] = useState(variables.componentSizeLarge);
    const [width, setWidth] = useState();
    const labelScale = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE)).current;
    const labelTranslateY = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y)).current;

    const input = useRef(null);
    const isLabelActive = useRef(initialActiveLabel);

    useEffect(() => {
        if (!props.disableKeyboard) {
            return;
        }

        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (!nextAppState.match(/inactive|background/)) {
                return;
            }

            Keyboard.dismiss();
        });

        return () => {
            appStateSubscription.remove();
        };
    }, [props.disableKeyboard]);

    // AutoFocus which only works on mount:
    useEffect(() => {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!props.autoFocus || !input.current) {
            return;
        }

        let focusTimeout;
        if (props.shouldDelayFocus) {
            focusTimeout = setTimeout(() => input.current.focus(), CONST.ANIMATED_TRANSITION);
            return;
        }
        input.current.focus();

        return () => {
            if (!focusTimeout) {
                return;
            }
            clearTimeout(focusTimeout);
        };
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animateLabel = useCallback(
        (translateY, scale) => {
            Animated.parallel([
                Animated.spring(labelTranslateY, {
                    toValue: translateY,
                    duration: styleConst.LABEL_ANIMATION_DURATION,
                    useNativeDriver: true,
                }),
                Animated.spring(labelScale, {
                    toValue: scale,
                    duration: styleConst.LABEL_ANIMATION_DURATION,
                    useNativeDriver: true,
                }),
            ]).start();
        },
        [labelScale, labelTranslateY],
    );

    const activateLabel = useCallback(() => {
        const value = props.value || '';

        if (value.length < 0 || isLabelActive.current) {
            return;
        }

        animateLabel(styleConst.ACTIVE_LABEL_TRANSLATE_Y, styleConst.ACTIVE_LABEL_SCALE);
        isLabelActive.current = true;
    }, [animateLabel, props.value]);

    const deactivateLabel = useCallback(() => {
        const value = props.value || '';

        if (props.forceActiveLabel || value.length !== 0 || props.prefixCharacter) {
            return;
        }

        animateLabel(styleConst.INACTIVE_LABEL_TRANSLATE_Y, styleConst.INACTIVE_LABEL_SCALE);
        isLabelActive.current = false;
    }, [animateLabel, props.forceActiveLabel, props.prefixCharacter, props.value]);

    const onFocus = (event) => {
        if (props.onFocus) {
            props.onFocus(event);
        }
        setIsFocused(true);
    };

    const onBlur = (event) => {
        if (props.onBlur) {
            props.onBlur(event);
        }
        setIsFocused(false);

        // If the text has been supplied by Chrome autofill, the value state is not synced with the value
        // as Chrome doesn't trigger a change event. When there is autofill text, don't deactivate label.
        if (!isInputAutoFilled(input.current)) {
            deactivateLabel();
        }
    };

    const onPress = (event) => {
        if (props.disabled) {
            return;
        }

        if (props.onPress) {
            props.onPress(event);
        }

        if (!event.isDefaultPrevented()) {
            input.current.focus();
        }
    };

    const onLayout = useCallback(
        (event) => {
            if (!props.autoGrowHeight && props.multiline) {
                return;
            }

            const layout = event.nativeEvent.layout;

            setWidth((prevWidth) => (props.autoGrowHeight ? layout.width : prevWidth));
            setHeight((prevHeight) => (!props.multiline ? layout.height : prevHeight));
        },
        [props.autoGrowHeight, props.multiline],
    );

    useEffect(() => {
        // Handle side effects when the value gets changed programatically from the outside

        // In some cases, When the value prop is empty, it is not properly updated on the TextInput due to its uncontrolled nature, thus manually clearing the TextInput.
        if (inputValue === '') {
            input.current.clear();
        }

        if (inputValue) {
            activateLabel();
        }
    }, [activateLabel, inputValue]);

    // We capture whether the input has a value or not in a ref.
    // It gets updated when the text gets changed.
    const hasValueRef = useRef(inputValue.length > 0);

    // Activate or deactivate the label when the focus changes:
    useEffect(() => {
        // We can't use inputValue here directly, as it might contain
        // the defaultValue, which doesn't get updated when the text changes.
        // We can't use props.value either, as it might be undefined.
        if (hasValueRef.current || isFocused) {
            activateLabel();
        } else if (!hasValueRef.current && !isFocused) {
            deactivateLabel();
        }
    }, [activateLabel, deactivateLabel, inputValue, isFocused]);

    /**
     * Set Value & activateLabel
     *
     * @param {String} value
     * @memberof BaseTextInput
     */
    const setValue = (value) => {
        if (props.onInputChange) {
            props.onInputChange(value);
        }

        Str.result(props.onChangeText, value);
        if (value && value.length > 0) {
            hasValueRef.current = true;
            activateLabel();
        } else {
            hasValueRef.current = false;
        }
    };

    const togglePasswordVisibility = useCallback(() => {
        setPasswordHidden((prevPasswordHidden) => !prevPasswordHidden);
    }, []);

    const storePrefixLayoutDimensions = useCallback((event) => {
        setPrefixWidth(Math.abs(event.nativeEvent.layout.width));
    }, []);

    // eslint-disable-next-line react/forbid-foreign-prop-types
    const inputProps = _.omit(props, _.keys(baseTextInputPropTypes.propTypes));
    const hasLabel = Boolean(props.label.length);
    const isEditable = _.isUndefined(props.editable) ? !props.disabled : props.editable;
    const inputHelpText = props.errorText || props.hint;
    const placeholder = props.prefixCharacter || isFocused || !hasLabel || (hasLabel && props.forceActiveLabel) ? props.placeholder : null;
    const maxHeight = StyleSheet.flatten(props.containerStyles).maxHeight;
    const textInputContainerStyles = StyleSheet.flatten([
        styles.textInputContainer,
        ...props.textInputContainerStyles,
        props.autoGrow && StyleUtils.getWidthStyle(textInputWidth),
        !props.hideFocusedState && isFocused && styles.borderColorFocus,
        (props.hasError || props.errorText) && styles.borderColorDanger,
        props.autoGrowHeight && {scrollPaddingTop: 2 * maxHeight},
    ]);
    const isMultiline = props.multiline || props.autoGrowHeight;

    return (
        <>
            <View style={styles.pointerEventsNone}>
                <PressableWithoutFeedback
                    onPress={onPress}
                    focusable={false}
                    accessibilityLabel={props.label}
                    style={[
                        props.autoGrowHeight && styles.autoGrowHeightInputContainer(textInputHeight, variables.componentSizeLarge, maxHeight),
                        !isMultiline && styles.componentHeightLarge,
                        ...props.containerStyles,
                    ]}
                >
                    <View
                        // When autoGrowHeight is true we calculate the width for the textInput, so it will break lines properly
                        // or if multiline is not supplied we calculate the textinput height, using onLayout.
                        onLayout={onLayout}
                        style={[
                            textInputContainerStyles,

                            // When autoGrow is on and minWidth is not supplied, add a minWidth to allow the input to be focusable.
                            props.autoGrow && !textInputContainerStyles.minWidth && styles.mnw2,
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
                                    isLabelActive={isLabelActive.current}
                                    label={props.label}
                                    labelTranslateY={labelTranslateY}
                                    labelScale={labelScale}
                                    for={props.nativeID}
                                />
                            </>
                        ) : null}
                        <View
                            style={[styles.textInputAndIconContainer, isMultiline && hasLabel && styles.textInputMultilineContainer]}
                            pointerEvents="box-none"
                        >
                            {Boolean(props.prefixCharacter) && (
                                <View style={styles.textInputPrefixWrapper}>
                                    <Text
                                        pointerEvents="none"
                                        selectable={false}
                                        style={[styles.textInputPrefix, !hasLabel && styles.pv0]}
                                        onLayout={storePrefixLayoutDimensions}
                                    >
                                        {props.prefixCharacter}
                                    </Text>
                                </View>
                            )}
                            <RNTextInput
                                ref={(ref) => {
                                    if (typeof props.innerRef === 'function') {
                                        props.innerRef(ref);
                                    } else if (props.innerRef && _.has(props.innerRef, 'current')) {
                                        // eslint-disable-next-line no-param-reassign
                                        props.innerRef.current = ref;
                                    }
                                    input.current = ref;
                                }}
                                // eslint-disable-next-line
                                {...inputProps}
                                autoCorrect={props.secureTextEntry ? false : props.autoCorrect}
                                placeholder={placeholder}
                                placeholderTextColor={themeColors.placeholderText}
                                underlineColorAndroid="transparent"
                                style={[
                                    styles.flex1,
                                    styles.w100,
                                    props.inputStyle,
                                    (!hasLabel || isMultiline) && styles.pv0,
                                    props.prefixCharacter && StyleUtils.getPaddingLeft(prefixWidth + styles.pl1.paddingLeft),
                                    props.secureTextEntry && styles.secureInput,

                                    // Explicitly remove `lineHeight` from single line inputs so that long text doesn't disappear
                                    // once it exceeds the input space (See https://github.com/Expensify/App/issues/13802)
                                    !isMultiline && {height, lineHeight: undefined},

                                    // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                    props.autoGrowHeight && StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, maxHeight),
                                ]}
                                multiline={isMultiline}
                                maxLength={props.maxLength}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                onChangeText={setValue}
                                secureTextEntry={passwordHidden}
                                onPressOut={props.onPress}
                                showSoftInputOnFocus={!props.disableKeyboard}
                                keyboardType={getSecureEntryKeyboardType(props.keyboardType, props.secureTextEntry, passwordHidden)}
                                value={props.value}
                                selection={props.selection}
                                editable={isEditable}
                                defaultValue={props.defaultValue}
                                // FormSubmit Enter key handler does not have access to direct props.
                                // `dataset.submitOnEnter` is used to indicate that pressing Enter on this input should call the submit callback.
                                dataSet={{submitOnEnter: isMultiline && props.submitOnEnter}}
                            />
                            {Boolean(props.secureTextEntry) && (
                                <Checkbox
                                    style={[styles.flex1, styles.textInputIconContainer]}
                                    onPress={togglePasswordVisibility}
                                    onMouseDown={(e) => e.preventDefault()}
                                    accessibilityLabel={props.translate('common.visible')}
                                >
                                    <Icon
                                        src={passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                        fill={themeColors.icon}
                                    />
                                </Checkbox>
                            )}
                            {!props.secureTextEntry && Boolean(props.icon) && (
                                <View style={[styles.textInputIconContainer, isEditable ? styles.cursorPointer : styles.pointerEventsNone]}>
                                    <Icon
                                        src={props.icon}
                                        fill={themeColors.icon}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </PressableWithoutFeedback>
                {!_.isEmpty(inputHelpText) && (
                    <FormHelpMessage
                        isError={!_.isEmpty(props.errorText)}
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
            {(props.autoGrow || props.autoGrowHeight) && (
                // Add +2 to width so that the first digit of amount do not cut off on mWeb - https://github.com/Expensify/App/issues/8158.
                <Text
                    style={[...props.inputStyle, props.autoGrowHeight && styles.autoGrowHeightHiddenInput(width, maxHeight), styles.hiddenElementOutsideOfWindow, styles.visibilityHidden]}
                    onLayout={(e) => {
                        setTextInputWidth(e.nativeEvent.layout.width + 2);
                        setTextInputHeight(e.nativeEvent.layout.height);
                    }}
                >
                    {props.value || props.placeholder}
                </Text>
            )}
        </>
    );
}

BaseTextInput.displayName = 'BaseTextInput';
BaseTextInput.propTypes = baseTextInputPropTypes.propTypes;
BaseTextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default withLocalize(BaseTextInput);
