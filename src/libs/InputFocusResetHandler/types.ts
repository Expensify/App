import type {MutableRefObject} from 'react';
import type {TextInput} from 'react-native';

type InputFocusResetHandler = {
    handleInputFocusReset: (inputRef: MutableRefObject<TextInput | null>, shouldResetFocusRef: React.MutableRefObject<boolean>) => void;
};

export default InputFocusResetHandler;
