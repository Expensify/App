import renderDynamicField from '@components/DynamicForm/renderDynamicField';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getLocalizedText, {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import getVisibleFields, {getLoneField} from '@components/DynamicForm/utils/getVisibleFields';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import type {FormValue} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormSchemaField} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type DynamicFormFieldsProps = {
    /** Fields to render, in order. Fields of a type this App version does not know are left out. */
    fields: DynamicFormSchemaField[];

    /** Current answers, from FormProvider's render-prop `inputValues`, so showWhen and dependsOn follow the user's typing */
    values: DynamicFormValues;

    /** Currency of amount fields that let the user pick none */
    currency?: string;

    /** Called when the user changes a field marked `refreshOnChange`, with the draft key that changed, so the screen can fetch the schema again */
    onRefreshRequirements?: (inputID: string, value: FormValue) => void;
};

/** Typed answers change on every keystroke, so they ask for new requirements when the user leaves the input instead */
function isTypedField(field: DynamicFormField): boolean {
    return field.type === 'text' || field.type === 'number';
}

/** The inputs of a schema-driven form. Render it inside a FormProvider and validate with getDynamicFieldErrors. */
function DynamicFormFields({fields, values, currency = CONST.CURRENCY.USD, onRefreshRequirements}: DynamicFormFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const visibleFields = getVisibleFields(fields.filter(isSupportedField), values);
    const loneField = getLoneField(visibleFields);

    const refreshRequirements = (inputID: string) => {
        const value = values[inputID];
        if (value !== undefined) {
            onRefreshRequirements?.(inputID, value);
        }
    };

    return visibleFields.map((field, index) => {
        const label = getFieldLabel(field, translate);
        const isSectionStart = !!field.section && (index === 0 || visibleFields.at(index - 1)?.section !== field.section);
        const sectionTitle = isSectionStart && (
            <Text style={[styles.textStrong, styles.mb2, index > 0 && styles.mt3]}>{getLocalizedText(translate, field.sectionLabelKey, field.section)}</Text>
        );

        if (field.readonly) {
            return (
                <React.Fragment key={field.key}>
                    {sectionTitle}
                    <View style={[styles.mhn5, styles.pv1]}>
                        <MenuItemWithTopDescription
                            interactive={false}
                            description={label}
                            title={formatDynamicFieldValue(field, values, translate)}
                        />
                    </View>
                </React.Fragment>
            );
        }

        const shouldRefreshOnBlur = !!field.refreshOnChange && isTypedField(field);
        const shouldRefreshOnChange = !!field.refreshOnChange && !isTypedField(field);
        const {input, isMenuRow, labelAbove, showsDescription} = renderDynamicField(
            field,
            {values, translate, styles, currency, isLoneField: field === loneField},
            {
                inputID: field.key,
                shouldSaveDraft: !isSensitiveField(field),
                forwardedFSClass: CONST.FULLSTORY.CLASS.MASK,
                onValueChange: shouldRefreshOnChange ? (value, key) => onRefreshRequirements?.(key, value) : undefined,
                onBlur: shouldRefreshOnBlur ? () => refreshRequirements(field.key) : undefined,
            },
        );
        const description = showsDescription ? undefined : getLocalizedText(translate, field.descriptionKey, field.description);

        return (
            <React.Fragment key={field.key}>
                {sectionTitle}
                <View style={isMenuRow ? [styles.mhn5, styles.pv1] : styles.pv2}>
                    {!!labelAbove && <Text style={[labelAbove === 'prompt' ? styles.mt3 : [styles.textStrong, styles.mb3], isMenuRow && styles.ph5]}>{label}</Text>}
                    {!!description && <Text style={[styles.textSupporting, styles.mb3, isMenuRow && styles.ph5]}>{description}</Text>}
                    {input}
                </View>
            </React.Fragment>
        );
    });
}

export default DynamicFormFields;
export type {DynamicFormFieldsProps};
