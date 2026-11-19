import type {ComposerRef} from '@components/Composer/types';

import type {ComponentRef, RefObject} from 'react';
import type {TextInput} from 'react-native';

type PreventTextInputFocusOnFirstResponderOnce = (composerRef: RefObject<ComponentRef<typeof TextInput> | ComposerRef | null>) => void;

// eslint-disable-next-line import/prefer-default-export
export type {PreventTextInputFocusOnFirstResponderOnce};
