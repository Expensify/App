import React from 'react';
import type {NativeSyntheticEvent, TextInputKeyPressEventData} from 'react-native';
import {View} from 'react-native';
import type {TextInputOptions} from '@components/SelectionListSingle/types';
import BaseTextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TextInputProps = {
    /** Reference to the BaseTextInput component */
    ref?: React.Ref<BaseTextInputRef> | null;

    /** Configuration options for the text input including label, placeholder, validation, etc. */
    options?: TextInputOptions;

    /** Whether the text input is loading */
    isLoading?: boolean;

    /** The number of items in the data array, used to determine submit behavior */
    dataLength: number;

    /** Callback function called when the text input is submitted */
    onSubmit: () => void;

    /** Function called when a key is pressed in the text input */
    onKeyPress?: (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;

    /** Function called when the text input focus changes */
    onFocusChange?: (focused: boolean) => void;
};

function TextInput({ref, options, isLoading = false, dataLength, onSubmit, onKeyPress, onFocusChange}: TextInputProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.ph5, styles.pb3]}>
            <BaseTextInput
                ref={ref}
                onKeyPress={onKeyPress}
                onFocus={() => onFocusChange?.(true)}
                onBlur={() => onFocusChange?.(false)}
                label={options?.textInputLabel}
                accessibilityLabel={options?.textInputLabel}
                hint={options?.textInputHint}
                role={CONST.ROLE.PRESENTATION}
                value={options?.textInputValue}
                placeholder={options?.textInputPlaceholder}
                maxLength={options?.textInputMaxLength}
                onChangeText={options?.onChangeText}
                inputMode={options?.inputMode}
                selectTextOnFocus
                spellCheck={false}
                onSubmitEditing={onSubmit}
                submitBehavior={dataLength ? 'blurAndSubmit' : 'submit'}
                isLoading={isLoading}
                testID="selection-list-text-input"
                errorText={options?.textInputErrorText}
                shouldInterceptSwipe={false}
            />
        </View>
    );
}

TextInput.displayName = 'TextInput';

export default TextInput;
