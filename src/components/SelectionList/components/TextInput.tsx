import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import type {TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';
import BaseTextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useStatusMessageAccessibilityAnnouncement from '@components/utils/useStatusMessageAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
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
    shouldShowLoadingPlaceholder?: boolean;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;

    /** Function to focus text input component */
    focusTextInput: () => void;
};

const DELAY_FOR_ACCESSIBILITY_TREE_SYNC = 100;

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
    const {translate} = useLocalize();
    const {label, value, onChangeText, errorText, headerMessage, hint, disableAutoFocus, placeholder, maxLength, inputMode, ref: optionsRef, style, disableAutoCorrect} = options ?? {};
    const noResultsFoundText = translate('common.noResultsFound');
    const isNoResultsFoundMessage = headerMessage === noResultsFoundText;
    const noData = dataLength === 0 && !shouldShowLoadingPlaceholder;
    const shouldShowHeaderMessage = !!shouldShowTextInput && !!headerMessage && (!isLoadingNewOptions || !isNoResultsFoundMessage || noData);
    const shouldAnnounceNoResults = shouldShowHeaderMessage && isNoResultsFoundMessage;
    const shouldUsePersistentLiveRegion = getPlatform() === CONST.PLATFORM.WEB;
    const [liveRegionMessage, setLiveRegionMessage] = useState('');
    const liveRegionToggleRef = useRef(false);

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

    useStatusMessageAccessibilityAnnouncement(headerMessage, shouldAnnounceNoResults);

    useEffect(() => {
        if (!shouldUsePersistentLiveRegion) {
            return;
        }

        if (!shouldAnnounceNoResults) {
            const clearTimeoutId = setTimeout(() => setLiveRegionMessage(''), 0);
            return () => clearTimeout(clearTimeoutId);
        }

        // Toggling content forces re-announcement even when the text doesn't change.
        const suffix = liveRegionToggleRef.current ? '\u200B' : '';
        liveRegionToggleRef.current = !liveRegionToggleRef.current;

        // Clear first so screen readers detect a change, then set the message on next tick.
        const clearTimeoutId = setTimeout(() => setLiveRegionMessage(''), 0);
        const timeoutId = setTimeout(() => setLiveRegionMessage(`${headerMessage}${suffix}`), DELAY_FOR_ACCESSIBILITY_TREE_SYNC);

        return () => {
            clearTimeout(clearTimeoutId);
            clearTimeout(timeoutId);
        };
    }, [headerMessage, shouldAnnounceNoResults, shouldUsePersistentLiveRegion]);

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
                    autoCorrect={!disableAutoCorrect}
                />
            </View>
            {shouldShowHeaderMessage && (
                <View style={[styles.ph5, styles.pb5, style?.headerMessageStyle]}>
                    <Text
                        style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}
                        accessibilityLiveRegion={!shouldUsePersistentLiveRegion && shouldAnnounceNoResults ? 'polite' : undefined}
                    >
                        {headerMessage}
                    </Text>
                </View>
            )}
            {shouldUsePersistentLiveRegion && (
                <Text
                    style={[styles.accessibilityLiveRegionSROnly]}
                    accessibilityLiveRegion="polite"
                >
                    {liveRegionMessage}
                </Text>
            )}
        </>
    );
}

export default TextInput;
