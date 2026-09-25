import InputWrapper from '@components/Form/InputWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormField} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {DynamicFormValues} from './types';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getInputComponentForField, {getFieldDescription, getFieldLabel} from './getInputComponentForField';
import isFieldVisible from './isFieldVisible';

type DynamicFormFieldsProps = {
    fields: DynamicFormField[];

    /** Current answers, from FormProvider's render-prop `inputValues`, so showWhen and dependsOn follow the user's typing */
    values: DynamicFormValues;

    /** Currency for amount fields when the form has no `currency` answer */
    currency?: string;

    shouldSaveDraft?: boolean;

    /** Opens the flow's editor page for a list item; without it lists edit items in a modal */
    onOpenListItemEditor?: (fieldKey: string, itemID?: string) => void;
};

function DynamicFormFields({fields, values, currency, shouldSaveDraft = true, onOpenListItemEditor}: DynamicFormFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const visibleFields = fields.filter((field) => isFieldVisible(field, values));
    const isAloneOnPage = visibleFields.length === 1;
    const renderFields = (itemFields: DynamicFormField[], itemValues: DynamicFormValues) => (
        <DynamicFormFields
            fields={itemFields}
            values={itemValues}
            currency={currency}
            shouldSaveDraft={false}
        />
    );

    return (
        <>
            {visibleFields.map((field) => {
                const label = getFieldLabel(field, translate);
                if (field.readonly) {
                    return (
                        <View
                            key={field.key}
                            style={[styles.mhn5, styles.pv1]}
                        >
                            <MenuItemWithTopDescription
                                interactive={false}
                                description={label}
                                title={formatDynamicFieldValue(field, values, translate)}
                            />
                        </View>
                    );
                }
                const {InputComponent, inputProps, isMenuRow, shouldRenderLabelAbove, isLabelAboveQuestion} = getInputComponentForField(field, {
                    values,
                    translate,
                    currency,
                    isAloneOnPage,
                    renderFields,
                    openListItemEditor: onOpenListItemEditor,
                });
                const description = field.type === 'text' || field.type === 'number' ? undefined : getFieldDescription(field, translate);
                return (
                    <View
                        key={field.key}
                        style={isMenuRow ? [styles.mhn5, styles.pv1] : styles.pv2}
                    >
                        {!!shouldRenderLabelAbove && (
                            <Text
                                style={[
                                    isLabelAboveQuestion ? styles.mt3 : [styles.textNormalThemeText, styles.textLineHeightNormal, styles.textStrong, styles.mb3],
                                    isMenuRow && styles.ph5,
                                ]}
                            >
                                {label}
                            </Text>
                        )}
                        {!!description && <Text style={[styles.textSupporting, styles.mb3, isMenuRow && styles.ph5]}>{description}</Text>}
                        <InputWrapper
                            InputComponent={InputComponent}
                            inputID={field.key}
                            label={label}
                            shouldSaveDraft={shouldSaveDraft && !field.sensitive && (!!onOpenListItemEditor || !field.itemFields?.some((itemField) => itemField.sensitive))}
                            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                            {...inputProps}
                        />
                    </View>
                );
            })}
        </>
    );
}

export default DynamicFormFields;
