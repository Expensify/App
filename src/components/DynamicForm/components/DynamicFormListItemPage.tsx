import ActivityIndicator from '@components/ActivityIndicator';
import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import {getListItems, getListItemSensitiveAnswers, parseListItemPageName} from '@components/DynamicForm/utils/listItems';
import summarizeListItem, {getListItemFallbackTitle} from '@components/DynamicForm/utils/summarizeListItem';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
import FormHeader from '@components/Form/Layout/FormHeader';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearListItemEdit, startListItemEdit} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormListField} from '@src/types/onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import DynamicFormFields from './DynamicFormFields';

/** The editor of one list entry, or of a new one: the entry's fields and a Save button */
function DynamicFormListItemPage({currentPageName, allFields, values, currency, maxFileSize, onRefreshRequirements, onListItemSave}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const page = parseListItemPageName(currentPageName);
    const listField = allFields.find((field): field is DynamicFormListField => field.type === 'list' && field.key === page?.listKey);
    const items = listField ? getListItems(values[listField.key]) : [];
    const item = items.find((candidate) => candidate.id === page?.itemID);
    const [filledPageName, setFilledPageName] = useState<string>();
    // The entries of a sensitive list are never drafted, so the editor starts empty and its inputs take the entry's answers from memory
    const isSensitiveList = !!listField && isSensitiveField(listField);

    // The editor form is shared by every entry, so it is filled with this entry's answers before its inputs mount
    useEffect(() => {
        let isCancelled = false;
        startListItemEdit(isSensitiveList ? {} : (item ?? {})).then(() => {
            if (isCancelled) {
                return;
            }
            setFilledPageName(currentPageName);
        });
        return () => {
            isCancelled = true;
        };
    }, [currentPageName, item, isSensitiveList]);

    useEffect(() => clearListItemEdit, []);

    if (!page || !listField) {
        return null;
    }
    // The flow's header stays above this page, so a spinner in the page is enough while the editor fills
    if (filledPageName !== currentPageName) {
        return (
            <View style={[styles.flex1, styles.fullScreenLoading]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        );
    }
    const sensitiveAnswers = item ? getListItemSensitiveAnswers(listField, item.id, values) : {};
    const keptAnswers = isSensitiveList ? {...item, ...sensitiveAnswers} : sensitiveAnswers;
    const withInputValues = (inputValues: unknown) => ({...keptAnswers, ...toDynamicFormValues(inputValues)});
    const itemLabel = getLocalizedText(translate, listField.itemLabelKey, listField.itemLabel);
    const addTitle = itemLabel ? translate('dynamicForm.addItem', {item: itemLabel}) : translate('common.add');
    const title = item ? summarizeListItem(item, listField.itemFields, translate, getListItemFallbackTitle(listField, items.indexOf(item), translate)).title : addTitle;

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
            submitButtonText={translate('common.save')}
            validate={(inputValues) => getDynamicFieldErrors(listField.itemFields, withInputValues(inputValues), translate)}
            onSubmit={(inputValues) => onListItemSave(listField.key, item?.id, withInputValues(inputValues))}
            style={[styles.mh5, styles.flexGrow1]}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            enabledWhenOffline
        >
            {({inputValues}) => (
                <>
                    <FormHeader
                        title={title}
                        titleAriaLevel={2}
                    />
                    <DynamicFormFields
                        content={listField.itemFields}
                        values={withInputValues(inputValues)}
                        isSensitive={isSensitiveList}
                        currency={currency}
                        maxFileSize={maxFileSize}
                        onRefreshRequirements={onRefreshRequirements}
                    />
                </>
            )}
        </FormProvider>
    );
}

export default DynamicFormListItemPage;
