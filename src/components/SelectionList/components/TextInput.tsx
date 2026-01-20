import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import type {TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';
import BaseTextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import mergeRefs from '@libs/mergeRefs';
import CONST from '@src/CONST';

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
    showLoadingPlaceholder?: boolean;

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
    showLoadingPlaceholder,
    isLoadingNewOptions,
    shouldShowTextInput,
    focusTextInput,
}: TextInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {label, value, onChangeText, errorText, headerMessage, hint, disableAutoFocus, placeholder, maxLength, inputMode, ref: optionsRef, style} = options ?? {};
    const resultsFound = headerMessage !== translate('common.noResultsFound');
    const noData = dataLength === 0 && !showLoadingPlaceholder;
    const shouldShowHeaderMessage = !!headerMessage && (!isLoadingNewOptions || resultsFound || noData);

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
            if (!shouldShowTextInput || disableAutoFocus) {
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
        }, [shouldShowTextInput, disableAutoFocus, focusTextInput]),
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
                    label={label}
                    accessibilityLabel={accessibilityLabel}
                    hint={hint}
                    role={CONST.ROLE.PRESENTATION}
                    value={value}
                    placeholder={placeholder}
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
                    shouldInterceptSwipe={false}
                />
            </View>
            {shouldShowHeaderMessage && (
                <View style={[styles.ph5, styles.pb5, style?.headerMessageStyle]}>
                    <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
                </View>
            )}
        </>
    );
}

export default TextInput;
