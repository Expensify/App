import DynamicFormListItemModal from '@components/DynamicForm/components/DynamicFormListItemModal';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import summarizeListItem from '@components/DynamicForm/utils/summarizeListItem';
import ListField from '@components/ListField';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import {clearListItemEdit, startListItemEdit} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import type {ComponentProps, ReactNode} from 'react';

import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

type ListFieldAdapterProps = Pick<ComponentProps<typeof ListField>, 'addTitle' | 'addDescription'> &
    ForwardedFSClassProps & {
        /** Entries added so far */
        value?: DynamicFormListItem[];

        /** Called with every entry after one is added, edited or removed */
        onInputChange?: (value: DynamicFormListItem[]) => void;

        /** Called with the remaining entries after one is removed, for a list the flow keeps in memory */
        onItemsChange?: (value: DynamicFormListItem[]) => void;

        /** Validation error shown under the list */
        errorText?: string;

        /** Titles the modal editor of an entry whose answers give it no name */
        label: string;

        /** What one entry is, such as "owner", for the remove confirmation */
        itemLabel?: string;

        /** The fields of one entry, which name and describe its row */
        itemFields: DynamicFormField[];

        /** Hides the add row once the list holds this many entries */
        maxItems?: number;

        /** Opens the flow's editor page for a new entry. Without it, entries are edited in a modal on this page. */
        onAdd?: () => void;

        /** Opens the flow's editor page of an entry */
        onEdit?: (itemID: string) => void;

        /** Draws the entry's fields inside the modal editor */
        renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;
    };

/** The entries of a list field as rows. Removing one updates FormProvider's value; adding and editing open the flow's editor page, or a modal outside the flow. */
function ListFieldAdapter({
    value,
    onInputChange = () => {},
    onItemsChange,
    errorText,
    label,
    itemLabel,
    itemFields,
    maxItems,
    addTitle,
    addDescription,
    onAdd,
    onEdit,
    renderFields,
    forwardedFSClass,
}: ListFieldAdapterProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [editingID, setEditingID] = useState<string>();
    const items = Array.isArray(value) ? value : [];
    const editingItem = items.find((item) => item.id === editingID);
    const editingTitle = editingItem ? summarizeListItem(editingItem, itemFields, translate).title : '';
    let modalTitle = addTitle;
    if (editingItem) {
        modalTitle = editingTitle === '' ? label : editingTitle;
    }
    const sensitiveKeys = new Set(itemFields.filter(isSensitiveField).flatMap(getAnswerKeys));

    // Sensitive answers are not drafted, so the modal shows them blank and a blank one keeps the stored answer
    const openModal = (item?: DynamicFormListItem) => {
        const answers = Object.fromEntries(Object.entries(item ?? {}).filter(([key]) => key !== 'id' && !sensitiveKeys.has(key)));
        startListItemEdit(answers).then(() => setEditingID(item?.id ?? Str.guid()));
    };

    const closeModal = () => {
        setEditingID(undefined);
        clearListItemEdit();
    };

    const saveItem = (answers: DynamicFormValues) => {
        if (!editingID) {
            return;
        }
        const item: DynamicFormListItem = {...answers, id: editingID};
        onInputChange(editingItem ? items.map((existing) => (existing.id === editingID ? item : existing)) : [...items, item]);
        closeModal();
    };

    // The modal title takes no FullStory class, so only the masked prompt names the entry
    const confirmRemoval = (id: string) => {
        const item = items.find((candidate) => candidate.id === id);
        if (!item) {
            return;
        }
        showConfirmModal({
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            title: itemLabel ? translate('dynamicForm.removeItemTitle', {item: itemLabel}) : translate('common.remove'),
            prompt: (
                <View fsClass={forwardedFSClass}>
                    <Text>{translate('dynamicForm.removeItemPrompt', {name: summarizeListItem(item, itemFields, translate).title})}</Text>
                </View>
            ),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            const remainingItems = items.filter((candidate) => candidate.id !== id);
            onInputChange(remainingItems);
            onItemsChange?.(remainingItems);
        });
    };

    // ListField takes no FullStory class, so the mask goes on a View around it
    return (
        <>
            <View fsClass={forwardedFSClass}>
                <ListField
                    addTitle={addTitle}
                    addDescription={addDescription}
                    rows={items.map((item) => ({id: item.id, ...summarizeListItem(item, itemFields, translate)}))}
                    canAddMore={maxItems === undefined || items.length < maxItems}
                    errorText={errorText}
                    onAdd={onAdd ?? (() => openModal())}
                    onEdit={onEdit ?? ((id) => openModal(items.find((item) => item.id === id)))}
                    onRemove={confirmRemoval}
                />
            </View>
            {!onAdd && (
                <DynamicFormListItemModal
                    isVisible={!!editingID}
                    title={modalTitle}
                    itemFields={itemFields}
                    forwardedFSClass={forwardedFSClass}
                    keptAnswers={Object.fromEntries(Object.entries(editingItem ?? {}).filter(([key]) => sensitiveKeys.has(key)))}
                    renderFields={renderFields}
                    onSave={saveItem}
                    onClose={closeModal}
                />
            )}
        </>
    );
}

export default ListFieldAdapter;
