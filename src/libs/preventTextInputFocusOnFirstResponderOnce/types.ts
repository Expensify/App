import type {RefObject} from 'react';
import type {TextInput} from 'react-native';

type PreventTextInputFocusOnFirstResponderOnce = (composerRef: RefObject<TextInput | null>) => void;

// eslint-disable-next-line import/prefer-default-export
export type {PreventTextInputFocusOnFirstResponderOnce};
