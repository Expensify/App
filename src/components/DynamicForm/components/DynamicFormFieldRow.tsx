import renderDynamicField from '@components/DynamicForm/renderDynamicField';
import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getLocalizedText, {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormField} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {DynamicFormFieldsProps} from './DynamicFormFields';

type DynamicFormFieldRowProps = Pick<DynamicFormFieldsProps, 'values' | 'onRefreshRequirements'> &
    Required<Pick<DynamicFormFieldsProps, 'currency'>> & {
        field: DynamicFormField;

        /** The field is the page's only question, so a choice is drawn as the page itself instead of as a row */
        isLoneField: boolean;
    };

/** Typed answers change on every keystroke, so they ask for new requirements when the user leaves the input instead */
function isTypedField(field: DynamicFormField): boolean {
    return field.type === 'text' || field.type === 'number';
}

/** One field of a schema-driven form: its input, or its value when the field is readonly */
function DynamicFormFieldRow({field, values, currency, isLoneField, onRefreshRequirements}: DynamicFormFieldRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const label = getFieldLabel(field, translate);

    if (field.readonly) {
        return (
            <View style={[styles.mhn5, styles.pv1]}>
                <MenuItemWithTopDescription
                    interactive={false}
                    description={label}
                    title={formatDynamicFieldValue(field, values, translate)}
                />
            </View>
        );
    }

    const refreshRequirements = () => {
        const value = values[field.key];
        if (value !== undefined) {
            onRefreshRequirements?.(field.key, value);
        }
    };

    const shouldRefreshOnBlur = !!field.refreshOnChange && isTypedField(field);
    const shouldRefreshOnChange = !!field.refreshOnChange && !isTypedField(field);
    const {input, isMenuRow, labelAbove, showsDescription} = renderDynamicField(
        field,
        {values, translate, styles, currency, isLoneField},
        {
            inputID: field.key,
            shouldSaveDraft: !isSensitiveField(field),
            forwardedFSClass: CONST.FULLSTORY.CLASS.MASK,
            onValueChange: shouldRefreshOnChange ? (value, key) => onRefreshRequirements?.(key, value) : undefined,
            onBlur: shouldRefreshOnBlur ? refreshRequirements : undefined,
        },
    );
    const description = showsDescription ? undefined : getLocalizedText(translate, field.descriptionKey, field.description);

    return (
        <View style={isMenuRow ? [styles.mhn5, styles.pv1] : styles.pv2}>
            {!!labelAbove && <Text style={[labelAbove === 'prompt' ? styles.mt3 : [styles.textStrong, styles.mb3], isMenuRow && styles.ph5]}>{label}</Text>}
            {!!description && <Text style={[styles.textSupporting, styles.mb3, isMenuRow && styles.ph5]}>{description}</Text>}
            {input}
        </View>
    );
}

export default DynamicFormFieldRow;
