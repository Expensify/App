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
import getVisibleFields, {isFieldVisible} from './getVisibleFields';
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

/** The fields a link opts out of, which show only while it is off, such as the SSN and ID document behind "I don't have a social security number". Any other field, including a link with none, opts out of nothing. */
function getOptOutFields(field: DynamicFormField, allFields: DynamicFormField[]): DynamicFormField[] {
    if (field.type !== 'boolean' || field.presentation !== 'link') {
        return [];
    }
    return allFields.filter((candidate) => candidate.showWhen?.key === field.key && candidate.showWhen.equals.includes('false'));
}

/** The question an opt-out link that is on hides, such as the SSN, so the link's row can stand in for it */
function getOptedOutField(field: DynamicFormField, values: DynamicFormValues, allFields: DynamicFormField[]): DynamicFormField | undefined {
    if (values[field.key] !== true) {
        return undefined;
    }
    return getOptOutFields(field, allFields).find((candidate) => !isFieldVisible(candidate, values, allFields));
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

        // An opt-out link that is off has no row, since the fields it opts out of are shown and already carry the answer
        const fields = getVisibleFields(getContentFields(page.content).filter(isSupportedField), values, allFields).filter(
            (field) => values[field.key] === true || getOptOutFields(field, allFields).length === 0,
        );

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
                    const shownAnswer = isSensitiveField(field) ? maskSensitiveValue(answer) : answer;
                    const optedOutField = getOptedOutField(field, values, allFields);

                    return [
                        {
                            id: field.key,
                            description: optedOutField ? getFieldLabel(optedOutField, translate) : fieldLabel,
                            title: optedOutField ? fieldLabel : shownAnswer,
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
