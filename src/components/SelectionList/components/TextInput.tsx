import type {TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';
import BaseTextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {TextInputKeyPressEvent} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';

type TextInputProps = {
    /** Reference to the BaseTextInput component */
    ref?: React.RefObject<BaseTextInputRef | null> | null;

    /** Configuration options for the text input including label, placeholder, validation, etc. */
    options?: TextInputOptions;

    /**  */
    accessibilityLabel?: string;

    /** Whether the text input is loading */
    isLoading?: boolean;

    /** The number of items in the data array, used to determine submit behavior */
    dataLength?: number;

    /** Callback function called when the text input is submitted */
    onSubmit?: () => void;

    /** Function called when a key is pressed in the text input */
    onKeyPress?: (event: TextInputKeyPressEvent) => void;

    /** Function called when the text input focus changes */
    onFocusChange: (focused: boolean) => void;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;

    /** Whether to show the loading placeholder */
    shouldShowLoadingPlaceholder?: boolean;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;

    /** Function to focus text input component */
    focusTextInput: () => void;
};

function TextInput({
    ref,
    options,
    accessibilityLabel,
    isLoading = false,
    dataLength,
    onSubmit,
    onKeyPress,
    onFocusChange,
    shouldShowLoadingPlaceholder,
    isLoadingNewOptions,
    shouldShowTextInput,
    focusTextInput,
}: TextInputProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    // The compact search input must be sized by the physical device width, not by `shouldUseNarrowLayout`. Using
    // `shouldUseNarrowLayout` would grow the input to the tall mobile size whenever it is rendered inside an
    // RHP/narrow pane on web/desktop, so `isSmallScreenWidth` is intentionally used here to keep it compact.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {
        label,
        value,
        onChangeText,
        errorText,
        headerMessage,
        hint,
        disableAutoFocus,
        placeholder,
        maxLength,
        inputMode,
        ref: optionsRef,
        style,
        disableAutoCorrect,
        shouldInterceptSwipe,
    } = options ?? {};

    const isInLandscapeMode = useIsInLandscapeMode();

    const noResultsFoundText = translate('common.noResultsFound');
    const isNoResultsFoundMessage = headerMessage === noResultsFoundText;
    const isScreenReaderEnabled = Accessibility.useScreenReaderStatus();
    const hasNoData = dataLength === 0 && !shouldShowLoadingPlaceholder;
    const shouldShowHeaderMessage = !!shouldShowTextInput && !!headerMessage && (!isLoadingNewOptions || !isNoResultsFoundMessage || hasNoData);
    const trimmedSearchValue = value?.trim() ?? '';
    const suggestionsCount = dataLength ?? 0;
    const suggestionsAnnouncement =
        !!shouldShowTextInput && !shouldShowLoadingPlaceholder && !isLoadingNewOptions && suggestionsCount > 0
            ? translate('search.suggestionsAvailable', {count: suggestionsCount}, trimmedSearchValue)
            : '';

    useDebouncedAccessibilityAnnouncement(headerMessage ?? '', shouldShowHeaderMessage, value ?? '');
    useDebouncedAccessibilityAnnouncement(suggestionsAnnouncement, !!suggestionsAnnouncement, value ?? '');

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mergedRef = mergeRefs<BaseTextInputRef>(ref, optionsRef);

    const handleTextInputChange = useCallback(
        (text: string) => {
            onChangeText?.(text);
        },
        [onChangeText],
    );

    useFocusEffect(
        useCallback(() => {
            if (!shouldShowTextInput || disableAutoFocus || isScreenReaderEnabled || isInLandscapeMode) {
                return;
            }

            focusTimeoutRef.current = setTimeout(focusTextInput, CONST.ANIMATED_TRANSITION);

            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
                focusTimeoutRef.current = null;
            };
        }, [shouldShowTextInput, disableAutoFocus, focusTextInput, isInLandscapeMode, isScreenReaderEnabled]),
    );

    const handleFocus = useCallback(() => {
        onFocusChange(true);
    }, [onFocusChange]);

    const handleBlur = useCallback(() => {
        onFocusChange(false);
    }, [onFocusChange]);

    if (!shouldShowTextInput) {
        return null;
    }

    return (
        <>
            <View style={[styles.ph5, styles.pb3, style?.containerStyle]}>
                <BaseTextInput
                    ref={mergedRef}
                    onKeyPress={onKeyPress}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    // Use the smaller "above the table" search input size. The compact height cannot fit a
                    // floating label, so the label is rendered as a placeholder while a11y is preserved via accessibilityLabel.
                    accessibilityLabel={accessibilityLabel ?? label}
                    hint={hint}
                    role={CONST.ROLE.PRESENTATION}
                    value={value}
                    placeholder={placeholder ?? label}
                    placeholderTextColor={theme.textSupporting}
                    maxLength={maxLength}
                    onChangeText={handleTextInputChange}
                    inputMode={inputMode}
                    selectTextOnFocus
                    spellCheck={false}
                    onSubmitEditing={onSubmit}
                    submitBehavior={dataLength ? 'blurAndSubmit' : 'submit'}
                    isLoading={isLoading}
                    testID="selection-list-text-input"
                    errorText={errorText}
                    autoCorrect={!disableAutoCorrect}
                    shouldInterceptSwipe={shouldInterceptSwipe ?? false}
                    // Size is based on device width (isSmallScreenWidth), not shouldUseNarrowLayout, so the input stays
                    // the compact 34px size on web/desktop even inside the RHP/narrow pane, and only grows to 46px on mobile.
                    touchableInputWrapperStyle={isSmallScreenWidth ? styles.listSearchInputNarrowWrapper : styles.listSearchInputWideWrapper}
                    textInputContainerStyles={[styles.pb0, isSmallScreenWidth ? styles.ph3 : styles.ph2]}
                    inputStyle={[styles.w100, styles.lineHeightUndefined, isSmallScreenWidth ? undefined : styles.fontSizeLabel]}
                />
            </View>
            {shouldShowHeaderMessage && (
                <View style={[styles.ph5, styles.pb5, style?.headerMessageStyle]}>
                    <Text
                        style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}
                        aria-hidden
                    >
                        {headerMessage}
                    </Text>
                </View>
            )}
        </>
    );
}

export default TextInput;
