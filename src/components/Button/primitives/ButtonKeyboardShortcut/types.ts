import type {GestureResponderEvent} from 'react-native';

type ValidateSubmitShortcut = (isDisabled: boolean, isLoading: boolean, event?: GestureResponderEvent | KeyboardEvent) => boolean;

export default ValidateSubmitShortcut;
