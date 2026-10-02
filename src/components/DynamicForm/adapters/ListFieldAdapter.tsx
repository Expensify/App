import DynamicFormListItemModal from '@components/DynamicForm/components/DynamicFormListItemModal';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import summarizeListItem from '@components/DynamicForm/utils/summarizeListItem';
import ListField from '@components/ListField';

import useLocalize from '@hooks/useLocalize';

import {startListItemEdit} from '@userActions/DynamicForm';

import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import type {ComponentProps, ReactNode} from 'react';

import {Str} from 'expensify-common';
import React, {useState} from 'react';

type ListFieldAdapterProps = Pick<ComponentProps<typeof ListField>, 'addTitle' | 'addDescription'> & {
    value?: DynamicFormListItem[];
    onInputChange?: (value: DynamicFormListItem[]) => void;
    errorText?: string;

    /** The fields of one entry, which name and describe its row */
    itemFields: DynamicFormField[];

    maxItems?: number;

    /** Open the flow's editor page of an entry, or of a new one. Without them the editor is a modal on this page. */
    onAdd?: () => void;
    onEdit?: (itemID: string) => void;

    /** Draws the entry's fields inside the modal editor */
    renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;
};

/** The entries of a list field as rows. Removing one updates FormProvider's value; adding and editing open the flow's editor page, or a modal outside the flow. */
function ListFieldAdapter({value, onInputChange = () => {}, errorText, itemFields, maxItems, addTitle, addDescription, onAdd, onEdit, renderFields}: ListFieldAdapterProps) {
    const {translate} = useLocalize();
    const [editingID, setEditingID] = useState<string>();
    const items = Array.isArray(value) ? value : [];
    const editingItem = items.find((item) => item.id === editingID);
    const editingTitle = editingItem ? summarizeListItem(editingItem, itemFields, translate).title : '';
    const sensitiveKeys = new Set(itemFields.filter(isSensitiveField).map((field) => field.key));

    // Sensitive answers are not drafted, so the modal shows them blank and a blank one keeps the stored answer
    const openModal = (item?: DynamicFormListItem) => {
        const answers = Object.fromEntries(Object.entries(item ?? {}).filter(([key]) => key !== 'id' && !sensitiveKeys.has(key)));
        startListItemEdit(answers).then(() => setEditingID(item?.id ?? Str.guid()));
    };

    const saveItem = (answers: DynamicFormValues) => {
        if (!editingID) {
            return;
        }
        const item: DynamicFormListItem = {...answers, id: editingID};
        onInputChange(editingItem ? items.map((existing) => (existing.id === editingID ? item : existing)) : [...items, item]);
        setEditingID(undefined);
    };

    return (
        <>
            <ListField
                addTitle={addTitle}
                addDescription={addDescription}
                rows={items.map((item) => ({id: item.id, ...summarizeListItem(item, itemFields, translate)}))}
                canAddMore={maxItems === undefined || items.length < maxItems}
                errorText={errorText}
                onAdd={onAdd ?? (() => openModal())}
                onEdit={onEdit ?? ((id) => openModal(items.find((item) => item.id === id)))}
                onRemove={(id) => onInputChange(items.filter((item) => item.id !== id))}
            />
            {!onAdd && (
                <DynamicFormListItemModal
                    isVisible={!!editingID}
                    title={editingTitle === '' ? addTitle : editingTitle}
                    itemFields={itemFields}
                    keptAnswers={Object.fromEntries(Object.entries(editingItem ?? {}).filter(([key]) => sensitiveKeys.has(key)))}
                    renderFields={renderFields}
                    onSave={saveItem}
                    onClose={() => setEditingID(undefined)}
                />
            )}
        </>
    );
}

export default ListFieldAdapter;
