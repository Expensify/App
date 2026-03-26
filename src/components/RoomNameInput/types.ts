import type {ForwardedRef} from 'react';
import type {BlurEvent, ReturnKeyTypeOptions, TextInputSubmitEditingEvent} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

type RoomNameInputProps = {
    value?: string;
    disabled?: boolean;
    errorText?: string;
    onChangeText?: (value: string) => void;
    onSubmitEditing?: (event: TextInputSubmitEditingEvent) => void;
    onInputChange?: (value: string) => void;
    returnKeyType?: ReturnKeyTypeOptions;
    inputID?: string;
    onBlur?: (event: BlurEvent) => void;
    autoFocus?: boolean;
    isFocused: boolean;
    ref?: ForwardedRef<BaseTextInputRef>;
};

export default RoomNameInputProps;
