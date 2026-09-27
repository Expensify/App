import type {ComponentRef, RefObject} from 'react';
import type {TextInput} from 'react-native';

type PreventTextInputFocusOnFirstResponderOnce = (composerRef: RefObject<ComponentRef<typeof TextInput> | null>) => void;

// eslint-disable-next-line import/prefer-default-export
export type {PreventTextInputFocusOnFirstResponderOnce};
