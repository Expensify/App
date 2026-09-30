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

    /** Defaults to true. Sensitive fields, and lists whose items have sensitive fields edited in a modal, are never drafted regardless. */
    shouldSaveDraft?: boolean;

    /** Opens the flow's editor page for a list item. Without it, lists edit items in a modal. */
    onOpenListItemEditor?: (fieldKey: string, itemID?: string) => void;
};

function DynamicFormFields({fields, values, currency, shouldSaveDraft = true, onOpenListItemEditor}: DynamicFormFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const visibleFields = fields.filter((field) => isFieldVisible(field, values, fields));
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
            {visibleFields.map((field, index) => {
                const label = getFieldLabel(field, translate);
                const previousField = index > 0 ? visibleFields.at(index - 1) : undefined;
                const isSectionStart = !!field.section && previousField?.section !== field.section;
                const sectionTitle = isSectionStart ? (
                    <Text style={[styles.textStrong, styles.mb2, index > 0 && styles.mt3]}>{field.sectionLabelKey ? translate(field.sectionLabelKey) : field.section}</Text>
                ) : null;
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
                const input = getInputComponentForField(field, {
                    values,
                    translate,
                    currency,
                    isAloneOnPage,
                    renderFields,
                    openListItemEditor: onOpenListItemEditor,
                });
                if (!input) {
                    return null;
                }
                const {InputComponent, inputProps, isMenuRow, shouldRenderLabelAbove, isLabelAboveQuestion} = input;
                const description = field.type === 'text' || field.type === 'number' ? undefined : getFieldDescription(field, translate);
                return (
                    <React.Fragment key={field.key}>
                        {sectionTitle}
                        <View style={isMenuRow ? [styles.mhn5, styles.pv1] : styles.pv2}>
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
                    </React.Fragment>
                );
            })}
        </>
    );
}

export default DynamicFormFields;
