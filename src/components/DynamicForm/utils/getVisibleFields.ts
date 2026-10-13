import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormContentItem, DynamicFormField, DynamicFormHeading} from '@src/types/onyx';

import getContentFields from './getContentFields';
import isHeading from './isHeading';
import isSupportedField from './isSupportedField';
import logSchemaProblem from './logSchemaProblem';

type DynamicFormVisibleItem = DynamicFormHeading | DynamicFormField;

function isFieldVisibleWithin(item: DynamicFormVisibleItem, values: DynamicFormValues, allFields: DynamicFormField[], checkedKeys: Set<string>): boolean {
    if (!item.showWhen) {
        return true;
    }
    const {key, equals} = item.showWhen;
    const controller = allFields.find((candidate) => candidate.key === key);
    // A heading can share its key with a field, and it is never a controller, so only field keys mark the chain
    const chainKeys = isHeading(item) ? checkedKeys : new Set([...checkedKeys, item.key]);
    if (controller && !checkedKeys.has(controller.key) && !isFieldVisibleWithin(controller, values, allFields, chainKeys)) {
        return false;
    }
    const controllingValue = values[key];
    if (Array.isArray(controllingValue)) {
        const chosenValues: unknown[] = controllingValue;
        return chosenValues.some((chosenValue) => typeof chosenValue === 'string' && equals.includes(chosenValue));
    }
    if (typeof controllingValue !== 'string' && typeof controllingValue !== 'boolean') {
        return false;
    }
    return equals.includes(String(controllingValue));
}

/** A field or heading stays hidden while its controlling field is hidden, so an answer left on a hidden field cannot reveal its dependents */
function isFieldVisible(item: DynamicFormVisibleItem, values: DynamicFormValues, allFields: DynamicFormField[]): boolean {
    return isFieldVisibleWithin(item, values, allFields, new Set());
}

/** The fields the user sees right now, which are also the only ones validated. `allFields` is the whole form when `fields` is one page of it, since a controlling field can sit on another page. */
function getVisibleFields(fields: DynamicFormField[], values: DynamicFormValues, allFields = fields): DynamicFormField[] {
    return fields.filter((field) => isFieldVisible(field, values, allFields));
}

/** Fields of a type this App version does not know and headings with no text are left out, so they neither render nor block submission */
function isSupportedItem(item: DynamicFormContentItem): item is DynamicFormVisibleItem {
    if (!isHeading(item)) {
        return isSupportedField(item);
    }
    if ([item.title, item.titleKey, item.description, item.descriptionKey].some((text) => !!text)) {
        return true;
    }
    logSchemaProblem('Heading without text', {key: item.key});
    return false;
}

/**
 * The headings and fields the user sees right now. A heading with no visible field before the next shown heading is left out, so a hidden or unknown field never leaves an orphan title.
 * `allFields` is the whole form when `content` is one page of it, since a controlling field can sit on another page.
 */
function getVisibleContent(content: DynamicFormContentItem[], values: DynamicFormValues, allFields?: DynamicFormField[]): DynamicFormVisibleItem[] {
    const supportedContent = content.filter(isSupportedItem);
    const controllers = allFields ?? getContentFields(supportedContent);
    const visibleContent: DynamicFormVisibleItem[] = [];
    let pendingHeading: DynamicFormHeading | undefined;
    for (const item of supportedContent) {
        if (!isFieldVisible(item, values, controllers)) {
            continue;
        }
        if (isHeading(item)) {
            pendingHeading = item;
            continue;
        }
        if (pendingHeading) {
            visibleContent.push(pendingHeading);
            pendingHeading = undefined;
        }
        visibleContent.push(item);
    }
    return visibleContent;
}

/** The page's only question, if it has one. Fields it reveals, such as an "Other" description, do not count, so the layout stays put when they appear. */
function getLoneField(visibleFields: DynamicFormField[]): DynamicFormField | undefined {
    const visibleKeys = new Set(visibleFields.map((field) => field.key));
    const questions = visibleFields.filter((field) => !field.showWhen || !visibleKeys.has(field.showWhen.key));
    return questions.length === 1 ? questions.at(0) : undefined;
}

export default getVisibleFields;
export {getLoneField, getVisibleContent, isFieldVisible};
