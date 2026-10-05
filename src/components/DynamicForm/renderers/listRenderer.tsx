import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import getLocalizedText, {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import InputWrapper from '@components/Form/InputWrapper';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

const renderList: DynamicFieldRenderer<'list'> = (field, {translate, isLoneField, onOpenListItemEditor, renderFields}, inputProps) => {
    const itemLabel = getLocalizedText(translate, field.itemLabelKey, field.itemLabel);
    return {
        isMenuRow: true,
        labelAbove: isLoneField ? undefined : 'heading',
        input: (
            <InputWrapper
                InputComponent={ListFieldAdapter}
                {...inputProps}
                // Outside the flow sensitive entry answers stay in the list value, which must not reach the draft
                shouldSaveDraft={inputProps.shouldSaveDraft && (!!onOpenListItemEditor || !field.itemFields.some(isSensitiveField))}
                valueType="listItems"
                label={getFieldLabel(field, translate)}
                itemFields={field.itemFields}
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
