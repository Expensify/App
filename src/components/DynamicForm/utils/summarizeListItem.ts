import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import isSensitiveField from './isSensitiveField';

const DESCRIPTION_ANSWER_LIMIT = 2;

/** Long answers, such as a full address, would crowd the row, so they are left out of its description */
const TYPES_LEFT_OUT_OF_DESCRIPTION = new Set<DynamicFormField['type']>(['date', 'address', 'country', 'file']);

/** The leading run of text answers names the row, as first and last name do. Up to two short remaining answers describe it. */
function summarizeListItem(item: DynamicFormListItem, itemFields: DynamicFormField[], translate: LocalizedTranslate): {title: string; description: string} {
    const shownFields = itemFields.filter((field) => !isSensitiveField(field) && formatDynamicFieldValue(field, item, translate) !== '');
    const firstTextIndex = shownFields.findIndex((field) => field.type === 'text');
    const titleFields: DynamicFormField[] = [];
    for (const field of shownFields.slice(Math.max(firstTextIndex, 0))) {
        if (field.type !== 'text') {
            break;
        }
        titleFields.push(field);
    }
    const firstShownField = shownFields.at(0);
    if (titleFields.length === 0 && firstShownField) {
        titleFields.push(firstShownField);
    }
    const title = titleFields.map((field) => formatDynamicFieldValue(field, item, translate)).join(' ');
    const description = shownFields
        .filter((field) => !titleFields.includes(field) && !TYPES_LEFT_OUT_OF_DESCRIPTION.has(field.type))
        .slice(0, DESCRIPTION_ANSWER_LIMIT)
        .map((field) => formatDynamicFieldValue(field, item, translate))
        .join(', ');
    return {title, description};
}

export default summarizeListItem;
