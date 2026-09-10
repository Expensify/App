import type {ForwardedRef} from 'react';
import type {View, ViewProps} from 'react-native';

type FormElementProps = ViewProps & {
    ref?: ForwardedRef<View>;
};

export default FormElementProps;
