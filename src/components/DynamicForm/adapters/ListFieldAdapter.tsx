import DynamicFormListItemModal from '@components/DynamicForm/components/DynamicFormListItemModal';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import hasSensitiveAnswer from '@components/DynamicForm/utils/hasSensitiveAnswer';
import summarizeListItem, {getNumberedItemTitle} from '@components/DynamicForm/utils/summarizeListItem';
import ListField from '@components/ListField';
import type {ListFieldHandle} from '@components/ListField';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import {clearListItemEdit, startListItemEdit} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import type {ComponentProps, ComponentRef, ReactNode, Ref} from 'react';

import {Str} from 'expensify-common';
import React, {useImperativeHandle, useRef, useState} from 'react';
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

        /** Names an entry whose answers give it no name, when the list has no `itemLabel` */
        label: string;

        /** What one entry is, such as "owner", for the remove confirmation and for an entry whose answers give it no name */
        itemLabel?: string;

        /** The fields of one entry, which name and describe its row */
        itemFields: DynamicFormField[];

        /** The list is marked `sensitive`, so none of its entries' answers is drafted while the modal edits one */
        isSensitive?: boolean;

        /** Hides the add row once the list holds this many entries */
        maxItems?: number;

        /** Opens the flow's editor page for a new entry. Without it, entries are edited in a modal on this page. */
        onAdd?: () => void;

        /** Opens the flow's editor page of an entry */
        onEdit?: (itemID: string) => void;

        /** Draws the entry's fields inside the modal editor */
        renderFields: (fields: DynamicFormField[], values: DynamicFormValues, isSensitive: boolean) => ReactNode;

        /** Lets FormProvider scroll to the list and focus it when the user asks to fix the errors */
        ref?: Ref<ListFieldAdapterHandle>;
    };

type ListFieldAdapterHandle = Pick<ComponentRef<typeof View>, 'measureLayout'> & Pick<ListFieldHandle, 'focus'>;

/** The entries of a list field as rows. Removing one updates FormProvider's value. Adding and editing open the flow's editor page, or a modal outside the flow. */
function ListFieldAdapter({
    value,
    onInputChange = () => {},
    onItemsChange,
    errorText,
    label,
    itemLabel,
    itemFields,
    isSensitive = false,
    maxItems,
    addTitle,
    addDescription,
    onAdd,
    onEdit,
    renderFields,
    forwardedFSClass,
    ref,
}: ListFieldAdapterProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [editingID, setEditingID] = useState<string>();
    const containerRef = useRef<ComponentRef<typeof View>>(null);
    const listFieldRef = useRef<ListFieldHandle>(null);
    // Outlives `editingID`, which is cleared as the modal starts to close
    const editedItemIDRef = useRef<string>(undefined);
    const items = Array.isArray(value) ? value : [];
    const editingItem = items.find((item) => item.id === editingID);
    const summarize = (item: DynamicFormListItem) => summarizeListItem(item, itemFields, translate, getNumberedItemTitle(itemLabel ?? label, items.indexOf(item), translate));
    const modalTitle = editingItem ? summarize(editingItem).title : addTitle;
    const sensitiveKeys = new Set(itemFields.filter(hasSensitiveAnswer).flatMap(getAnswerKeys));
    const isKeptOutOfDraft = (key: string) => key !== 'id' && (isSensitive || sensitiveKeys.has(key));

    // Sensitive answers are not drafted, so the modal's inputs start from the stored entry instead. Every answer of a sensitive list is.
    const openModal = (item?: DynamicFormListItem) => {
        const answers = Object.fromEntries(Object.entries(item ?? {}).filter(([key]) => key !== 'id' && !isKeptOutOfDraft(key)));
        editedItemIDRef.current = item?.id;
        startListItemEdit(answers).then(() => setEditingID(item?.id ?? Str.guid()));
    };

    const closeModal = () => {
        setEditingID(undefined);
        clearListItemEdit();
    };

    useImperativeHandle(ref, () => ({
        measureLayout: (...args) => containerRef.current?.measureLayout(...args),
        focus: () => listFieldRef.current?.focus(),
    }));

    const saveItem = (answers: DynamicFormValues) => {
        if (!editingID) {
            return;
        }
        const item: DynamicFormListItem = {...answers, id: editingID};
        onInputChange(editingItem ? items.map((existing) => (existing.id === editingID ? item : existing)) : [...items, item]);
        closeModal();
    };

    // The add row drops focus when pressed and a full list hides it, so the modal can't give focus back by itself
    const handleModalHide = () => {
        if (editedItemIDRef.current) {
            listFieldRef.current?.focusRow(editedItemIDRef.current);
        } else {
            listFieldRef.current?.focusAddRow();
        }
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
                    <Text>{translate('dynamicForm.removeItemPrompt', {name: summarize(item).title})}</Text>
                </View>
            ),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            const removedIndex = items.indexOf(item);
            const remainingItems = items.filter((candidate) => candidate.id !== id);
            const nextFocusedItem = remainingItems.at(removedIndex) ?? (removedIndex > 0 ? remainingItems.at(removedIndex - 1) : undefined);
            onInputChange(remainingItems);
            onItemsChange?.(remainingItems);
            // The removed row's button had focus, so focus moves to the next row, else the previous one, once the list re-renders without it
            requestAnimationFrame(() => (nextFocusedItem ? listFieldRef.current?.focusRow(nextFocusedItem.id) : listFieldRef.current?.focusAddRow()));
        });
    };

    // ListField takes no FullStory class, so the mask goes on a View around it
    return (
        <>
            <View
                ref={containerRef}
                fsClass={forwardedFSClass}
            >
                <ListField
                    ref={listFieldRef}
                    addTitle={addTitle}
                    addDescription={addDescription}
                    rows={items.map((item) => ({id: item.id, ...summarize(item)}))}
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
                    keptAnswers={Object.fromEntries(Object.entries(editingItem ?? {}).filter(([key]) => isKeptOutOfDraft(key)))}
                    isSensitive={isSensitive}
                    renderFields={renderFields}
                    onSave={saveItem}
                    onClose={closeModal}
                    onModalHide={handleModalHide}
                />
            )}
        </>
    );
}

export default ListFieldAdapter;
