import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryItem} from '@components/SubStepForms/ConfirmationStep';

import type {DynamicFormGroup} from './groupFieldsIntoPages';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import {getFieldLabel} from './getLocalizedText';
import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';

const VISIBLE_SENSITIVE_DIGITS = 4;

/** All but the last few characters hidden, as in •••••6789, so the user can tell which number they entered */
function maskSensitiveValue(value: string): string {
    return '•'.repeat(Math.max(value.length - VISIBLE_SENSITIVE_DIGITS, 0)) + value.slice(-VISIBLE_SENSITIVE_DIGITS);
}

/** One row per visible answer, in page order. Tapping a row opens its page to edit it; readonly rows open nothing. */
function getConfirmationItems(groups: DynamicFormGroup[], values: DynamicFormValues, translate: LocalizedTranslate, onEditGroup: (groupIndex: number) => void): SummaryItem[] {
    const allFields = groups.flatMap((group) => group.fields);
    return groups.flatMap((group, groupIndex) =>
        getVisibleFields(group.fields, values, allFields).map((field) => ({
            id: field.key,
            description: getFieldLabel(field, translate),
            title: isSensitiveField(field) ? maskSensitiveValue(formatDynamicFieldValue(field, values, translate)) : formatDynamicFieldValue(field, values, translate),
            shouldShowRightIcon: !field.readonly,
            onPress: field.readonly ? () => {} : () => onEditGroup(groupIndex),
        })),
    );
}

export default getConfirmationItems;
