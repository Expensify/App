import type {NumericEditingBaseProps, NumericEditingRef} from '@components/NumericEditingController/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

type NumericFieldRef = NumericEditingRef;

type NumericTextInputProps = NumericEditingBaseProps & Pick<BaseTextInputProps, 'inputMode' | 'label' | 'onSubmitEditing' | 'prefixStyle' | 'suffixStyle'>;

export type {NumericFieldRef, NumericTextInputProps};
