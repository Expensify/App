import type {NativeSyntheticEvent, ReturnKeyTypeOptions, TextInputFocusEventData, TextInputSubmitEditingEventData} from 'react-native';

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
    shouldDelayFocus?: boolean;
    isFocused: boolean;
};

export default RoomNameInputProps;
