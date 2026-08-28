import type {NumericInputBaseProps, NumericInputRef} from '@components/NumericInputController/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

type NumericFieldRef = NumericInputRef;

type NumericTextInputProps = NumericInputBaseProps & Pick<BaseTextInputProps, 'inputMode' | 'label' | 'onSubmitEditing' | 'prefixStyle' | 'suffixStyle'>;

export type {NumericFieldRef, NumericTextInputProps};
