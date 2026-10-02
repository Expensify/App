import renderDynamicField from '@components/DynamicForm/renderDynamicField';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getLocalizedText, {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import getVisibleFields from '@components/DynamicForm/utils/getVisibleFields';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormField} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type DynamicFormFieldsProps = {
    fields: DynamicFormField[];

    /** Current answers, from FormProvider's render-prop `inputValues`, so showWhen and dependsOn follow the user's typing */
    values: DynamicFormValues;

    /** Currency of amount fields that let the user pick none */
    currency?: string;
};

/** The inputs of a schema-driven form. Render it inside a FormProvider and validate with getDynamicFieldErrors. */
function DynamicFormFields({fields, values, currency = CONST.CURRENCY.USD}: DynamicFormFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const visibleFields = getVisibleFields(fields, values);

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

        const {input, isMenuRow, labelAbove, showsDescription} = renderDynamicField(
            field,
            {values, translate, currency},
            {
                inputID: field.key,
                shouldSaveDraft: !field.sensitive,
                forwardedFSClass: CONST.FULLSTORY.CLASS.MASK,
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
