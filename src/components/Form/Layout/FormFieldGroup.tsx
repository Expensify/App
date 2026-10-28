import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FormFieldGroupProps = {
    children: ReactNode;

    /** Flex or horizontal styles. The space inside the group is the form's group gap and is not set here. */
    style?: StyleProp<ViewStyle>;
};

/** The parts of one field kept close together, such as a label, the input and a caption below it */
function FormFieldGroup({children, style}: FormFieldGroupProps) {
    const styles = useThemeStyles();
    return <View style={[styles.formFieldGroup, style]}>{children}</View>;
}

export default FormFieldGroup;
