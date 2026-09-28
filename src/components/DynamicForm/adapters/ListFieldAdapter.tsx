import formatDynamicFieldValue from '@components/DynamicForm/formatDynamicFieldValue';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import FormProvider from '@components/Form/FormProvider';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ListField from '@components/ListField';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx/DynamicFormField';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ReactNode} from 'react';

import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

const ITEM_FORM_ID = ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM;

type ListFieldAdapterProps = {
    /** Items supplied by the FormProvider */
    value?: DynamicFormListItem[];

    /** Callback to update the items in the FormProvider */
    onInputChange?: (value: DynamicFormListItem[]) => void;

    errorText?: string;

    /** Field label, used as the fallback editor title */
    label?: string;

    /** Noun for one item, such as "owner", for the add row and the editor title */
    itemLabel?: string;

    /** Hint shown under the add row */
    addItemDescription?: string;

    /** Schema of one item. Fields marked sensitive are kept out of the item draft. */
    itemFields: DynamicFormField[];

    maxItems?: number;

    /** Renders the item's fields inside the editor form */
    renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;

    /** Opens the flow's editor page for an item. Without it, the editor is a modal on this page. */
    onOpenEditor?: (itemID?: string) => void;
};

const SUMMARY_DESCRIPTION_LIMIT = 2;
const SUMMARY_SKIPPED_TYPES = new Set<DynamicFormField['type']>(['date', 'address', 'country', 'file']);

/** The leading run of text answers names the row, as first and last name do. Up to two short remaining answers describe it. */
function summarizeItem(item: DynamicFormListItem, itemFields: DynamicFormField[], translate: LocalizedTranslate): {title: string; description: string} {
    const shownFields = itemFields.filter((field) => !field.sensitive && formatDynamicFieldValue(field, item, translate) !== '');
    const firstTextIndex = shownFields.findIndex((field) => field.type === 'text');
    const titleFields: DynamicFormField[] = [];
    for (const field of shownFields.slice(Math.max(firstTextIndex, 0))) {
        if (field.type !== 'text') {
            break;
        }
        titleFields.push(field);
    }
    const firstShownField = shownFields.at(0);
    if (titleFields.length === 0 && firstShownField) {
        titleFields.push(firstShownField);
    }
    const title = titleFields.map((field) => formatDynamicFieldValue(field, item, translate)).join(' ');
    const description = shownFields
        .filter((field) => !titleFields.includes(field) && !SUMMARY_SKIPPED_TYPES.has(field.type))
        .slice(0, SUMMARY_DESCRIPTION_LIMIT)
        .map((field) => formatDynamicFieldValue(field, item, translate))
        .join(', ');
    return {title, description};
}

function ListFieldAdapter({
    value,
    onInputChange = () => {},
    errorText = '',
    label = '',
    itemLabel,
    addItemDescription,
    itemFields,
    maxItems,
    renderFields,
    onOpenEditor,
}: ListFieldAdapterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [editingID, setEditingID] = useState<string | null>(null);
    const [, itemDraftMetadata] = useOnyx(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT);
    const items = Array.isArray(value) ? value : [];
    const sensitiveKeys = itemFields.filter((field) => field.sensitive).map((field) => field.key);
    const editingItem = items.find((existing) => existing.id === editingID);
    const isEditorOpen = editingID !== null;
    const canAddMore = maxItems === undefined || items.length < maxItems;
    const addTitle = itemLabel ? translate('dynamicForm.addItem', {item: itemLabel}) : translate('common.add');

    const openEditor = (item?: DynamicFormListItem) => {
        if (onOpenEditor) {
            onOpenEditor(item?.id);
            return;
        }
        clearDraftValues(ITEM_FORM_ID);
        if (item) {
            const {id, ...answers} = item;
            setDraftValues(ITEM_FORM_ID, Object.fromEntries(Object.entries(answers).filter(([key]) => !sensitiveKeys.includes(key))));
            setEditingID(id);
            return;
        }
        setEditingID(Str.guid());
    };

    const closeEditor = () => {
        setEditingID(null);
        clearDraftValues(ITEM_FORM_ID);
    };

    /** Sensitive answers are never drafted, so a blank one while editing keeps the item's stored value */
    const withKeptSensitiveAnswers = (answers: DynamicFormValues): DynamicFormValues => ({
        ...answers,
        ...Object.fromEntries(sensitiveKeys.filter((key) => (answers[key] ?? '') === '' && editingItem?.[key] !== undefined).map((key) => [key, editingItem?.[key]])),
    });

    const saveItem = (answers: FormOnyxValues<typeof ITEM_FORM_ID>) => {
        if (editingID === null) {
            return;
        }
        const item: DynamicFormListItem = {...withKeptSensitiveAnswers(answers), id: editingID};
        onInputChange(editingItem ? items.map((existing) => (existing.id === editingID ? item : existing)) : [...items, item]);
        closeEditor();
    };

    return (
        <>
            <ListField
                rows={items.map((item) => ({id: item.id, ...summarizeItem(item, itemFields, translate)}))}
                addTitle={addTitle}
                addDescription={addItemDescription}
                canAddMore={canAddMore}
                errorText={errorText}
                onAdd={() => openEditor()}
                onEdit={(id) => openEditor(items.find((existing) => existing.id === id))}
                onRemove={(id) => onInputChange(items.filter((existing) => existing.id !== id))}
            />
            <Modal
                onClose={closeEditor}
                isVisible={isEditorOpen}
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                shouldUseCustomBackdrop
                shouldHandleNavigationBack
            >
                <ScreenWrapper
                    includePaddingTop={false}
                    includeSafeAreaPaddingBottom={false}
                    testID="ListFieldEditor"
                >
                    <HeaderWithBackButton
                        title={editingItem ? summarizeItem(editingItem, itemFields, translate).title || label : addTitle}
                        onBackButtonPress={closeEditor}
                    />
                    {isEditorOpen && !isLoadingOnyxValue(itemDraftMetadata) && (
                        <FormProvider
                            formID={ITEM_FORM_ID}
                            submitButtonText={translate('common.save')}
                            validate={(values) => getDynamicFieldErrors(itemFields, withKeptSensitiveAnswers(values), translate)}
                            onSubmit={saveItem}
                            style={[styles.mh5, styles.flexGrow1]}
                            submitButtonStyles={styles.mb0}
                            enabledWhenOffline
                        >
                            {({inputValues}) => renderFields(itemFields, inputValues)}
                        </FormProvider>
                    )}
                </ScreenWrapper>
            </Modal>
        </>
    );
}

export default ListFieldAdapter;
export {summarizeItem};
