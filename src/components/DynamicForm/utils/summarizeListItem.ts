import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField, DynamicFormListField, DynamicFormListItem} from '@src/types/onyx';

import {Str} from 'expensify-common';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getLocalizedText, {getFieldLabel} from './getLocalizedText';
import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';

const DESCRIPTION_ANSWER_LIMIT = 2;

/** Long answers, such as a full address, would crowd the row, so they are left out of its description */
const TYPES_LEFT_OUT_OF_DESCRIPTION = new Set<DynamicFormField['type']>(['date', 'address', 'country', 'file']);

/** Names an entry whose answers give it no name by its place in the list, as in "Owner 2", so two such entries don't sound the same */
function getNumberedItemTitle(noun: string, index: number, translate: LocalizedTranslate): string {
    return translate('dynamicForm.numberedItem', {item: Str.UCFirst(noun), number: index + 1});
}

/** The numbered noun for one entry of the list, or the list's label when the list names no noun */
function getListItemFallbackTitle(field: DynamicFormListField, index: number, translate: LocalizedTranslate): string {
    return getNumberedItemTitle(getLocalizedText(translate, field.itemLabelKey, field.itemLabel) ?? getFieldLabel(field, translate), index, translate);
}

/** The leading run of text answers names the row, as first and last name do. Up to two short remaining answers describe it. Hidden answers are left out, and an entry with no shown answer is named by `fallbackTitle`. */
function summarizeListItem(item: DynamicFormListItem, itemFields: DynamicFormField[], translate: LocalizedTranslate, fallbackTitle: string): {title: string; description: string} {
    const shownFields = getVisibleFields(itemFields, item).filter((field) => !isSensitiveField(field) && formatDynamicFieldValue(field, item, translate) !== '');
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
    const title = titleFields.map((field) => formatDynamicFieldValue(field, item, translate)).join(' ') || fallbackTitle;
    const description = shownFields
        .filter((field) => !titleFields.includes(field) && !TYPES_LEFT_OUT_OF_DESCRIPTION.has(field.type))
        .slice(0, DESCRIPTION_ANSWER_LIMIT)
        .map((field) => formatDynamicFieldValue(field, item, translate))
        .join(', ');
    return {title, description};
}

export default summarizeListItem;
export {getListItemFallbackTitle, getNumberedItemTitle};
