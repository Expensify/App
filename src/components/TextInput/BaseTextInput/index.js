import Str from 'expensify-common/lib/str';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Animated, StyleSheet, View} from 'react-native';
import _ from 'underscore';
import Checkbox from '@components/Checkbox';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RNTextInput from '@components/RNTextInput';
import SwipeInterceptPanResponder from '@components/SwipeInterceptPanResponder';
import Text from '@components/Text';
import * as styleConst from '@components/TextInput/styleConst';
import TextInputLabel from '@components/TextInput/TextInputLabel';
import withLocalize from '@components/withLocalize';
import * as Browser from '@libs/Browser';
import isInputAutoFilled from '@libs/isInputAutoFilled';
import useNativeDriver from '@libs/useNativeDriver';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';

function BaseTextInput(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const initialValue = props.value || props.defaultValue || '';
    const initialActiveLabel = props.forceActiveLabel || initialValue.length > 0 || Boolean(props.prefixCharacter);

    const [isFocused, setIsFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(props.secureTextEntry);
    const [textInputWidth, setTextInputWidth] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [height, setHeight] = useState(variables.componentSizeLarge);
    const [width, setWidth] = useState();
    const labelScale = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE)).current;
    const labelTranslateY = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y)).current;

    const input = useRef(null);
    const isLabelActive = useRef(initialActiveLabel);

    // AutoFocus which only works on mount:
    useEffect(() => {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!props.autoFocus || !input.current) {
            return;
        }

        if (props.shouldDelayFocus) {
            const focusTimeout = setTimeout(() => input.current.focus(), CONST.ANIMATED_TRANSITION);
            return () => clearTimeout(focusTimeout);
        }
        input.current.focus();
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animateLabel = useCallback(
        (translateY, scale) => {
            Animated.parallel([
                Animated.spring(labelTranslateY, {
                    toValue: translateY,
                    duration: styleConst.LABEL_ANIMATION_DURATION,
                    useNativeDriver,
                }),
                Animated.spring(labelScale, {
                    toValue: scale,
                    duration: styleConst.LABEL_ANIMATION_DURATION,
                    useNativeDriver,
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

    // The ref is needed when the component is uncontrolled and we don't have a value prop
    const hasValueRef = useRef(initialValue.length > 0);
    const inputValue = props.value || '';
    const hasValue = inputValue.length > 0 || hasValueRef.current;

    // Activate or deactivate the label when either focus changes, or for controlled
    // components when the value prop changes:
    useEffect(() => {
        if (
            hasValue ||
            isFocused ||
            // If the text has been supplied by Chrome autofill, the value state is not synced with the value
            // as Chrome doesn't trigger a change event. When there is autofill text, keep the label activated.
            isInputAutoFilled(input.current)
        ) {
            activateLabel();
        } else {
            deactivateLabel();
        }
    }, [activateLabel, deactivateLabel, hasValue, isFocused]);

    // When the value prop gets cleared externally, we need to keep the ref in sync:
    useEffect(() => {
        // Return early when component uncontrolled, or we still have a value
        if (props.value === undefined || !_.isEmpty(props.value)) {
            return;
        }
        hasValueRef.current = false;
    }, [props.value]);

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
            // When the componment is uncontrolled, we need to manually activate the label:
            if (props.value === undefined) {
                activateLabel();
            }
        } else {
            hasValueRef.current = false;
        }
    };

    const togglePasswordVisibility = useCallback(() => {
        setPasswordHidden((prevPasswordHidden) => !prevPasswordHidden);
    }, []);

    // When adding a new prefix character, adjust this method to add expected character width.
    // This is because character width isn't known before it's rendered to the screen, and once it's rendered,
    // it's too late to calculate it's width because the change in padding would cause a visible jump.
    // Some characters are wider than the others when rendered, e.g. '@' vs '#'. Chosen font-family and font-size
    // also have an impact on the width of the character, but as long as there's only one font-family and one font-size,
    // this method will produce reliable results.
    const getCharacterPadding = (prefix) => {
        switch (prefix) {
            case CONST.POLICY.ROOM_PREFIX:
                return 10;
            default:
                throw new Error(`Prefix ${prefix} has no padding assigned.`);
        }
    };

    // eslint-disable-next-line react/forbid-foreign-prop-types
    const inputProps = _.omit(props, _.keys(baseTextInputPropTypes.propTypes));
    const hasLabel = Boolean(props.label.length);
    const isReadOnly = _.isUndefined(props.readOnly) ? props.disabled : props.readOnly;
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

    /* To prevent text jumping caused by virtual DOM calculations on Safari and mobile Chrome,
  make sure to include the `lineHeight`.
  Reference: https://github.com/Expensify/App/issues/26735
    For other platforms, explicitly remove `lineHeight` from single-line inputs
  to prevent long text from disappearing once it exceeds the input space.
  See https://github.com/Expensify/App/issues/13802 */

    const lineHeight = useMemo(() => {
        if ((Browser.isSafari() || Browser.isMobileChrome()) && _.isArray(props.inputStyle)) {
            const lineHeightValue = _.find(props.inputStyle, (f) => f.lineHeight !== undefined);
            if (lineHeightValue) {
                return lineHeightValue.lineHeight;
            }
        }

        return undefined;
    }, [props.inputStyle]);

    return (
        <>
            <View
                style={[styles.pointerEventsNone, ...props.containerStyles]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props.shouldInterceptSwipe && SwipeInterceptPanResponder.panHandlers)}
            >
                <PressableWithoutFeedback
                    onPress={onPress}
                    tabIndex={-1}
                    accessibilityLabel={props.label}
                    style={[
                        props.autoGrowHeight && styles.autoGrowHeightInputContainer(textInputHeight, variables.componentSizeLarge, maxHeight),
                        !isMultiline && styles.componentHeightLarge,
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
                                {isMultiline && <View style={[styles.textInputLabelBackground, styles.pointerEventsNone]} />}
                                <TextInputLabel
                                    isLabelActive={isLabelActive.current}
                                    label={props.label}
                                    labelTranslateY={labelTranslateY}
                                    labelScale={labelScale}
                                    for={props.nativeID}
                                />
                            </>
                        ) : null}
                        <View style={[styles.textInputAndIconContainer, isMultiline && hasLabel && styles.textInputMultilineContainer, styles.pointerEventsBoxNone]}>
                            {Boolean(props.prefixCharacter) && (
                                <View style={styles.textInputPrefixWrapper}>
                                    <Text
                                        tabIndex={-1}
                                        style={[styles.textInputPrefix, !hasLabel && styles.pv0, styles.pointerEventsNone]}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
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
                                placeholderTextColor={theme.placeholderText}
                                underlineColorAndroid="transparent"
                                style={[
                                    styles.flex1,
                                    styles.w100,
                                    props.inputStyle,
                                    (!hasLabel || isMultiline) && styles.pv0,
                                    props.prefixCharacter && StyleUtils.getPaddingLeft(getCharacterPadding(props.prefixCharacter) + styles.pl1.paddingLeft),
                                    props.secureTextEntry && styles.secureInput,

                                    // Explicitly remove `lineHeight` from single line inputs so that long text doesn't disappear
                                    // once it exceeds the input space (See https://github.com/Expensify/App/issues/13802)
                                    !isMultiline && {height, lineHeight},

                                    // Explicitly change boxSizing attribute for mobile chrome in order to apply line-height
                                    // for the issue mentioned here https://github.com/Expensify/App/issues/26735
                                    !isMultiline && Browser.isMobileChrome() && {boxSizing: 'content-box', height: undefined},

                                    // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                    props.autoGrowHeight && StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, maxHeight),
                                    // Add disabled color theme when field is not editable.
                                    props.disabled && styles.textInputDisabled,
                                    styles.pointerEventsAuto,
                                ]}
                                multiline={isMultiline}
                                maxLength={props.maxLength}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                onChangeText={setValue}
                                secureTextEntry={passwordHidden}
                                onPressOut={props.onPress}
                                showSoftInputOnFocus={!props.disableKeyboard}
                                inputMode={props.inputMode}
                                value={props.value}
                                selection={props.selection}
                                readOnly={isReadOnly}
                                defaultValue={props.defaultValue}
                                // FormSubmit Enter key handler does not have access to direct props.
                                // `dataset.submitOnEnter` is used to indicate that pressing Enter on this input should call the submit callback.
                                dataSet={{submitOnEnter: isMultiline && props.submitOnEnter}}
                            />
                            {props.isLoading && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.iconSuccessFill}
                                    style={[styles.mt4, styles.ml1]}
                                />
                            )}
                            {Boolean(props.secureTextEntry) && (
                                <Checkbox
                                    style={[styles.flex1, styles.textInputIconContainer]}
                                    onPress={togglePasswordVisibility}
                                    onMouseDown={(e) => e.preventDefault()}
                                    accessibilityLabel={props.translate('common.visible')}
                                >
                                    <Icon
                                        src={passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                        fill={theme.icon}
                                    />
                                </Checkbox>
                            )}
                            {!props.secureTextEntry && Boolean(props.icon) && (
                                <View style={[styles.textInputIconContainer, !isReadOnly ? styles.cursorPointer : styles.pointerEventsNone]}>
                                    <Icon
                                        src={props.icon}
                                        fill={theme.icon}
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
                // Add +2 to width on Safari browsers so that text is not cut off due to the cursor or when changing the value
                // https://github.com/Expensify/App/issues/8158
                // https://github.com/Expensify/App/issues/26628
                <Text
                    style={[...props.inputStyle, props.autoGrowHeight && styles.autoGrowHeightHiddenInput(width, maxHeight), styles.hiddenElementOutsideOfWindow, styles.visibilityHidden]}
                    onLayout={(e) => {
                        let additionalWidth = 0;
                        if (Browser.isMobileSafari() || Browser.isSafari()) {
                            additionalWidth = 2;
                        }
                        setTextInputWidth(e.nativeEvent.layout.width + additionalWidth);
                        setTextInputHeight(e.nativeEvent.layout.height);
                    }}
                >
                    {/* \u200B added to solve the issue of not expanding the text input enough when the value ends with '\n' (https://github.com/Expensify/App/issues/21271) */}
                    {props.value ? `${props.value}${props.value.endsWith('\n') ? '\u200B' : ''}` : props.placeholder}
                </Text>
            )}
        </>
    );
}

BaseTextInput.displayName = 'BaseTextInput';
BaseTextInput.propTypes = baseTextInputPropTypes.propTypes;
BaseTextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default withLocalize(BaseTextInput);
