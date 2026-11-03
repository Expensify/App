import type {WebComposerRef} from '@components/Composer/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ComponentRef} from 'react';
import type {TextInput} from 'react-native';

type UpdateMultilineInputRange = (input: HTMLInputElement | BaseTextInputRef | ComponentRef<typeof TextInput> | WebComposerRef | null, shouldAutoFocus?: boolean) => void;

export default UpdateMultilineInputRange;
