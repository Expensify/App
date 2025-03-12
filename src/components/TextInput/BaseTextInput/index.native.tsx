import {Str} from 'expensify-common';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, NativeSyntheticEvent, StyleProp, TextInput, TextInputFocusEventData, ViewStyle} from 'react-native';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useSharedValue, withSpring} from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RNTextInput from '@components/RNTextInput';
import Text from '@components/Text';
import * as styleConst from '@components/TextInput/styleConst';
import TextInputClearButton from '@components/TextInput/TextInputClearButton';
import TextInputLabel from '@components/TextInput/TextInputLabel';
import useHtmlPaste from '@hooks/useHtmlPaste';
import useLocalize from '@hooks/useLocalize';
import useMarkdownStyle from '@hooks/useMarkdownStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import isInputAutoFilled from '@libs/isInputAutoFilled';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import InputComponentMap from './implementations';
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
        iconLeft = null,
        icon = null,
        textInputContainerStyles,
        touchableInputWrapperStyle,
        containerStyles,
        inputStyle,
        forceActiveLabel = false,
        autoFocus = false,
        disableKeyboard = false,
        autoGrow = false,
        autoGrowExtraSpace = 0,
        autoGrowHeight = false,
        maxAutoGrowHeight,
        hideFocusedState = false,
        maxLength = undefined,
        hint = '',
        onInputChange = () => {},
        shouldDelayFocus = false,
        multiline = false,
        autoCorrect = true,
        prefixCharacter = '',
        suffixCharacter = '',
        inputID,
        type = 'default',
        excludedMarkdownStyles = [],
        shouldShowClearButton = false,
        prefixContainerStyle = [],
        prefixStyle = [],
        suffixContainerStyle = [],
        suffixStyle = [],
        contentWidth,
        loadingSpinnerStyle,
        uncontrolled,
        placeholderTextColor,
        ...props
    }: BaseTextInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const InputComponent = InputComponentMap.get(type) ?? RNTextInput;
    const isMarkdownEnabled = type === 'markdown';
    const isAutoGrowHeightMarkdown = isMarkdownEnabled && autoGrowHeight;

    const inputProps = {shouldSaveDraft: false, shouldUseDefaultValue: false, ...props};
    const theme = useTheme();
    const styles = useThemeStyles();
    const markdownStyle = useMarkdownStyle(undefined, excludedMarkdownStyles);
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {hasError = false} = inputProps;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const initialValue = value || defaultValue || '';
    const initialActiveLabel = !!forceActiveLabel || initialValue.length > 0 || !!prefixCharacter || !!suffixCharacter;
    const isMultiline = multiline || autoGrowHeight;

    const [isFocused, setIsFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(inputProps.secureTextEntry);
    const [textInputWidth, setTextInputWidth] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [height, setHeight] = useState<number>(variables.componentSizeLarge);
    const [width, setWidth] = useState<number | null>(null);
    const labelScale = useSharedValue<number>(initialActiveLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE);
    const labelTranslateY = useSharedValue<number>(initialActiveLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y);
    const input = useRef<TextInput | null>(null);
    const isLabelActive = useRef(initialActiveLabel);

    useHtmlPaste(input, undefined, isMarkdownEnabled);

    // AutoFocus with delay is executed manually, otherwise it's handled by the TextInput's autoFocus native prop
    useEffect(() => {
        if (!autoFocus || !shouldDelayFocus || !input.current) {
            return;
        }

        const focusTimeout = setTimeout(() => input.current?.focus(), CONST.ANIMATED_TRANSITION);
        return () => clearTimeout(focusTimeout);
        // We only want this to run on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const animateLabel = useCallback(
        (translateY: number, scale: number) => {
            labelScale.set(withSpring(scale, {overshootClamping: false}));
            labelTranslateY.set(withSpring(translateY, {overshootClamping: false}));
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

        if (!!forceActiveLabel || inputValue.length !== 0 || prefixCharacter || suffixCharacter) {
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

            // We need to increase the height for single line inputs to escape cursor jumping on ios
            const heightToFitEmojis = 1;

            setWidth((prevWidth: number | null) => (autoGrowHeight ? layout.width : prevWidth));
            setHeight((prevHeight: number) => (!multiline ? layout.height + heightToFitEmojis : prevHeight));
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

    const hasLabel = !!label?.length;
    const isReadOnly = inputProps.readOnly ?? inputProps.disabled;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and errorText can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const inputHelpText = errorText || hint;
    const placeholderValue = !!prefixCharacter || !!suffixCharacter || isFocused || !hasLabel || (hasLabel && forceActiveLabel) ? placeholder : undefined;
    const newTextInputContainerStyles: StyleProp<ViewStyle> = StyleSheet.flatten([
        styles.textInputContainer,
        textInputContainerStyles,
        !!contentWidth && StyleUtils.getWidthStyle(textInputWidth),
        autoGrow && StyleUtils.getAutoGrowWidthInputContainerStyles(textInputWidth, autoGrowExtraSpace),
        !hideFocusedState && isFocused && styles.borderColorFocus,
        (!!hasError || !!errorText) && styles.borderColorDanger,
        autoGrowHeight && {scrollPaddingTop: typeof maxAutoGrowHeight === 'number' ? 2 * maxAutoGrowHeight : undefined},
        isAutoGrowHeightMarkdown && styles.pb2,
    ]);

    const inputPaddingLeft = !!prefixCharacter && StyleUtils.getPaddingLeft(StyleUtils.getCharacterPadding(prefixCharacter) + styles.pl1.paddingLeft);
    const inputPaddingRight = !!suffixCharacter && StyleUtils.getPaddingRight(StyleUtils.getCharacterPadding(suffixCharacter) + styles.pr1.paddingRight);

    // Height fix is needed only for Text single line inputs
    const shouldApplyHeight = !isMultiline && !isMarkdownEnabled;
    return (
        <>
            <View style={[containerStyles]}>
                <PressableWithoutFeedback
                    role={CONST.ROLE.PRESENTATION}
                    onPress={onPress}
                    tabIndex={-1}
                    // When autoGrowHeight is true we calculate the width for the textInput, so it will break lines properly
                    // or if multiline is not supplied we calculate the textinput height, using onLayout.
                    onLayout={onLayout}
                    accessibilityLabel={label}
                    style={[
                        autoGrowHeight &&
                            !isAutoGrowHeightMarkdown &&
                            styles.autoGrowHeightInputContainer(textInputHeight, variables.componentSizeLarge, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0),
                        isAutoGrowHeightMarkdown && {minHeight: variables.componentSizeLarge},
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
                                    label={label}
                                    labelTranslateY={labelTranslateY}
                                    labelScale={labelScale}
                                    for={inputProps.nativeID}
                                />
                            </>
                        ) : null}
                        <View style={[styles.textInputAndIconContainer(isMarkdownEnabled), isMultiline && hasLabel && styles.textInputMultilineContainer, styles.pointerEventsBoxNone]}>
                            {!!iconLeft && (
                                <View style={styles.textInputLeftIconContainer}>
                                    <Icon
                                        src={iconLeft}
                                        fill={theme.icon}
                                        height={20}
                                        width={20}
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

                                    input.current = element;
                                }}
                                // eslint-disable-next-line
                                {...inputProps}
                                autoFocus={autoFocus && !shouldDelayFocus}
                                autoCorrect={inputProps.secureTextEntry ? false : autoCorrect}
                                placeholder={placeholderValue}
                                placeholderTextColor={placeholderTextColor ?? theme.placeholderText}
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
                                    // once it exceeds the input space on iOS (See https://github.com/Expensify/App/issues/13802)
                                    shouldApplyHeight && {height, lineHeight: undefined},

                                    // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                    ...(autoGrowHeight && !isAutoGrowHeightMarkdown
                                        ? [StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0), styles.verticalAlignTop]
                                        : []),
                                    isAutoGrowHeightMarkdown ? [StyleUtils.getMarkdownMaxHeight(maxAutoGrowHeight), styles.verticalAlignTop] : undefined,
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
                                keyboardType={inputProps.keyboardType}
                                inputMode={!disableKeyboard ? inputProps.inputMode : CONST.INPUT_MODE.NONE}
                                value={uncontrolled ? undefined : value}
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
                            {inputProps.isLoading !== undefined && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.iconSuccessFill}
                                    style={[styles.mt4, styles.ml1, loadingSpinnerStyle, StyleUtils.getOpacityStyle(inputProps.isLoading ? 1 : 0)]}
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
            {!!contentWidth && (
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
                 This text view is used to calculate width or height of the input value given textStyle in this component.
                 This Text component is intentionally positioned out of the screen.
             */}
            {(!!autoGrow || autoGrowHeight) && !isAutoGrowHeightMarkdown && (
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
                        // Add +2 to width so that cursor is not cut off / covered at the end of text content
                        setTextInputWidth(e.nativeEvent.layout.width + 2);
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
