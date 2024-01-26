import type {KeyboardTypeOptions} from 'react-native';

type GetSecureEntryKeyboardType = (keyboardType: KeyboardTypeOptions | undefined, secureTextEntry: boolean, passwordHidden: boolean) => KeyboardTypeOptions | undefined;

export default GetSecureEntryKeyboardType;
