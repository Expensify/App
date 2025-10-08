import type {NativeSyntheticEvent, ReturnKeyTypeOptions, TextInputFocusEventData, TextInputSubmitEditingEventData} from 'react-native';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import type {ForwardedRef} from 'react';

type RoomNameInputProps = {
    value?: string;
    disabled?: boolean;
    errorText?: string;
    onChangeText?: (value: string) => void;
    onSubmitEditing?: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
    onInputChange?: (value: string) => void;
    returnKeyType?: ReturnKeyTypeOptions;
    inputID?: string;
    onBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
    autoFocus?: boolean;
    isFocused: boolean;
    ref?: ForwardedRef<BaseTextInputRef>;
};

export default RoomNameInputProps;
