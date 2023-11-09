import {GestureResponderEvent} from 'react-native';

type ValidateSubmitShortcut = (isFocused: boolean, isDisabled: boolean, isLoading: boolean, event?: GestureResponderEvent | KeyboardEvent) => boolean;

export default ValidateSubmitShortcut;
