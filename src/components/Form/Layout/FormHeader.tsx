import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FormHeaderProps = {
    /** The form's title */
    title?: string;

    /** Makes the title a heading of this level for screen readers */
    titleAriaLevel?: number;

    /** The text under the title. A string is drawn as supporting text, anything else as it is. */
    description?: ReactNode;

    /** Extra content under the title and the description */
    children?: ReactNode;

    /** Horizontal styles, such as `styles.ph5` in a form without its own horizontal padding */
    style?: StyleProp<ViewStyle>;
};

/** The title and the description at the top of a form, with the form's header gap between them */
function FormHeader({title, titleAriaLevel, description, children, style}: FormHeaderProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.formHeader, style]}>
            {!!title && (
                <Text
                    style={styles.textHeadlineLineHeightXXL}
                    accessibilityRole={titleAriaLevel ? CONST.ROLE.HEADER : undefined}
                    aria-level={titleAriaLevel}
                >
                    {title}
                </Text>
            )}
            {!!description && (typeof description === 'string' ? <Text style={styles.textSupporting}>{description}</Text> : description)}
            {children}
        </View>
    );
}

export default FormHeader;
