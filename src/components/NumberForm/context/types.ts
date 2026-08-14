import type {NumberFormNegativeMode, NumberFormRef} from '@components/NumberForm/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';

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
    setValue: (value: string, options?: {notify?: boolean}) => void;
};

type NumberFormContext = NumberFormStateContextValue & NumberFormActionsContextValue;

export type {NumberFormActionsContextValue, NumberFormContext, NumberFormStateContextValue};
