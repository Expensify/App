import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryGroup} from '@components/SubStepForms/ConfirmationStep';

import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';

import noop from 'lodash/noop';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getContentFields from './getContentFields';
import {getFieldLabel} from './getLocalizedText';
import getPageTitle, {isPageShown} from './getPageTitle';
import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';
import isSupportedField from './isSupportedField';
import maskSensitiveValue from './maskSensitiveValue';

/** One section per shown page holding its visible answers. Tapping a row opens the page to edit. Readonly rows open nothing. */
function getConfirmationItems(
    pages: DynamicFormPage[],
    allFields: DynamicFormField[],
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditPage: (pageIndex: number) => void,
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
                rows: fields.map((field) => {
                    const answer = formatDynamicFieldValue(field, values, translate);
                    const isEditable = !field.readonly;

                    return {
                        id: field.key,
                        description: getFieldLabel(field, translate),
                        title: isSensitiveField(field) ? maskSensitiveValue(answer) : answer,
                        shouldShowRightIcon: isEditable,
                        onPress: isEditable ? handleEdit : noop,
                        interactive: isEditable,
                    };
                }),
            },
        ];
    });
}

export default getConfirmationItems;
