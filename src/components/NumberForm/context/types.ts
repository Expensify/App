import type {NumberFormNegativeMode, NumberFormRef} from '@components/NumberForm/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';

type SetValueOptions = {
    /** Whether `onInputChange` should be called with the new value. Defaults to `true`. */
    notify?: boolean;

    /**
     * Called with the previous value from inside the state updater, so callers can derive cursor positions against a
     * value that is never stale - even when `setValue` runs more than once before the next render.
     */
    onPreviousValue?: (previousValue: string) => void;
};

type NumberFormStateContextValue = {
    value: string;
    negativeMode: NumberFormNegativeMode;
    errorText?: string;
};

type NumberFormActionsContextValue = {
    onBlur?: BaseTextInputProps['onBlur'];
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];
    inputRef?: ForwardedRef<BaseTextInputRef>;
    numberFormRef?: ForwardedRef<NumberFormRef>;
    setValue: (value: string, options?: SetValueOptions) => void;
};

type NumberFormContext = NumberFormStateContextValue & NumberFormActionsContextValue;

export type {NumberFormActionsContextValue, NumberFormContext, NumberFormStateContextValue, SetValueOptions};
