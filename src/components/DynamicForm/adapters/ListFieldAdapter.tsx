import Button from '@components/Button';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import FormProvider from '@components/Form/FormProvider';
import type {FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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

    /** Field label, used as the item editor's title */
    label?: string;

    /** The fields of one item */
    itemFields: DynamicFormField[];

    maxItems?: number;

    /** Renders the item's fields inside the editor form */
    renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;
};

function summarizeItem(item: DynamicFormListItem, itemFields: DynamicFormField[]): {title: string; description: string} {
    const [first, second] = itemFields.map((field) => item[field.key]).filter((answer) => typeof answer === 'string' && answer !== '');
    return {title: typeof first === 'string' ? first : '', description: typeof second === 'string' ? second : ''};
}

/** Repeating group of sub-fields: a row per item, an add row, and a right-docked editor rendered through DynamicFormFields */
function ListFieldAdapter({value, onInputChange = () => {}, errorText = '', label = '', itemFields, maxItems, renderFields}: ListFieldAdapterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const [editingID, setEditingID] = useState<string | null>(null);
    const [, itemDraftMetadata] = useOnyx(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT);
    const items = Array.isArray(value) ? value : [];
    const isEditorOpen = editingID !== null;
    const canAddMore = maxItems === undefined || items.length < maxItems;

    const openEditor = (item?: DynamicFormListItem) => {
        clearDraftValues(ITEM_FORM_ID);
        if (item) {
            const {id, ...answers} = item;
            setDraftValues(ITEM_FORM_ID, answers);
            setEditingID(id);
            return;
        }
        setEditingID(Str.guid());
    };

    const closeEditor = () => {
        setEditingID(null);
        clearDraftValues(ITEM_FORM_ID);
    };

    const saveItem = (answers: FormOnyxValues<typeof ITEM_FORM_ID>) => {
        if (editingID === null) {
            return;
        }
        const item: DynamicFormListItem = {...answers, id: editingID};
        const isExisting = items.some((existing) => existing.id === editingID);
        onInputChange(isExisting ? items.map((existing) => (existing.id === editingID ? item : existing)) : [...items, item]);
        closeEditor();
    };

    const removeItem = () => {
        onInputChange(items.filter((existing) => existing.id !== editingID));
        closeEditor();
    };

    const isEditingExisting = items.some((existing) => existing.id === editingID);

    return (
        <>
            {items.map((item) => {
                const {title, description} = summarizeItem(item, itemFields);
                return (
                    <MenuItemWithTopDescription
                        key={item.id}
                        title={title}
                        description={description}
                        shouldShowRightIcon
                        onPress={() => openEditor(item)}
                    />
                );
            })}
            {canAddMore && (
                <MenuItem
                    icon={icons.Plus}
                    title={translate('common.add')}
                    onPress={() => openEditor()}
                />
            )}
            {!!errorText && (
                <View style={styles.ph5}>
                    <FormHelpMessage message={errorText} />
                </View>
            )}
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
                        title={label}
                        onBackButtonPress={closeEditor}
                    />
                    {isEditorOpen && !isLoadingOnyxValue(itemDraftMetadata) && (
                        <FormProvider
                            formID={ITEM_FORM_ID}
                            submitButtonText={translate('common.save')}
                            validate={(values) => getDynamicFieldErrors(itemFields, values, translate)}
                            onSubmit={saveItem}
                            style={[styles.mh5, styles.flexGrow1]}
                            submitButtonStyles={styles.mb0}
                            footerContent={
                                isEditingExisting ? (
                                    <Button
                                        variant={CONST.BUTTON_VARIANT.DANGER}
                                        size={CONST.BUTTON_SIZE.LARGE}
                                        style={styles.mt3}
                                        onPress={removeItem}
                                    >
                                        <Button.Text>{translate('common.remove')}</Button.Text>
                                    </Button>
                                ) : undefined
                            }
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
