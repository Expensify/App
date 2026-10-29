import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FormSectionProps = {
    /** The section's heading */
    title?: string;

    /** Makes the title a heading of this level for screen readers */
    titleAriaLevel?: number;

    /** The text under the heading. A string is drawn as supporting text, anything else as it is. */
    description?: ReactNode;

    /** The section's content, usually a `FormFields` */
    children: ReactNode;

    /** Flex or horizontal styles */
    style?: StyleProp<ViewStyle>;
};

/** A titled part of a longer form. Sections are blocks of the form, so the form's block gap separates them. */
function FormSection({title, titleAriaLevel, description, children, style}: FormSectionProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.formHeader, style]}>
            {!!title && (
                <Text
                    style={styles.textStrong}
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

export default FormSection;
