import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryGroup, SummaryGroupRow} from '@components/SubStepForms/ConfirmationStep';

import {getLetterAvatarURLForName} from '@libs/UserAvatarUtils';

import type {DynamicFormField, DynamicFormListField, DynamicFormPage} from '@src/types/onyx';

import noop from 'lodash/noop';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getContentFields from './getContentFields';
import {getFieldLabel} from './getLocalizedText';
import getPageTitle, {isPageShown} from './getPageTitle';
import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';
import isSupportedField from './isSupportedField';
import {getListItems} from './listItems';
import maskSensitiveValue from './maskSensitiveValue';
import summarizeListItem from './summarizeListItem';

/** One avatar row per list entry, which opens the entry. A readonly list gets plain rows that open nothing. */
function getListItemRows(
    field: DynamicFormListField,
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditListItem: (listKey: string, itemID: string) => void,
): SummaryGroupRow[] {
    return getListItems(values[field.key]).map((item): SummaryGroupRow => {
        const {title, description} = summarizeListItem(item, field.itemFields, translate);
        if (field.readonly) {
            return {id: `${field.key}-${item.id}`, title, description, shouldShowRightIcon: false, onPress: noop, interactive: false};
        }
        return {
            kind: 'avatar',
            id: `${field.key}-${item.id}`,
            title,
            description,
            avatarSource: getLetterAvatarURLForName(title),
            onPress: () => onEditListItem(field.key, item.id),
        };
    });
}

/** One section per shown page holding its visible answers, with each list entry as an avatar row and an empty list as a plain row. Tapping a row opens the page or entry to edit; readonly rows open nothing. */
function getConfirmationItems(
    pages: DynamicFormPage[],
    allFields: DynamicFormField[],
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditPage: (pageIndex: number) => void,
    onEditListItem: (listKey: string, itemID: string) => void,
): SummaryGroup[] {
    return pages.flatMap((page, pageIndex): SummaryGroup[] => {
        if (!isPageShown(page, values, allFields)) {
            return [];
        }

        const fields = getVisibleFields(getContentFields(page.content).filter(isSupportedField), values, allFields);

        if (fields.length === 0) {
            return [];
        }

        const handleEdit = () => onEditPage(pageIndex);

        return [
            {
                id: page.key,
                name: getPageTitle(page, values, translate, allFields),
                rows: fields.flatMap((field): SummaryGroupRow[] => {
                    const listItemRows = field.type === 'list' ? getListItemRows(field, values, translate, onEditListItem) : [];
                    if (listItemRows.length > 0) {
                        return listItemRows;
                    }

                    const answer = formatDynamicFieldValue(field, values, translate);
                    const isEditable = !field.readonly;

                    return [
                        {
                            id: field.key,
                            description: getFieldLabel(field, translate),
                            title: isSensitiveField(field) ? maskSensitiveValue(answer) : answer,
                            shouldShowRightIcon: isEditable,
                            onPress: isEditable ? handleEdit : noop,
                            interactive: isEditable,
                        },
                    ];
                }),
            },
        ];
    });
}

export default getConfirmationItems;
