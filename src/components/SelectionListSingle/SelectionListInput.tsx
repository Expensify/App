import React from 'react';
import type {InputModeOptions, NativeSyntheticEvent, TextInputKeyPressEventData} from 'react-native';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SelectionListTextInputOptions = {
    onChangeText?: (text: string) => void;
    textInputLabel?: string;
    textInputValue?: string;
    textInputHint?: string;
    textInputPlaceholder?: string;
    textInputMaxLength?: number;
    inputMode?: InputModeOptions;
    textInputErrorText?: string;
};

type SelectionListTextInputProps = {
    ref?: React.Ref<BaseTextInputRef> | null;
    options?: SelectionListTextInputOptions;
    isLoading?: boolean;
    dataLength: number;
    onSubmit: () => void;
    onKeyPress?: (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
    onFocusChange?: (focused: boolean) => void;
};

function SelectionListTextInput({ref, options, isLoading = false, dataLength, onSubmit, onKeyPress, onFocusChange}: SelectionListTextInputProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.ph5, styles.pb3]}>
            <TextInput
                ref={ref as React.Ref<BaseTextInputRef>}
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

SelectionListTextInput.displayName = 'SelectionListTextInput';

export default SelectionListTextInput;
