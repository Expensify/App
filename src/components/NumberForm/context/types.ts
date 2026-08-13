import type {NumberFormNegativeMode, NumberFormRef} from '@components/NumberForm/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';

type SetValueOptions = {
    /** Whether `onInputChange` should be called with the new value. Defaults to `true`. */
    notify?: boolean;
};

type NumberFormStateContextValue = {
    value: string;

    /**
     * The `value` prop exactly as passed to `NumberForm`, before any internal editing state. The decimals-change effect
     * reads this the way the legacy component read its own `number` prop, so an intentionally empty field is left alone.
     */
    externalValue: string;
    negativeMode: NumberFormNegativeMode;
    errorText?: string;
};

type NumberFormActionsContextValue = {
    onBlur?: BaseTextInputProps['onBlur'];
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];
    inputRef?: ForwardedRef<BaseTextInputRef>;
    numberFormRef?: ForwardedRef<NumberFormRef>;
    setValue: (value: string, options?: SetValueOptions) => string;
};

type NumberFormContext = NumberFormStateContextValue & NumberFormActionsContextValue;

export type {NumberFormActionsContextValue, NumberFormContext, NumberFormStateContextValue, SetValueOptions};
