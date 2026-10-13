import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryGroup} from '@components/SubStepForms/ConfirmationStep';

import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getContentFields from './getContentFields';
import {getFieldLabel} from './getLocalizedText';
import getPageTitle, {isPageShown} from './getPageTitle';
import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';
import isSupportedField from './isSupportedField';
import maskSensitiveValue from './maskSensitiveValue';

/** One section per shown page holding its visible answers. Tapping a row opens the page to edit; readonly rows open nothing. */
function getConfirmationItems(
    pages: DynamicFormPage[],
    allFields: DynamicFormField[],
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditPage: (pageIndex: number) => void,
): SummaryGroup[] {
    return pages
        .map((page, pageIndex) => ({page, pageIndex}))
        .filter(({page}) => isPageShown(page, values, allFields))
        .map(({page, pageIndex}) => ({
            id: page.key,
            name: getPageTitle(page, values, translate, allFields),
            rows: getVisibleFields(getContentFields(page.content).filter(isSupportedField), values, allFields).map((field) => {
                const answer = formatDynamicFieldValue(field, values, translate);
                return {
                    id: field.key,
                    description: getFieldLabel(field, translate),
                    title: isSensitiveField(field) ? maskSensitiveValue(answer) : answer,
                    shouldShowRightIcon: !field.readonly,
                    onPress: field.readonly ? () => {} : () => onEditPage(pageIndex),
                    interactive: !field.readonly,
                };
            }),
        }))
        .filter((section) => section.rows.length > 0);
}

export default getConfirmationItems;
