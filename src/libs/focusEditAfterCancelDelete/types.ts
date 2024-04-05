import type {TextInput} from 'react-native';

type FocusEditAfterCancelDelete = (inputRef: TextInput | HTMLTextAreaElement | null) => void;

export default FocusEditAfterCancelDelete;
