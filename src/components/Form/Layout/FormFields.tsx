import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FormFieldsProps = {
    children: ReactNode;

    /** Flex or horizontal styles. The space between the fields is the form's field gap and is not set here. */
    style?: StyleProp<ViewStyle>;
};

/** The fields of a form, one under another with the form's field gap between them */
function FormFields({children, style}: FormFieldsProps) {
    const styles = useThemeStyles();
    return <View style={[styles.formFields, style]}>{children}</View>;
}

export default FormFields;
