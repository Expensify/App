import type {BlurEvent, NativeSyntheticEvent, ReturnKeyTypeOptions, TextInputFocusEventData, TextInputSubmitEditingEventData} from 'react-native';

type RoomNameInputProps = {
    value?: string;
    disabled?: boolean;
    errorText?: string;
    onChangeText?: (value: string) => void;
    onSubmitEditing?: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
    onInputChange?: (value: string) => void;
    returnKeyType?: ReturnKeyTypeOptions;
    inputID?: string;
    onBlur?: (event: BlurEvent) => void;
    autoFocus?: boolean;
    isFocused: boolean;
};

export default RoomNameInputProps;
