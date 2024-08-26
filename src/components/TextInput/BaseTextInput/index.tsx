import {Str} from 'expensify-common';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, NativeSyntheticEvent, StyleProp, TextInputFocusEventData, ViewStyle} from 'react-native';
import {ActivityIndicator, Animated, StyleSheet, View} from 'react-native';
import Checkbox from '@components/Checkbox';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RNTextInput from '@components/RNTextInput';
import SwipeInterceptPanResponder from '@components/SwipeInterceptPanResponder';
import Text from '@components/Text';
import * as styleConst from '@components/TextInput/styleConst';
import TextInputClearButton from '@components/TextInput/TextInputClearButton';
import TextInputLabel from '@components/TextInput/TextInputLabel';
import useLocalize from '@hooks/useLocalize';
import useMarkdownStyle from '@hooks/useMarkdownStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
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
        iconLeft = null,
        textInputContainerStyles,
        touchableInputWrapperStyle,
        containerStyles,
        inputStyle,
        forceActiveLabel = false,
        autoFocus = false,
        disableKeyboard = false,
        autoGrow = false,
        autoGrowHeight = false,
        maxAutoGrowHeight,
        hideFocusedState = false,
        maxLength = undefined,
        hint = '',
        onInputChange = () => {},
        shouldDelayFocus = false,
        multiline = false,
        shouldInterceptSwipe = false,
        autoCorrect = true,
        prefixCharacter = '',
        suffixCharacter = '',
        inputID,
        isMarkdownEnabled = false,
        excludedMarkdownStyles = [],
        shouldShowClearButton = false,
        prefixContainerStyle = [],
        prefixStyle = [],
        suffixContainerStyle = [],
        suffixStyle = [],
        contentWidth,
        ...inputProps
    }: BaseTextInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const InputComponent = isMarkdownEnabled ? RNMarkdownTextInput : RNTextInput;

    const theme = useTheme();
    const styles = useThemeStyles();
    const markdownStyle = useMarkdownStyle(undefined, excludedMarkdownStyles);
    const {hasError = false} = inputProps;
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    // Disabling this line for saftiness as nullish coalescing works only if value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const initialValue = value || defaultValue || '';
    const initialActiveLabel = !!forceActiveLabel || initialValue.length > 0 || !!prefixCharacter || !!suffixCharacter;

    const [isFocused, setIsFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(inputProps.secureTextEntry);
    const [textInputWidth, setTextInputWidth] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [height, setHeight] = useState<number>(variables.componentSizeLarge);
    const [width, setWidth] = useState<number | null>(null);
    const labelScale = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE)).current;
    const labelTranslateY = useRef(new Animated.Value(initialActiveLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y)).current;
    const input = useRef<HTMLInputElement | null>(null);
    const isLabelActive = useRef(initialActiveLabel);

    // AutoFocus which only works on mount:
    useEffect(() => {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!autoFocus || !input.current) {
            return;
        }

        if (shouldDelayFocus) {
            const focusTimeout = setTimeout(() => input?.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => clearTimeout(focusTimeout);
        }
        input.current.focus();
        // We only want this to run on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
        const newValue = value ?? '';

        if (newValue.length < 0 || isLabelActive.current) {
            return;
        }

        animateLabel(styleConst.ACTIVE_LABEL_TRANSLATE_Y, styleConst.ACTIVE_LABEL_SCALE);
        isLabelActive.current = true;
    }, [animateLabel, value]);

    const deactivateLabel = useCallback(() => {
        const newValue = value ?? '';

        if (!!forceActiveLabel || newValue.length !== 0 || prefixCharacter || suffixCharacter) {
            return;
        }

        animateLabel(styleConst.INACTIVE_LABEL_TRANSLATE_Y, styleConst.INACTIVE_LABEL_SCALE);
        isLabelActive.current = false;
    }, [animateLabel, forceActiveLabel, prefixCharacter, suffixCharacter, value]);

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
        onInputChange?.(newValue);

        if (inputProps.onChangeText) {
            Str.result(inputProps.onChangeText, newValue);
        }
        if (newValue && newValue.length > 0) {
            hasValueRef.current = true;
            // When the componment is uncontrolled, we need to manually activate the label:
            if (value === undefined) {
                activateLabel();
            }
        } else {
            hasValueRef.current = false;
        }
    };

    const togglePasswordVisibility = useCallback(() => {
        setPasswordHidden((prevPasswordHidden: boolean | undefined) => !prevPasswordHidden);
    }, []);

    const hasLabel = !!label?.length;
    const isReadOnly = inputProps.readOnly ?? inputProps.disabled;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and errorText can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const inputHelpText = errorText || hint;
    const newPlaceholder = !!prefixCharacter || !!suffixCharacter || isFocused || !hasLabel || (hasLabel && forceActiveLabel) ? placeholder : undefined;
    const newTextInputContainerStyles: StyleProp<ViewStyle> = StyleSheet.flatten([
        styles.textInputContainer,
        textInputContainerStyles,
        (autoGrow || !!contentWidth) && StyleUtils.getWidthStyle(textInputWidth),
        !hideFocusedState && isFocused && styles.borderColorFocus,
        (!!hasError || !!errorText) && styles.borderColorDanger,
        autoGrowHeight && {scrollPaddingTop: typeof maxAutoGrowHeight === 'number' ? 2 * maxAutoGrowHeight : undefined},
    ]);
    const isMultiline = multiline || autoGrowHeight;

    /**
     * To prevent text jumping caused by virtual DOM calculations on Safari and mobile Chrome,
     * make sure to include the `lineHeight`.
     * Reference: https://github.com/Expensify/App/issues/26735
     * For other platforms, explicitly remove `lineHeight` from single-line inputs
     * to prevent long text from disappearing once it exceeds the input space.
     * See https://github.com/Expensify/App/issues/13802
     */
    const lineHeight = useMemo(() => {
        if (Browser.isSafari() || Browser.isMobileChrome()) {
            const lineHeightValue = StyleSheet.flatten(inputStyle).lineHeight;
            if (lineHeightValue !== undefined) {
                return lineHeightValue;
            }
        }

        return undefined;
    }, [inputStyle]);

    const inputPaddingLeft = !!prefixCharacter && StyleUtils.getPaddingLeft(StyleUtils.getCharacterPadding(prefixCharacter) + styles.pl1.paddingLeft);
    const inputPaddingRight = !!suffixCharacter && StyleUtils.getPaddingRight(StyleUtils.getCharacterPadding(suffixCharacter) + styles.pr1.paddingRight);

    return (
        <>
            <View
                style={[containerStyles]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(shouldInterceptSwipe && SwipeInterceptPanResponder.panHandlers)}
            >
                <PressableWithoutFeedback
                    role={CONST.ROLE.PRESENTATION}
                    onPress={onPress}
                    tabIndex={-1}
                    accessibilityLabel={label}
                    // When autoGrowHeight is true we calculate the width for the textInput, so it will break lines properly
                    // or if multiline is not supplied we calculate the textinput height, using onLayout.
                    onLayout={onLayout}
                    style={[
                        autoGrowHeight && styles.autoGrowHeightInputContainer(textInputHeight, variables.componentSizeLarge, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0),
                        !isMultiline && styles.componentHeightLarge,
                        touchableInputWrapperStyle,
                    ]}
                >
                    <View
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
                            {iconLeft && (
                                <View style={[styles.textInputLeftIconContainer, !isReadOnly ? styles.cursorPointer : styles.pointerEventsNone]}>
                                    <Icon
                                        src={iconLeft}
                                        fill={theme.icon}
                                        height={variables.iconSizeNormal}
                                        width={variables.iconSizeNormal}
                                    />
                                </View>
                            )}
                            {!!prefixCharacter && (
                                <View style={[styles.textInputPrefixWrapper, prefixContainerStyle]}>
                                    <Text
                                        tabIndex={-1}
                                        style={[styles.textInputPrefix, !hasLabel && styles.pv0, styles.pointerEventsNone, prefixStyle]}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    >
                                        {prefixCharacter}
                                    </Text>
                                </View>
                            )}
                            <InputComponent
                                ref={(element: AnimatedTextInputRef | AnimatedMarkdownTextInputRef | null): void => {
                                    const baseTextInputRef = element as BaseTextInputRef | null;
                                    if (typeof ref === 'function') {
                                        ref(baseTextInputRef);
                                    } else if (ref && 'current' in ref) {
                                        // eslint-disable-next-line no-param-reassign
                                        ref.current = baseTextInputRef;
                                    }

                                    input.current = element as HTMLInputElement | null;
                                }}
                                // eslint-disable-next-line
                                {...inputProps}
                                autoCorrect={inputProps.secureTextEntry ? false : autoCorrect}
                                placeholder={newPlaceholder}
                                placeholderTextColor={theme.placeholderText}
                                underlineColorAndroid="transparent"
                                style={[
                                    styles.flex1,
                                    styles.w100,
                                    inputStyle,
                                    (!hasLabel || isMultiline) && styles.pv0,
                                    inputPaddingLeft,
                                    inputPaddingRight,
                                    inputProps.secureTextEntry && styles.secureInput,

                                    // Explicitly remove `lineHeight` from single line inputs so that long text doesn't disappear
                                    // once it exceeds the input space (See https://github.com/Expensify/App/issues/13802)
                                    !isMultiline && {height, lineHeight},

                                    // Explicitly change boxSizing attribute for mobile chrome in order to apply line-height
                                    // for the issue mentioned here https://github.com/Expensify/App/issues/26735
                                    // Set overflow property to enable the parent flexbox to shrink its size
                                    // (See https://github.com/Expensify/App/issues/41766)
                                    !isMultiline && Browser.isMobileChrome() && {boxSizing: 'content-box', height: undefined, ...styles.overflowAuto},

                                    // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                    ...(autoGrowHeight
                                        ? [StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0), styles.verticalAlignTop]
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
                                inputMode={inputProps.inputMode}
                                value={value}
                                selection={inputProps.selection}
                                readOnly={isReadOnly}
                                defaultValue={defaultValue}
                                markdownStyle={markdownStyle}
                            />
                            {!!suffixCharacter && (
                                <View style={[styles.textInputSuffixWrapper, suffixContainerStyle]}>
                                    <Text
                                        tabIndex={-1}
                                        style={[styles.textInputSuffix, !hasLabel && styles.pv0, styles.pointerEventsNone, suffixStyle]}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    >
                                        {suffixCharacter}
                                    </Text>
                                </View>
                            )}
                            {isFocused && !isReadOnly && shouldShowClearButton && !!value && <TextInputClearButton onPressButton={() => setValue('')} />}
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
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                    }}
                                    accessibilityLabel={translate('common.visible')}
                                >
                                    <Icon
                                        src={passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                        fill={theme.icon}
                                    />
                                </Checkbox>
                            )}
                            {!inputProps.secureTextEntry && !!icon && (
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
            {contentWidth && (
                <View
                    style={[inputStyle as ViewStyle, styles.hiddenElementOutsideOfWindow, styles.visibilityHidden, styles.wAuto, inputPaddingLeft]}
                    onLayout={(e) => {
                        if (e.nativeEvent.layout.width === 0 && e.nativeEvent.layout.height === 0) {
                            return;
                        }
                        setTextInputWidth(e.nativeEvent.layout.width);
                        setTextInputHeight(e.nativeEvent.layout.height);
                    }}
                >
                    <Text
                        style={[
                            inputStyle,
                            autoGrowHeight && styles.autoGrowHeightHiddenInput(width ?? 0, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : undefined),
                            {width: contentWidth},
                        ]}
                    >
                        {/* \u200B added to solve the issue of not expanding the text input enough when the value ends with '\n' (https://github.com/Expensify/App/issues/21271) */}
                        {value ? `${value}${value.endsWith('\n') ? '\u200B' : ''}` : placeholder}
                    </Text>
                </View>
            )}
            {/*
                 Text input component doesn't support auto grow by default.
                 We're using a hidden text input to achieve that.
                 This text view is used to calculate width or height of the input value given textStyle in this component.
                 This Text component is intentionally positioned out of the screen.
             */}
            {(!!autoGrow || autoGrowHeight) && (
                // Add +2 to width on Safari browsers so that text is not cut off due to the cursor or when changing the value
                // Reference: https://github.com/Expensify/App/issues/8158, https://github.com/Expensify/App/issues/26628
                // For mobile Chrome, ensure proper display of the text selection handle (blue bubble down).
                // Reference: https://github.com/Expensify/App/issues/34921
                <Text
                    style={[
                        inputStyle,
                        autoGrowHeight && styles.autoGrowHeightHiddenInput(width ?? 0, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : undefined),
                        styles.hiddenElementOutsideOfWindow,
                        styles.visibilityHidden,
                    ]}
                    onLayout={(e) => {
                        if (e.nativeEvent.layout.width === 0 && e.nativeEvent.layout.height === 0) {
                            return;
                        }
                        let additionalWidth = 0;
                        if (Browser.isMobileSafari() || Browser.isSafari() || Browser.isMobileChrome()) {
                            additionalWidth = 2;
                        }
                        setTextInputWidth(e.nativeEvent.layout.width + additionalWidth);
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
