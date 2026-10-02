import summarizeListItem from '@components/DynamicForm/utils/summarizeListItem';
import ListField from '@components/ListField';

import useLocalize from '@hooks/useLocalize';

import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import type {ComponentProps} from 'react';

import React from 'react';

type ListFieldAdapterProps = Pick<ComponentProps<typeof ListField>, 'addTitle' | 'addDescription' | 'onAdd' | 'onEdit'> & {
    value?: DynamicFormListItem[];
    onInputChange?: (value: DynamicFormListItem[]) => void;
    errorText?: string;

    /** The fields of one entry, which name and describe its row */
    itemFields: DynamicFormField[];

    maxItems?: number;
};

/** The entries of a list field as rows. Removing one updates FormProvider's value; adding and editing open the editor page through `onAdd` and `onEdit`. */
function ListFieldAdapter({value, onInputChange = () => {}, errorText, itemFields, maxItems, ...listFieldProps}: ListFieldAdapterProps) {
    const {translate} = useLocalize();
    const items = Array.isArray(value) ? value : [];

    return (
        <ListField
            {...listFieldProps}
            rows={items.map((item) => ({id: item.id, ...summarizeListItem(item, itemFields, translate)}))}
            canAddMore={maxItems === undefined || items.length < maxItems}
            errorText={errorText}
            onRemove={(id) => onInputChange(items.filter((item) => item.id !== id))}
        />
    );
}

export default ListFieldAdapter;
