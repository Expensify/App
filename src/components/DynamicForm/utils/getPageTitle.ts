import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';

import getContentFields from './getContentFields';
import getLocalizedText, {getInputLabel} from './getLocalizedText';
import {getLoneField, getVisibleContent, isFieldVisible} from './getVisibleFields';

/** The page's own title, else the schema's wording of its lone question. A label never names a page, since the label is already on the question's row. */
function getPageHeadline(page: DynamicFormPage, values: DynamicFormValues, translate: LocalizedTranslate, allFields?: DynamicFormField[]): string {
    const ownTitle = getLocalizedText(translate, page.titleKey, page.title);
    if (ownTitle) {
        return ownTitle;
    }
    const loneField = getLoneField(getContentFields(getVisibleContent(page.content, values, allFields)));
    return (loneField && getLocalizedText(translate, loneField.questionKey, loneField.question)) ?? '';
}

/** The page's section title on the confirmation page, else its headline. A page asks a question, such as "What are your account details?", while its section is a plain name, such as "Bank details". */
function getPageSectionName(page: DynamicFormPage, values: DynamicFormValues, translate: LocalizedTranslate, allFields?: DynamicFormField[]): string {
    return getLocalizedText(translate, page.sectionTitleKey, page.sectionTitle) || getPageHeadline(page, values, translate, allFields);
}

/** The page's headline, else the label of its lone question. An untitled page with several questions has no headline, since no one of them names the page. */
function getPageTitle(page: DynamicFormPage, values: DynamicFormValues, translate: LocalizedTranslate, allFields?: DynamicFormField[]): string {
    const headline = getPageHeadline(page, values, translate, allFields);
    if (headline) {
        return headline;
    }
    const loneField = getLoneField(getContentFields(getVisibleContent(page.content, values, allFields)));
    return loneField ? getInputLabel(loneField, translate) : '';
}

/** A page is shown when its own `showWhen` matches and it has a field to show. A page that is not shown is skipped, and its fields are not asked or submitted. */
function isPageShown(page: DynamicFormPage, values: DynamicFormValues, allFields: DynamicFormField[]): boolean {
    if (!isFieldVisible(page, values, allFields)) {
        return false;
    }
    return getContentFields(getVisibleContent(page.content, values, allFields)).length > 0;
}

export default getPageTitle;
export {getPageSectionName, isPageShown};
