import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryItem} from '@components/SubStepForms/ConfirmationStep';

import type {DynamicFormGroup} from './groupFieldsIntoPages';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import {getFieldLabel} from './getLocalizedText';
import getVisibleFields from './getVisibleFields';

/** One row per visible answer, in page order. Tapping a row opens its page to edit it; readonly rows open nothing. */
function getConfirmationItems(groups: DynamicFormGroup[], values: DynamicFormValues, translate: LocalizedTranslate, onEditGroup: (groupIndex: number) => void): SummaryItem[] {
    return groups.flatMap((group, groupIndex) =>
        getVisibleFields(group.fields, values).map((field) => ({
            id: field.key,
            description: getFieldLabel(field, translate),
            title: formatDynamicFieldValue(field, values, translate),
            shouldShowRightIcon: !field.readonly,
            onPress: field.readonly ? () => {} : () => onEditGroup(groupIndex),
        })),
    );
}

export default getConfirmationItems;
