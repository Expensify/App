import React from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import type {TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';
import BaseTextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TextInputProps = {
    /** Reference to the BaseTextInput component */
    ref?: React.Ref<BaseTextInputRef> | null;

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
    onFocusChange?: (focused: boolean) => void;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder?: boolean;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;
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
}: TextInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const headerMessage = options?.headerMessage;
    const resultsFound = headerMessage !== translate('common.noResultsFound');
    const noData = dataLength === 0 && !showLoadingPlaceholder;
    const shouldShowHeaderMessage = !!headerMessage && !isLoadingNewOptions && resultsFound && !noData;

    if (!shouldShowTextInput) {
        return null;
    }
    return (
        <View style={[styles.ph5, styles.pb3]}>
            <BaseTextInput
                ref={ref}
                onKeyPress={onKeyPress}
                onFocus={() => onFocusChange?.(true)}
                onBlur={() => onFocusChange?.(false)}
                label={options?.label}
                accessibilityLabel={accessibilityLabel}
                hint={options?.hint}
                role={CONST.ROLE.PRESENTATION}
                value={options?.value}
                placeholder={options?.placeholder}
                maxLength={options?.maxLength}
                onChangeText={options?.onChangeText}
                inputMode={options?.inputMode}
                selectTextOnFocus
                spellCheck={false}
                onSubmitEditing={onSubmit}
                submitBehavior={dataLength ? 'blurAndSubmit' : 'submit'}
                isLoading={isLoading}
                testID="selection-list-text-input"
                errorText={options?.errorText}
                shouldInterceptSwipe={false}
            />
            {shouldShowHeaderMessage && (
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
                </View>
            )}
        </View>
    );
}

TextInput.displayName = 'TextInput';

export default TextInput;
