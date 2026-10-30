import renderDynamicField from '@components/DynamicForm/renderDynamicField';
import type {DynamicFieldContext} from '@components/DynamicForm/renderers/types';
import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getLocalizedText, {getFieldLabel, getInputLabel} from '@components/DynamicForm/utils/getLocalizedText';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import {getListItems} from '@components/DynamicForm/utils/listItems';
import summarizeListItem, {getListItemFallbackTitle} from '@components/DynamicForm/utils/summarizeListItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {DynamicFormFieldsProps} from './DynamicFormFields';

type DynamicFormFieldRowProps = Pick<DynamicFormFieldsProps, 'values' | 'maxFileSize' | 'onRefreshRequirements' | 'onOpenListItemEditor' | 'onListItemsChange' | 'isSensitive'> &
    Required<Pick<DynamicFormFieldsProps, 'currency'>> &
    Pick<DynamicFieldContext, 'renderFields'> & {
        field: DynamicFormField;

        /** The field is the page's only question, so a choice is drawn as the page itself instead of as a row */
        isLoneField: boolean;

        /** The page title already says what the field asks, so its label is not drawn above the input. Inputs keep their own accessibility name. */
        shouldHideLabel?: boolean;
    };

/** Typed answers change on every keystroke, so they ask for new requirements when the user leaves the input instead */
const TYPED_FIELD_TYPES = new Set<DynamicFormFieldType>(['text', 'number', 'amount', 'percent']);

/** One field of a schema-driven form: its input, or its value when the field is readonly */
function DynamicFormFieldRow({
    field,
    values,
    currency,
    maxFileSize,
    isLoneField,
    shouldHideLabel = false,
    onRefreshRequirements,
    onOpenListItemEditor,
    onListItemsChange,
    isSensitive = false,
    renderFields,
}: DynamicFormFieldRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const label = getFieldLabel(field, translate);

    if (field.readonly) {
        // A list's answer is its entries, which formatDynamicFieldValue cannot name, so they are listed by their titles
        const readonlyValue =
            field.type === 'list'
                ? getListItems(values[field.key])
                      .map((item, index) => summarizeListItem(item, field.itemFields, translate, getListItemFallbackTitle(field, index, translate)).title)
                      .join(', ')
                : formatDynamicFieldValue(field, values, translate);
        return (
            <View
                style={[styles.mhn5, styles.pv1]}
                fsClass={CONST.FULLSTORY.CLASS.MASK}
            >
                <MenuItemField
                    name={label}
                    value={readonlyValue}
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

    const isTypedField = TYPED_FIELD_TYPES.has(field.type);
    const shouldRefreshOnBlur = !!field.refreshOnChange && isTypedField;
    const shouldRefreshOnChange = !!field.refreshOnChange && !isTypedField;
    const {input, isMenuRow, labelAbove, showsDescription} = renderDynamicField(
        field,
        {values, translate, styles, currency, maxFileSize, isLoneField, onOpenListItemEditor, onListItemsChange, isSensitive, renderFields},
        {
            inputID: field.key,
            shouldSaveDraft: !isSensitive && !isSensitiveField(field),
            forwardedFSClass: CONST.FULLSTORY.CLASS.MASK,
            onValueChange: shouldRefreshOnChange ? (value, key) => onRefreshRequirements?.(key, value) : undefined,
            onBlur: shouldRefreshOnBlur ? refreshRequirements : undefined,
        },
    );
    const description = showsDescription ? undefined : getLocalizedText(translate, field.descriptionKey, field.description);

    // Some inputs, such as CountryPicker, do not pass the FullStory class on, so the whole row is masked
    return (
        <View
            style={isMenuRow ? [styles.mhn5, styles.pv1] : styles.pv2}
            fsClass={CONST.FULLSTORY.CLASS.MASK}
        >
            {!!labelAbove && !shouldHideLabel && (
                <Text
                    style={[labelAbove === 'prompt' ? styles.mt3 : [styles.textStrong, styles.mb3], isMenuRow && styles.ph5]}
                    role={labelAbove === 'heading' ? CONST.ROLE.HEADING : undefined}
                    aria-level={labelAbove === 'heading' ? 3 : undefined}
                >
                    {getInputLabel(field, translate)}
                </Text>
            )}
            {!!description && <Text style={[styles.textSupporting, styles.mb3, isMenuRow && styles.ph5]}>{description}</Text>}
            {input}
        </View>
    );
}

export default DynamicFormFieldRow;
