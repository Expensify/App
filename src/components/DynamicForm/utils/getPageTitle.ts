import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';

import getContentFields from './getContentFields';
import getLocalizedText, {getFieldLabel} from './getLocalizedText';
import {getLoneField, getVisibleContent, isFieldVisible} from './getVisibleFields';

/** The page's own title, else the label of its lone question, else the label of its first visible field, so no step is ever blank */
function getPageTitle(page: DynamicFormPage, values: DynamicFormValues, translate: LocalizedTranslate, allFields?: DynamicFormField[]): string {
    const ownTitle = getLocalizedText(translate, page.titleKey, page.title);
    if (ownTitle) {
        return ownTitle;
    }
    const visibleFields = getContentFields(getVisibleContent(page.content, values, allFields));
    const field = getLoneField(visibleFields) ?? visibleFields.at(0);
    return field ? getFieldLabel(field, translate) : '';
}

/** A page is shown when its own `showWhen` matches and it has a field to show. A page that is not shown is skipped, and its fields are not asked or submitted. */
function isPageShown(page: DynamicFormPage, values: DynamicFormValues, allFields: DynamicFormField[]): boolean {
    if (!isFieldVisible(page, values, allFields)) {
        return false;
    }
    return getContentFields(getVisibleContent(page.content, values, allFields)).length > 0;
}

export default getPageTitle;
export {isPageShown};
