import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {ReactNode} from 'react';

type NumberFormNegativeMode = 'external' | 'inValue';

type NumberFormProps = {
    /** The canonical number value shared by composed primitives. */
    value?: string;

    /** Called when a composed primitive changes the canonical value. */
    onInputChange?: (value: string, key?: string) => void;

    /** Describes whether the negative sign is stored in the value or managed externally. */
    negativeMode?: NumberFormNegativeMode;

    /** Error supplied by FormProvider. */
    errorText?: string;

    /** Form callback supplied by InputWrapper. */
    onBlur?: BaseTextInputProps['onBlur'];

    children: ReactNode;
};

export type {NumberFormNegativeMode, NumberFormProps};
