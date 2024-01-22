import Str from 'expensify-common/lib/str';
import React, {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Animated, StyleSheet, View} from 'react-native';
import type {GestureResponderEvent, LayoutChangeEvent, NativeSyntheticEvent, StyleProp, TextInput, TextInputFocusEventData, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RNTextInput from '@components/RNTextInput';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import SwipeInterceptPanResponder from '@components/SwipeInterceptPanResponder';
import Text from '@components/Text';
import * as styleConst from '@components/TextInput/styleConst';
import TextInputLabel from '@components/TextInput/TextInputLabel';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getSecureEntryKeyboardType from '@libs/getSecureEntryKeyboardType';
import isInputAutoFilled from '@libs/isInputAutoFilled';
import useNativeDriver from '@libs/useNativeDriver';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BaseTextInputProps, BaseTextInputRef} from './types';

function BaseTextInput(
    {
        label = '',
        /**
         * To be able to function as either controlled or uncontrolled component we should not
         * assign a default prop value for `value` or `defaultValue` props
         */
        value = undefined,
        defaultValue = undefined,
        placeholder = '',
        errorText = '',
        icon = null,
        textInputContainerStyles,
        touchableInputWrapperStyle,
        containerStyles,
        inputStyle,
        forceActiveLabel = false,
        autoFocus = false,
        disableKeyboard = false,
        autoGrow = false,
        autoGrowHeight = false,
        hideFocusedState = false,
        maxLength = undefined,
        hint = '',
        onInputChange = () => {},
        shouldDelayFocus = false,
        submitOnEnter = false,
        multiline = false,
        shouldInterceptSwipe = false,
        autoCorrect = true,
        prefixCharacter = '',
        inputID,
        ...props
    }: BaseTextInputProps,
    ref: BaseTextInputRef,
) {
    const inputProps = {shouldSaveDraft: false, shouldUseDefaultValue: false, ...props};
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {hasError = false} = inputProps;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const initialValue = value || defaultValue || '';
    const initialActiveLabel = !!forceActiveLabel || initialValue.length > 0 || !!prefixCharacter;
    const isMultiline = multiline || autoGrowHeight;

    const [isFocused, setIsFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(inputProps.secureTextEntry);
    const [textInputWidth, setTextInputWidth] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [height, setHeight] = useState<number>(variables.componentSizeLarge);
    const [width, setWidth] = useState<number | null>(null);
    const labelScale = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE)).current;
    const labelTranslateY = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y)).current;
    const input = useRef<TextInput>(null);
    const isLabelActive = useRef(initialActiveLabel);

    // AutoFocus which only works on mount:
    useEffect(() => {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!autoFocus || !input.current) {
            return;
        }

        if (shouldDelayFocus) {
            const focusTimeout = setTimeout(() => input.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => clearTimeout(focusTimeout);
        }
        input.current.focus();
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animateLabel = useCallback(
        (translateY: number, scale: number) => {
            Animated.parallel([
                Animated.spring(labelTranslateY, {
                    toValue: translateY,
                    useNativeDriver,
                }),
                Animated.spring(labelScale, {
                    toValue: scale,
                    useNativeDriver,
                }),
            ]).start();
        },
        [labelScale, labelTranslateY],
    );

    const activateLabel = useCallback(() => {
        const inputValue = value ?? '';

        if (inputValue.length < 0 || isLabelActive.current) {
            return;
        }

        animateLabel(styleConst.ACTIVE_LABEL_TRANSLATE_Y, styleConst.ACTIVE_LABEL_SCALE);
        isLabelActive.current = true;
    }, [animateLabel, value]);

    const deactivateLabel = useCallback(() => {
        const inputValue = value ?? '';

        if (!!forceActiveLabel || inputValue.length !== 0 || prefixCharacter) {
            return;
        }

        animateLabel(styleConst.INACTIVE_LABEL_TRANSLATE_Y, styleConst.INACTIVE_LABEL_SCALE);
        isLabelActive.current = false;
    }, [animateLabel, forceActiveLabel, prefixCharacter, value]);

    const onFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        inputProps.onFocus?.(event);
        setIsFocused(true);
    };

    const onBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        inputProps.onBlur?.(event);
        setIsFocused(false);
    };

    const onPress = (event?: GestureResponderEvent | KeyboardEvent) => {
        if (!!inputProps.disabled || !event) {
            return;
        }

        inputProps.onPress?.(event);

        if ('isDefaultPrevented' in event && !event?.isDefaultPrevented()) {
            input.current?.focus();
        }
    };

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            if (!autoGrowHeight && multiline) {
                return;
            }

            const layout = event.nativeEvent.layout;

            setWidth((prevWidth: number | null) => (autoGrowHeight ? layout.width : prevWidth));
            setHeight((prevHeight: number) => (!multiline ? layout.height : prevHeight));
        },
        [autoGrowHeight, multiline],
    );

    // The ref is needed when the component is uncontrolled and we don't have a value prop
    const hasValueRef = useRef(initialValue.length > 0);
    const inputValue = value ?? '';
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
        if (value === undefined || value) {
            return;
        }
        hasValueRef.current = false;
    }, [value]);

    /**
     * Set Value & activateLabel
     */
    const setValue = (newValue: string) => {
        const formattedValue = isMultiline ? newValue : newValue.replace(/\n/g, ' ');

        onInputChange?.(formattedValue);

        if (inputProps.onChangeText) {
            Str.result(inputProps.onChangeText, formattedValue);
        }

        if (formattedValue && formattedValue.length > 0) {
            hasValueRef.current = true;
            // When the component is uncontrolled, we need to manually activate the label:
            if (value === undefined) {
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
    const getCharacterPadding = (prefix: string): number => {
        switch (prefix) {
            case CONST.POLICY.ROOM_PREFIX:
                return 10;
            default:
                throw new Error(`Prefix ${prefix} has no padding assigned.`);
        }
    };

    const hasLabel = Boolean(label?.length);
    const isReadOnly = inputProps.readOnly ?? inputProps.disabled;
    const inputHelpText = errorText || hint;
    const placeholderValue = !!prefixCharacter || isFocused || !hasLabel || (hasLabel && forceActiveLabel) ? placeholder : undefined;
    const maxHeight = StyleSheet.flatten(containerStyles)?.maxHeight;
    const newTextInputContainerStyles: StyleProp<ViewStyle> = StyleSheet.flatten([
        styles.textInputContainer,
        textInputContainerStyles,
        autoGrow && StyleUtils.getWidthStyle(textInputWidth),
        !hideFocusedState && isFocused && styles.borderColorFocus,
        (!!hasError || !!errorText) && styles.borderColorDanger,
        autoGrowHeight && {scrollPaddingTop: typeof maxHeight === 'number' ? 2 * maxHeight : undefined},
    ]);

    return (
        <>
            <View
                style={[styles.pointerEventsNone, containerStyles]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(shouldInterceptSwipe && SwipeInterceptPanResponder.panHandlers)}
            >
                <PressableWithoutFeedback
                    onPress={onPress}
                    tabIndex={-1}
                    accessibilityLabel={label}
                    style={[
                        autoGrowHeight && styles.autoGrowHeightInputContainer(textInputHeight, variables.componentSizeLarge, typeof maxHeight === 'number' ? maxHeight : 0),
                        !isMultiline && styles.componentHeightLarge,
                        touchableInputWrapperStyle,
                    ]}
                >
                    <View
                        // When autoGrowHeight is true we calculate the width for the textInput, so it will break lines properly
                        // or if multiline is not supplied we calculate the textinput height, using onLayout.
                        onLayout={onLayout}
                        style={[
                            newTextInputContainerStyles,

                            // When autoGrow is on and minWidth is not supplied, add a minWidth to allow the input to be focusable.
                            autoGrow && !newTextInputContainerStyles?.minWidth && styles.mnw2,
                        ]}
                    >
                        {hasLabel ? (
                            <>
                                {/* Adding this background to the label only for multiline text input,
                to prevent text overlapping with label when scrolling */}
                                {isMultiline && <View style={[styles.textInputLabelBackground, styles.pointerEventsNone]} />}
                                <TextInputLabel
                                    isLabelActive={isLabelActive.current}
                                    label={label}
                                    labelTranslateY={labelTranslateY}
                                    labelScale={labelScale}
                                    for={inputProps.nativeID}
                                />
                            </>
                        ) : null}
                        <View style={[styles.textInputAndIconContainer, isMultiline && hasLabel && styles.textInputMultilineContainer, styles.pointerEventsBoxNone]}>
                            {!!prefixCharacter && (
                                <View style={styles.textInputPrefixWrapper}>
                                    <Text
                                        tabIndex={-1}
                                        style={[styles.textInputPrefix, !hasLabel && styles.pv0, styles.pointerEventsNone]}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    >
                                        {prefixCharacter}
                                    </Text>
                                </View>
                            )}
                            <RNTextInput
                                ref={(element) => {
                                    if (typeof ref === 'function') {
                                        ref(element);
                                    } else if (ref && 'current' in ref) {
                                        // eslint-disable-next-line no-param-reassign
                                        ref.current = element;
                                    }

                                    (input.current as AnimatedTextInputRef | null) = element;
                                }}
                                // eslint-disable-next-line
                                {...inputProps}
                                autoCorrect={inputProps.secureTextEntry ? false : autoCorrect}
                                placeholder={placeholderValue}
                                placeholderTextColor={theme.placeholderText}
                                underlineColorAndroid="transparent"
                                style={[
                                    styles.flex1,
                                    styles.w100,
                                    inputStyle,
                                    (!hasLabel || isMultiline) && styles.pv0,
                                    !!prefixCharacter && StyleUtils.getPaddingLeft(getCharacterPadding(prefixCharacter) + styles.pl1.paddingLeft),
                                    inputProps.secureTextEntry && styles.secureInput,

                                    !isMultiline && {height, lineHeight: undefined},

                                    // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                    ...(autoGrowHeight
                                        ? [StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, typeof maxHeight === 'number' ? maxHeight : 0), styles.verticalAlignTop]
                                        : []),
                                    // Add disabled color theme when field is not editable.
                                    inputProps.disabled && styles.textInputDisabled,
                                    styles.pointerEventsAuto,
                                ]}
                                multiline={isMultiline}
                                maxLength={maxLength}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                onChangeText={setValue}
                                secureTextEntry={passwordHidden}
                                onPressOut={inputProps.onPress}
                                showSoftInputOnFocus={!disableKeyboard}
                                keyboardType={getSecureEntryKeyboardType(inputProps.keyboardType, inputProps.secureTextEntry ?? false, passwordHidden ?? false)}
                                inputMode={!disableKeyboard ? inputProps.inputMode : CONST.INPUT_MODE.NONE}
                                value={value}
                                selection={inputProps.selection}
                                readOnly={isReadOnly}
                                defaultValue={defaultValue}
                                // FormSubmit Enter key handler does not have access to direct props.
                                // `dataset.submitOnEnter` is used to indicate that pressing Enter on this input should call the submit callback.
                                dataSet={{submitOnEnter: isMultiline && submitOnEnter}}
                            />
                            {inputProps.isLoading && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.iconSuccessFill}
                                    style={[styles.mt4, styles.ml1]}
                                />
                            )}
                            {!!inputProps.secureTextEntry && (
                                <Checkbox
                                    style={[styles.flex1, styles.textInputIconContainer]}
                                    onPress={togglePasswordVisibility}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                    }}
                                    accessibilityLabel={translate('common.visible')}
                                >
                                    <Icon
                                        src={passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                        fill={theme.icon}
                                    />
                                </Checkbox>
                            )}
                            {!inputProps.secureTextEntry && icon && (
                                <View style={[styles.textInputIconContainer, !isReadOnly ? styles.cursorPointer : styles.pointerEventsNone]}>
                                    <Icon
                                        src={icon}
                                        fill={theme.icon}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </PressableWithoutFeedback>
                {!!inputHelpText && (
                    <FormHelpMessage
                        isError={!!errorText}
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
            {(!!autoGrow || autoGrowHeight) && (
                // Add +2 to width on Safari browsers so that text is not cut off due to the cursor or when changing the value
                // https://github.com/Expensify/App/issues/8158
                // https://github.com/Expensify/App/issues/26628
                <Text
                    style={[
                        inputStyle,
                        autoGrowHeight && styles.autoGrowHeightHiddenInput(width ?? 0, typeof maxHeight === 'number' ? maxHeight : undefined),
                        styles.hiddenElementOutsideOfWindow,
                        styles.visibilityHidden,
                    ]}
                    onLayout={(e) => {
                        setTextInputWidth(e.nativeEvent.layout.width);
                        setTextInputHeight(e.nativeEvent.layout.height);
                    }}
                >
                    {/* \u200B added to solve the issue of not expanding the text input enough when the value ends with '\n' (https://github.com/Expensify/App/issues/21271) */}
                    {value ? `${value}${value.endsWith('\n') ? '\u200B' : ''}` : placeholder}
                </Text>
            )}
        </>
    );
}

BaseTextInput.displayName = 'BaseTextInput';

export default forwardRef(BaseTextInput);
