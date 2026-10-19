import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import getLocalizedText, {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import hasSensitiveAnswer from '@components/DynamicForm/utils/hasSensitiveAnswer';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import {getListItems} from '@components/DynamicForm/utils/listItems';
import InputWrapper from '@components/Form/InputWrapper';

import type {DynamicFormListItem} from '@src/types/onyx';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

const renderList: DynamicFieldRenderer<'list'> = (field, {translate, values, onOpenListItemEditor, onListItemsChange, renderFields}, inputProps) => {
    const itemLabel = getLocalizedText(translate, field.itemLabelKey, field.itemLabel);
    // A sensitive list is not drafted, so inside the flow its entries come from memory, which the editor page and a removal both update
    const isMemoryList = !!onOpenListItemEditor && isSensitiveField(field);
    return {
        isMenuRow: true,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={ListFieldAdapter}
                {...inputProps}
                // Outside the flow sensitive entry answers stay in the list value, which must not reach the draft
                shouldSaveDraft={inputProps.shouldSaveDraft && (!!onOpenListItemEditor || !field.itemFields.some(hasSensitiveAnswer))}
                valueType="listItems"
                value={isMemoryList ? getListItems(values[field.key]) : undefined}
                onItemsChange={isMemoryList ? (items: DynamicFormListItem[]) => onListItemsChange?.(field.key, items) : undefined}
                label={getFieldLabel(field, translate)}
                itemLabel={itemLabel}
                itemFields={field.itemFields}
                isSensitive={isSensitiveField(field)}
                maxItems={field.maxItems}
                addTitle={itemLabel ? translate('dynamicForm.addItem', {item: itemLabel}) : translate('common.add')}
                addDescription={getLocalizedText(translate, field.addItemDescriptionKey, field.addItemDescription)}
                onAdd={onOpenListItemEditor && (() => onOpenListItemEditor(field.key))}
                onEdit={onOpenListItemEditor && ((itemID) => onOpenListItemEditor(field.key, itemID))}
                renderFields={renderFields}
            />
        ),
    };
};

export default renderList;
