import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import InputWrapper from '@components/Form/InputWrapper';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

const renderList: DynamicFieldRenderer<'list'> = (field, {translate, onOpenListItemEditor}, inputProps) => {
    const itemLabel = getLocalizedText(translate, field.itemLabelKey, field.itemLabel);
    return {
        isMenuRow: true,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={ListFieldAdapter}
                {...inputProps}
                valueType="listItems"
                itemFields={field.itemFields}
                maxItems={field.maxItems}
                addTitle={itemLabel ? translate('dynamicForm.addItem', {item: itemLabel}) : translate('common.add')}
                addDescription={getLocalizedText(translate, field.addItemDescriptionKey, field.addItemDescription)}
                onAdd={() => onOpenListItemEditor?.(field.key)}
                onEdit={(itemID) => onOpenListItemEditor?.(field.key, itemID)}
            />
        ),
    };
};

export default renderList;
