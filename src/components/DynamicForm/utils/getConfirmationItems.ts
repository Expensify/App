import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryGroup, SummaryGroupRow} from '@components/SubStepForms/ConfirmationStep';

import {getLetterAvatarURLForName} from '@libs/UserAvatarUtils';

import type {DynamicFormGroup} from './groupFieldsIntoPages';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import {getFieldLabel} from './getLocalizedText';
import getVisibleFields from './getVisibleFields';
import {getGroupTitle} from './groupFieldsIntoPages';
import isSensitiveField from './isSensitiveField';
import {getListItems} from './listItems';
import summarizeListItem from './summarizeListItem';

const VISIBLE_SENSITIVE_CHARACTERS = 4;
const SSN_REGEX = /^\d{9}$/;

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered */
function maskSensitiveValue(value: string): string {
    const masked = '•'.repeat(Math.max(value.length - VISIBLE_SENSITIVE_CHARACTERS, 0)) + value.slice(-VISIBLE_SENSITIVE_CHARACTERS);
    return SSN_REGEX.test(value) ? `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}` : masked;
}

type ConfirmationActions = {
    onEditGroup: (groupIndex: number) => void;
    onEditListItem: (listKey: string, itemID: string) => void;
};

/** One section per page holding its visible answers, with each list entry as an avatar row. Tapping a row opens the page or entry to edit; readonly rows open nothing. */
function getConfirmationItems(groups: DynamicFormGroup[], values: DynamicFormValues, translate: LocalizedTranslate, {onEditGroup, onEditListItem}: ConfirmationActions): SummaryGroup[] {
    const allFields = groups.flatMap((group) => group.fields);
    return groups
        .map((group, groupIndex) => ({
            id: group.slug,
            name: getGroupTitle(group, translate),
            rows: getVisibleFields(group.fields, values, allFields).flatMap((field): SummaryGroupRow[] => {
                if (field.type === 'list') {
                    return getListItems(values[field.key]).map((item) => {
                        const {title, description} = summarizeListItem(item, field.itemFields, translate);
                        return {
                            kind: 'item',
                            id: `${field.key}-${item.id}`,
                            title,
                            description,
                            avatarSource: getLetterAvatarURLForName(title),
                            onPress: () => onEditListItem(field.key, item.id),
                        };
                    });
                }
                const answer = formatDynamicFieldValue(field, values, translate);
                return [
                    {
                        kind: 'field',
                        id: field.key,
                        description: getFieldLabel(field, translate),
                        title: isSensitiveField(field) ? maskSensitiveValue(answer) : answer,
                        shouldShowRightIcon: !field.readonly,
                        onPress: field.readonly ? () => {} : () => onEditGroup(groupIndex),
                    },
                ];
            }),
        }))
        .filter((section) => section.rows.length > 0);
}

export default getConfirmationItems;
