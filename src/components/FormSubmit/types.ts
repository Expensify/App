import type {ForwardedRef} from 'react';
import type React from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';

type FormSubmitProps = {
    children: React.ReactNode;
    onSubmit: () => void;
    style?: StyleProp<ViewStyle>;
};

type FormSubmitRef = ForwardedRef<View>;

export type {FormSubmitProps, FormSubmitRef};
