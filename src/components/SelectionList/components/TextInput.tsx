import type {TextInputOptions} from '@components/SelectionList/types';
import BaseTextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

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

import SelectionListSearchStatus from './SelectionListSearchStatus';

type SelectionListTextFieldProps = {
    ref?: React.RefObject<BaseTextInputRef | null> | null;

    /** Configuration options for the text input including label, placeholder, validation, etc. */
    options?: TextInputOptions;

    /**  */
    accessibilityLabel?: string;

    isLoading?: boolean;

    /** The number of items in the data array, used to determine submit behavior */
    dataLength?: number;

    /** Callback function called when the text input is submitted */
    onSubmit?: () => void;

    /** Lets a list clear its focused row on press, so plain Enter in the search input reaches the confirm button instead of toggling a row */
    onPress?: () => void;

    onKeyPress?: (event: TextInputKeyPressEvent) => void;

    /** Function called when the text input focus changes */
    onFocusChange: (focused: boolean) => void;

    shouldShowTextInput?: boolean;
    focusTextInput: () => void;
};

type TextInputProps = SelectionListTextFieldProps & {
    shouldShowLoadingPlaceholder?: boolean;
    isLoadingNewOptions?: boolean;
};

function SelectionListTextField({
    ref,
    options,
    accessibilityLabel,
    isLoading = false,
    dataLength,
    onSubmit,
    onPress,
    onKeyPress,
    onFocusChange,
    shouldShowTextInput,
    focusTextInput,
}: SelectionListTextFieldProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
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
        hint,
        disableAutoFocus,
        placeholder,
        maxLength,
        inputMode,
        shouldIgnorePasswordManager = true,
        ref: optionsRef,
        style,
        disableAutoCorrect,
        shouldInterceptSwipe,
    } = options ?? {};

    const isInLandscapeMode = useIsInLandscapeMode();

    const isScreenReaderEnabled = Accessibility.useScreenReaderStatus();

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mergedRef = mergeRefs<BaseTextInputRef>(ref, optionsRef);

    const handleTextInputChange = (text: string) => {
        onChangeText?.(text);
    };

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

    const handleFocus = () => {
        onFocusChange(true);
    };

    const handleBlur = () => {
        onFocusChange(false);
    };

    if (!shouldShowTextInput) {
        return null;
    }

    return (
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
                shouldIgnorePasswordManager={shouldIgnorePasswordManager}
                selectTextOnFocus
                spellCheck={false}
                onSubmitEditing={onSubmit}
                onPress={onPress}
                submitBehavior={dataLength ? 'blurAndSubmit' : 'submit'}
                isLoading={isLoading}
                shouldHideClearButton={false}
                testID="selection-list-text-input"
                sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.SEARCH_INPUT}
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
    );
}

function TextInput({shouldShowLoadingPlaceholder, isLoadingNewOptions, ...props}: TextInputProps) {
    const {translate} = useLocalize();
    const {options, dataLength, shouldShowTextInput} = props;
    const hasNoData = dataLength === 0 && !shouldShowLoadingPlaceholder;
    const shouldShowMessage = !isLoadingNewOptions || options?.headerMessage !== translate('common.noResultsFound') || hasNoData;

    return (
        <>
            <SelectionListTextField {...props} />
            {shouldShowTextInput && (
                <SelectionListSearchStatus
                    query={options?.value ?? ''}
                    itemCount={dataLength ?? 0}
                    message={shouldShowMessage ? options?.headerMessage : undefined}
                    isLoading={isLoadingNewOptions}
                    shouldAnnounceSuggestions={!shouldShowLoadingPlaceholder}
                    style={options?.style?.headerMessageStyle}
                />
            )}
        </>
    );
}

export default TextInput;
export {SelectionListTextField};
