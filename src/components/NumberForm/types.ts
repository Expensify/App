import type {NumberInputBaseProps, NumberInputRef} from '@components/NumberInput/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

type NumberFormRef = NumberInputRef;

type NumberFormTextInputProps = NumberInputBaseProps & Pick<BaseTextInputProps, 'inputMode' | 'label' | 'onSubmitEditing' | 'prefixStyle' | 'suffixStyle'>;

export type {NumberFormRef, NumberFormTextInputProps};
