import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import {getListItems, getListItemSensitiveAnswers, parseListItemPageName} from '@components/DynamicForm/utils/listItems';
import summarizeListItem from '@components/DynamicForm/utils/summarizeListItem';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormListField} from '@src/types/onyx';

import React from 'react';

import DynamicFormFields from './DynamicFormFields';

/** The editor of one list entry, or of a new one: the entry's fields and a Save button */
function DynamicFormListItemPage({currentPageName, fields, values, currency, onListItemSave}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const page = parseListItemPageName(currentPageName);
    const listField = fields.find((field): field is DynamicFormListField => field.type === 'list' && field.key === page?.listKey);
    if (!page || !listField) {
        return null;
    }
    const item = getListItems(values[listField.key]).find((candidate) => candidate.id === page.itemID);
    const sensitiveAnswers = item ? getListItemSensitiveAnswers(listField, item.id, values) : {};
    const withInputValues = (inputValues: unknown) => ({...sensitiveAnswers, ...toDynamicFormValues(inputValues)});
    const itemLabel = getLocalizedText(translate, listField.itemLabelKey, listField.itemLabel);
    const addTitle = itemLabel ? translate('dynamicForm.addItem', {item: itemLabel}) : translate('common.add');
    const itemTitle = item ? summarizeListItem(item, listField.itemFields, translate).title : '';
    const title = itemTitle === '' ? addTitle : itemTitle;

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM}
            submitButtonText={translate('common.save')}
            validate={(inputValues) => getDynamicFieldErrors(listField.itemFields, withInputValues(inputValues), translate)}
            onSubmit={(inputValues) => onListItemSave(listField.key, item?.id, withInputValues(inputValues))}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={styles.mb0}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            enabledWhenOffline
        >
            {({inputValues}) => (
                <>
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{title}</Text>
                    <DynamicFormFields
                        fields={listField.itemFields}
                        values={withInputValues(inputValues)}
                        currency={currency}
                    />
                </>
            )}
        </FormProvider>
    );
}

export default DynamicFormListItemPage;
