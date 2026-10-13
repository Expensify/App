import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormListField, DynamicFormListItem} from '@src/types/onyx';

import isSensitiveField from './isSensitiveField';

const PAGE_NAME_SEPARATOR = '~';
const NEW_ITEM_ID = 'new';

/** Route segment of a list entry's editor page, or of the page that adds one */
function getListItemPageName(listKey: string, itemID = NEW_ITEM_ID): string {
    return `${listKey}${PAGE_NAME_SEPARATOR}${itemID}`;
}

/** The list key and entry ID an editor page name points at, or undefined for any other page */
function parseListItemPageName(pageName: string | undefined): {listKey: string; itemID: string | undefined} | undefined {
    if (!pageName?.includes(PAGE_NAME_SEPARATOR)) {
        return undefined;
    }
    const [listKey = '', itemID] = pageName.split(PAGE_NAME_SEPARATOR);
    return {listKey, itemID: itemID === NEW_ITEM_ID ? undefined : itemID};
}

/** Memory key of one sensitive answer of a list entry, since sensitive answers never reach the draft */
function getListItemSensitiveKey(listKey: string, itemID: string, fieldKey: string): string {
    return [listKey, itemID, fieldKey].join(PAGE_NAME_SEPARATOR);
}

function isListItem(value: unknown): value is DynamicFormListItem {
    return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';
}

/** The entries stored under a list field's key, ignoring anything malformed */
function getListItems(value: unknown): DynamicFormListItem[] {
    if (!Array.isArray(value)) {
        return [];
    }
    const items: unknown[] = value;
    return items.filter(isListItem);
}

/** An entry's sensitive answers, keyed by field key, from the answers kept in memory */
function getListItemSensitiveAnswers(field: DynamicFormListField, itemID: string, values: DynamicFormValues): DynamicFormValues {
    return Object.fromEntries(
        field.itemFields.filter(isSensitiveField).flatMap((itemField) => {
            const answer = values[getListItemSensitiveKey(field.key, itemID, itemField.key)];
            return answer === undefined ? [] : [[itemField.key, answer]];
        }),
    );
}

/** Memory keys of sensitive answers whose entry the user has removed from the list */
function getRemovedListItemSensitiveKeys(field: DynamicFormListField, values: DynamicFormValues): string[] {
    const sensitiveFields = field.itemFields.filter(isSensitiveField);
    const keptKeys = new Set(getListItems(values[field.key]).flatMap((item) => sensitiveFields.map((itemField) => getListItemSensitiveKey(field.key, item.id, itemField.key))));
    return Object.keys(values).filter((key) => key.startsWith(`${field.key}${PAGE_NAME_SEPARATOR}`) && !keptKeys.has(key));
}

export {getListItemPageName, getListItemSensitiveAnswers, getListItemSensitiveKey, getListItems, getRemovedListItemSensitiveKeys, isListItem, parseListItemPageName};
