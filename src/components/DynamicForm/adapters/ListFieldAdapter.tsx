import UserAvatar from '@components/Avatar/UserAvatar';
import Button from '@components/Button';
import formatDynamicFieldValue from '@components/DynamicForm/formatDynamicFieldValue';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import FormProvider from '@components/Form/FormProvider';
import type {FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLetterAvatarURL} from '@libs/UserAvatarUtils';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import variables from '@src/styles/variables';
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

    /** The fields of one item */
    itemFields: DynamicFormField[];

    maxItems?: number;

    /** Renders the item's fields inside the editor form */
    renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;

    /** Opens the flow's editor page for an item; without it the editor is a modal on this page */
    onOpenEditor?: (itemID?: string) => void;
};

const SUMMARY_DESCRIPTION_LIMIT = 2;
const SUMMARY_SKIPPED_TYPES = new Set<DynamicFormField['type']>(['date', 'address', 'country', 'file']);

/** The leading run of text answers names the row, as first and last name do; up to two short remaining answers describe it */
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
    if (titleFields.length === 0 && shownFields.length > 0) {
        titleFields.push(shownFields[0]);
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
    const theme = useTheme();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Close']);
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

    const confirmRemoval = (item: DynamicFormListItem) => {
        const name = summarizeItem(item, itemFields, translate).title;
        showConfirmModal({
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            title: translate('dynamicForm.removeItemTitle', {name}),
            prompt: translate('dynamicForm.removeItemPrompt', {name}),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            onInputChange(items.filter((existing) => existing.id !== item.id));
        });
    };

    return (
        <>
            {items.map((item) => {
                const summary = summarizeItem(item, itemFields, translate);
                const [firstName = '', ...otherNames] = summary.title.trim().split(/\s+/);
                const colorSeed = [...summary.title].reduce((sum, character) => sum + character.charCodeAt(0), 0);
                const letterAvatarURL = getLetterAvatarURL(colorSeed, firstName, otherNames.at(-1) ?? '', '');
                return (
                    <MenuItem.Root key={item.id}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    source={letterAvatarURL || undefined}
                                    accountID={CONST.DEFAULT_NUMBER_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>{summary.title}</MenuItem.Title>
                                {!!summary.description && <MenuItem.Description>{summary.description}</MenuItem.Description>}
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                    <Button
                                        size={CONST.BUTTON_SIZE.SMALL}
                                        accessibilityLabel={`${translate('common.edit')} ${summary.title}`}
                                        onPress={() => openEditor(item)}
                                    >
                                        <Button.Text>{translate('common.edit')}</Button.Text>
                                    </Button>
                                    <PressableWithFeedback
                                        sentryLabel="DynamicFormList-RemoveItem"
                                        accessibilityLabel={`${translate('common.remove')} ${summary.title}`}
                                        accessibilityRole={CONST.ROLE.BUTTON}
                                        onPress={() => confirmRemoval(item)}
                                    >
                                        <Icon
                                            src={icons.Close}
                                            fill={theme.icon}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                        />
                                    </PressableWithFeedback>
                                </View>
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                );
            })}
            {canAddMore && (
                <MenuItem
                    icon={icons.Plus}
                    title={addTitle}
                    description={addItemDescription}
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
