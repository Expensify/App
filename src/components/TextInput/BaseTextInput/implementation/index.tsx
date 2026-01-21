import {Str} from 'expensify-common';
import type {RefObject} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {BlurEvent, FocusEvent, GestureResponderEvent, LayoutChangeEvent, StyleProp, TextInput, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import {Easing, useSharedValue, withTiming} from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import Checkbox from '@components/Checkbox';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RNTextInput from '@components/RNTextInput';
import SwipeInterceptPanResponder from '@components/SwipeInterceptPanResponder';
import Text from '@components/Text';
import InputComponentMap from '@components/TextInput/BaseTextInput/implementations';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {ACTIVE_LABEL_SCALE, ACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_SCALE, INACTIVE_LABEL_TRANSLATE_Y} from '@components/TextInput/styleConst';
import TextInputClearButton from '@components/TextInput/TextInputClearButton';
import TextInputLabel from '@components/TextInput/TextInputLabel';
import TextInputMeasurement from '@components/TextInput/TextInputMeasurement';
import useHtmlPaste from '@hooks/useHtmlPaste';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMarkdownStyle from '@hooks/useMarkdownStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileChrome} from '@libs/Browser';
import {scrollToRight} from '@libs/InputUtils';
import isInputAutoFilled from '@libs/isInputAutoFilled';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function BaseTextInput({
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
    includeIconPadding = true,
    textInputContainerStyles,
    shouldApplyPaddingToContainer = true,
    touchableInputWrapperStyle,
    containerStyles,
    inputStyle,
    forceActiveLabel = false,
    disableKeyboard = false,
    autoGrow = false,
    autoGrowHeight = false,
    maxAutoGrowHeight,
    hideFocusedState = false,
    maxLength = undefined,
    hint = '',
    onInputChange = () => {},
    multiline = false,
    shouldInterceptSwipe = false,
    autoCorrect = true,
    prefixCharacter = '',
    suffixCharacter = '',
    inputID,
    type = 'default',
    excludedMarkdownStyles = [],
    shouldShowClearButton = false,
    shouldHideClearButton = true,
    shouldUseDisabledStyles = true,
    prefixContainerStyle = [],
    prefixStyle = [],
    suffixContainerStyle = [],
    suffixStyle = [],
    contentWidth,
    loadingSpinnerStyle,
    uncontrolled = false,
    placeholderTextColor,
    onClearInput,
    iconContainerStyle,
    shouldUseDefaultLineHeightForPrefix = true,
    ref,
    sentryLabel,
    ...inputProps
}: BaseTextInputProps) {
    const InputComponent = InputComponentMap.get(type) ?? RNTextInput;
    const isMarkdownEnabled = type === 'markdown';
    const isAutoGrowHeightMarkdown = isMarkdownEnabled && autoGrowHeight;

    const theme = useTheme();
    const styles = useThemeStyles();
    const markdownStyle = useMarkdownStyle(false, excludedMarkdownStyles);
    const {hasError = false} = inputProps;
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Eye', 'EyeDisabled'] as const);

    // Disabling this line for safeness as nullish coalescing works only if value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const initialValue = value || defaultValue || '';
    const initialActiveLabel = !!forceActiveLabel || initialValue.length > 0 || !!prefixCharacter || !!suffixCharacter;

    const [isFocused, setIsFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(inputProps.secureTextEntry);
    const [textInputWidth, setTextInputWidth] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);
    const [width, setWidth] = useState<number | null>(null);
    const [prefixCharacterPadding, setPrefixCharacterPadding] = useState<number>(CONST.CHARACTER_WIDTH);
    const [isPrefixCharacterPaddingCalculated, setIsPrefixCharacterPaddingCalculated] = useState(() => !prefixCharacter);

    const labelScale = useSharedValue<number>(initialActiveLabel ? ACTIVE_LABEL_SCALE : INACTIVE_LABEL_SCALE);
    const labelTranslateY = useSharedValue<number>(initialActiveLabel ? ACTIVE_LABEL_TRANSLATE_Y : INACTIVE_LABEL_TRANSLATE_Y);

    const input = useRef<HTMLInputElement | null>(null);
    const isLabelActive = useRef(initialActiveLabel);
    const didScrollToEndRef = useRef(false);

    useHtmlPaste(input as RefObject<TextInput | null>, undefined, isMarkdownEnabled, maxLength);

    // AutoFocus which only works on mount:
    useEffect(() => {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!inputProps.autoFocus || !input.current) {
            return;
        }

        input.current.focus();
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animateLabel = useCallback(
        (translateY: number, scale: number) => {
            labelScale.set(
                withTiming(scale, {
                    duration: 200,
                    easing: Easing.inOut(Easing.ease),
                }),
            );
            labelTranslateY.set(
                withTiming(translateY, {
                    duration: 200,
                    easing: Easing.inOut(Easing.ease),
                }),
            );
        },
        [labelScale, labelTranslateY],
    );

    const activateLabel = useCallback(() => {
        const newValue = value ?? '';

        if (newValue.length < 0 || isLabelActive.current) {
            return;
        }

        animateLabel(ACTIVE_LABEL_TRANSLATE_Y, ACTIVE_LABEL_SCALE);
        isLabelActive.current = true;
    }, [animateLabel, value]);

    const deactivateLabel = useCallback(() => {
        const newValue = value ?? '';

        if (!!forceActiveLabel || newValue.length !== 0 || prefixCharacter || suffixCharacter) {
            return;
        }

        animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_SCALE);
        isLabelActive.current = false;
    }, [animateLabel, forceActiveLabel, prefixCharacter, suffixCharacter, value]);

    const onFocus = (event: FocusEvent) => {
        inputProps.onFocus?.(event);
        setIsFocused(true);
    };

    const onBlur = (event: BlurEvent) => {
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
            // When the component is uncontrolled, we need to manually activate the label:
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
    const isMultiline = multiline || autoGrowHeight;

    const shouldAddPaddingBottom = isMultiline || (autoGrowHeight && !isAutoGrowHeightMarkdown && textInputHeight > variables.componentSizeLarge);
    const hasLabel = !!label?.length;
    const isReadOnly = inputProps.readOnly ?? inputProps.disabled;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and errorText can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const inputHelpText = errorText || hint;
    const newPlaceholder = !!prefixCharacter || !!suffixCharacter || isFocused || !hasLabel || (hasLabel && forceActiveLabel) ? placeholder : undefined;
    const newTextInputContainerStyles: StyleProp<ViewStyle> = StyleSheet.flatten([
        styles.textInputContainer,
        !shouldApplyPaddingToContainer && styles.p0,
        !hasLabel && styles.pt0,
        textInputContainerStyles,
        (autoGrow || !!contentWidth) && StyleUtils.getWidthStyle(textInputWidth + (shouldApplyPaddingToContainer ? styles.textInputContainer.padding * 2 : 0)),
        !hideFocusedState && isFocused && styles.borderColorFocus,
        (!!hasError || !!errorText) && styles.borderColorDanger,
        autoGrowHeight && {scrollPaddingTop: typeof maxAutoGrowHeight === 'number' ? 2 * maxAutoGrowHeight : undefined},
        isAutoGrowHeightMarkdown && styles.pb2,
        inputProps.disabled && shouldUseDisabledStyles && styles.textInputDisabledContainer,
        shouldAddPaddingBottom && styles.pb1,
    ]);

    const verticalPaddingDiff = StyleUtils.getVerticalPaddingDiffFromStyle(newTextInputContainerStyles);
    const inputPaddingLeft = !!prefixCharacter && StyleUtils.getPaddingLeft(prefixCharacterPadding + styles.pl1.paddingLeft);
    const inputPaddingRight = !!suffixCharacter && StyleUtils.getPaddingRight(StyleUtils.getCharacterPadding(suffixCharacter) + styles.pr1.paddingRight);
    // This is workaround for https://github.com/Expensify/App/issues/47939: in case when user is using Chrome on Android we set inputMode to 'search' to disable autocomplete bar above the keyboard.
    // If we need some other inputMode (eg. 'decimal'), then the autocomplete bar will show, but we can do nothing about it as it's a known Chrome bug.
    const inputMode = inputProps.inputMode ?? (isMobileChrome() ? 'search' : undefined);
    const accessibilityLabel = [label, hint].filter(Boolean).join(', ');
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
                    accessibilityLabel={accessibilityLabel}
                    // When autoGrowHeight is true we calculate the width for the text input, so it will break lines properly
                    // or if multiline is not supplied we calculate the text input height, using onLayout.
                    onLayout={onLayout}
                    style={[
                        autoGrowHeight &&
                            !isAutoGrowHeightMarkdown &&
                            styles.autoGrowHeightInputContainer(
                                textInputHeight + (shouldAddPaddingBottom ? styles.textInputContainer.padding : 0),
                                variables.componentSizeLarge,
                                typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0,
                            ),
                        isAutoGrowHeightMarkdown && {minHeight: variables.componentSizeLarge},
                        !isMultiline && styles.componentHeightLarge,
                        touchableInputWrapperStyle,
                    ]}
                    sentryLabel={sentryLabel}
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
                                {isMultiline && (
                                    <View
                                        style={[
                                            styles.textInputLabelBackground,
                                            styles.pointerEventsNone,
                                            inputProps.disabled && shouldUseDisabledStyles && styles.textInputDisabledContainer,
                                        ]}
                                    />
                                )}
                                <TextInputLabel
                                    label={label}
                                    labelTranslateY={labelTranslateY}
                                    labelScale={labelScale}
                                    for={inputProps.nativeID}
                                    isMultiline={isMultiline}
                                />
                            </>
                        ) : null}
                        <View
                            style={[
                                !isMarkdownEnabled && styles.flex1,
                                styles.textInputAndIconContainer,
                                isMultiline && hasLabel && styles.textInputMultilineContainer,
                                styles.pointerEventsBoxNone,
                            ]}
                        >
                            {!!iconLeft && (
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
                                        onLayout={(event) => {
                                            if (event.nativeEvent.layout.width === 0 && event.nativeEvent.layout.height === 0) {
                                                return;
                                            }
                                            setPrefixCharacterPadding(event?.nativeEvent?.layout.width);
                                            setIsPrefixCharacterPaddingCalculated(true);
                                        }}
                                        tabIndex={-1}
                                        style={[
                                            styles.textInputPrefix,
                                            !hasLabel && styles.pv0,
                                            styles.pointerEventsNone,
                                            inputProps.disabled && shouldUseDisabledStyles && styles.textSupporting,
                                            prefixStyle,
                                        ]}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                        shouldUseDefaultLineHeight={shouldUseDefaultLineHeightForPrefix}
                                    >
                                        {prefixCharacter}
                                    </Text>
                                </View>
                            )}
                            <InputComponent
                                ref={(element: HTMLFormElement | AnimatedTextInputRef | AnimatedMarkdownTextInputRef | null): void => {
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

                                    // Explicitly change boxSizing attribute for mobile chrome in order to apply line-height
                                    // for the issue mentioned here https://github.com/Expensify/App/issues/26735
                                    // Set overflow property to enable the parent flexbox to shrink its size
                                    // (See https://github.com/Expensify/App/issues/41766)
                                    !isMultiline && isMobileChrome() && {boxSizing: 'content-box', height: undefined, ...styles.overflowAuto},

                                    // Stop scrollbar flashing when breaking lines with autoGrowHeight enabled.
                                    ...(autoGrowHeight && !isAutoGrowHeightMarkdown
                                        ? [StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0), styles.verticalAlignTop]
                                        : []),
                                    isAutoGrowHeightMarkdown ? [StyleUtils.getMarkdownMaxHeight(maxAutoGrowHeight), styles.verticalAlignTop] : undefined,
                                    // Add disabled color theme when field is not editable.
                                    inputProps.disabled && shouldUseDisabledStyles && styles.textInputDisabled,
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
                                inputMode={inputMode}
                                value={uncontrolled ? undefined : value}
                                selection={inputProps.selection}
                                readOnly={isReadOnly}
                                defaultValue={defaultValue}
                                markdownStyle={markdownStyle}
                                accessibilityLabel={inputProps.accessibilityLabel}
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
                            {((isFocused && !isReadOnly && shouldShowClearButton) || !shouldHideClearButton) && !!value && !inputProps.isLoading && (
                                <View
                                    onLayout={() => {
                                        if (didScrollToEndRef.current || !input.current) {
                                            return;
                                        }
                                        scrollToRight(input.current);
                                        didScrollToEndRef.current = true;
                                    }}
                                >
                                    <TextInputClearButton
                                        onPressButton={() => {
                                            setValue('');
                                            onClearInput?.();
                                        }}
                                        style={[StyleUtils.getTextInputIconContainerStyles(hasLabel, false, verticalPaddingDiff)]}
                                        sentryLabel={sentryLabel ? `${sentryLabel}-ClearButton` : undefined}
                                    />
                                </View>
                            )}
                            {!!inputProps.isLoading && !shouldShowClearButton && (
                                <ActivityIndicator
                                    color={theme.iconSuccessFill}
                                    style={[StyleUtils.getTextInputIconContainerStyles(hasLabel, false, verticalPaddingDiff), styles.ml1, loadingSpinnerStyle]}
                                />
                            )}
                            {!!inputProps.secureTextEntry && (
                                <Checkbox
                                    style={StyleUtils.getTextInputIconContainerStyles(hasLabel, true, verticalPaddingDiff)}
                                    onPress={togglePasswordVisibility}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                    }}
                                    accessibilityLabel={translate('common.visible')}
                                >
                                    <Icon
                                        src={passwordHidden ? expensifyIcons.Eye : expensifyIcons.EyeDisabled}
                                        fill={theme.icon}
                                    />
                                </Checkbox>
                            )}
                            {!inputProps.secureTextEntry && !!icon && (
                                <View
                                    style={[
                                        StyleUtils.getTextInputIconContainerStyles(hasLabel, includeIconPadding, verticalPaddingDiff),
                                        !isReadOnly ? styles.cursorPointer : styles.pointerEventsNone,
                                        iconContainerStyle,
                                    ]}
                                >
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
            <TextInputMeasurement
                value={value}
                placeholder={placeholder}
                contentWidth={contentWidth}
                autoGrowHeight={autoGrowHeight}
                maxAutoGrowHeight={maxAutoGrowHeight}
                width={width}
                inputStyle={inputStyle}
                inputPaddingLeft={inputPaddingLeft}
                autoGrow={autoGrow}
                isAutoGrowHeightMarkdown={isAutoGrowHeightMarkdown}
                onSetTextInputWidth={setTextInputWidth}
                onSetTextInputHeight={setTextInputHeight}
                isPrefixCharacterPaddingCalculated={isPrefixCharacterPaddingCalculated}
            />
        </>
    );
}

export default BaseTextInput;
