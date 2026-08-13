import type {NumberFormNegativeMode} from '@components/NumberForm/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

type NumberFormStateContextValue = {
    value: string;
    negativeMode: NumberFormNegativeMode;
    errorText?: string;
};

type NumberFormActionsContextValue = {
    onBlur?: BaseTextInputProps['onBlur'];
    setValue: (value: string, options?: {notify?: boolean; key?: string}) => void;
};

type NumberFormContext = NumberFormStateContextValue & NumberFormActionsContextValue;

export type {NumberFormActionsContextValue, NumberFormContext, NumberFormStateContextValue};
