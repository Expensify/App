import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryGroup, SummaryGroupRow} from '@components/SubStepForms/ConfirmationStep';

import {getLetterAvatarURLForName} from '@libs/UserAvatarUtils';

import type {DynamicFormField, DynamicFormListField, DynamicFormPage} from '@src/types/onyx';

import noop from 'lodash/noop';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getContentFields from './getContentFields';
import {getFieldLabel} from './getLocalizedText';
import {getPageSectionName, isPageShown} from './getPageTitle';
import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';
import isSupportedField from './isSupportedField';
import {getListItems} from './listItems';
import maskSensitiveValue, {getVisibleEnding} from './maskSensitiveValue';
import summarizeListItem, {getListItemFallbackTitle} from './summarizeListItem';

/** One avatar row per list entry, which opens the entry. A readonly list gets plain rows that open nothing. */
function getListItemRows(
    field: DynamicFormListField,
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditListItem: (listKey: string, itemID: string) => void,
): SummaryGroupRow[] {
    return getListItems(values[field.key]).map((item, index): SummaryGroupRow => {
        const {title, description} = summarizeListItem(item, field.itemFields, translate, getListItemFallbackTitle(field, index, translate));
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

/** A link the user never tapped, such as "I don't have a social security number" for an admin who has one, is not an answer worth a row */
function isUntappedLink(field: DynamicFormField, values: DynamicFormValues): boolean {
    return field.type === 'boolean' && field.presentation === 'link' && values[field.key] !== true;
}

/** One section per shown page holding its visible answers, with each list entry as an avatar row and an empty list as a plain row. Tapping a row opens the page or entry to edit. Readonly rows open nothing. */
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

        const fields = getVisibleFields(getContentFields(page.content).filter(isSupportedField), values, allFields).filter((field) => !isUntappedLink(field, values));

        if (fields.length === 0) {
            return [];
        }

        const handleEdit = () => onEditPage(pageIndex);
        const sectionName = getPageSectionName(page, values, translate, allFields);

        return [
            {
                id: page.key,
                name: sectionName,
                rows: fields.flatMap((field): SummaryGroupRow[] => {
                    const listItemRows = field.type === 'list' ? getListItemRows(field, values, translate, onEditListItem) : [];
                    if (listItemRows.length > 0) {
                        // The section heading names a list that is alone in it, so the list's own label is shown only when nothing else names the entries or other answers sit beside them
                        const shouldNameList = !sectionName || fields.length > 1;
                        return shouldNameList ? [{kind: 'label', id: `${field.key}-label`, title: getFieldLabel(field, translate)}, ...listItemRows] : listItemRows;
                    }

                    const answer = formatDynamicFieldValue(field, values, translate);
                    const isEditable = !field.readonly;
                    const fieldLabel = getFieldLabel(field, translate);
                    const isMasked = isSensitiveField(field) && !!getVisibleEnding(answer);

                    return [
                        {
                            id: field.key,
                            description: fieldLabel,
                            title: isSensitiveField(field) ? maskSensitiveValue(answer) : answer,
                            // Screen readers would read out each bullet of the mask
                            accessibilityLabel: isMasked ? translate('dynamicForm.maskedValueLabel', {label: fieldLabel, ending: getVisibleEnding(answer)}) : undefined,
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
