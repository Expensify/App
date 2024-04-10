import type {NativeSyntheticEvent, ReturnKeyTypeOptions, TextInputFocusEventData, TextInputSubmitEditingEventData} from 'react-native';
import type {MaybePhraseKey} from '@libs/Localize';

type RoomNameInputProps = {
    value?: string;
    disabled?: boolean;
    errorText?: MaybePhraseKey;
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
