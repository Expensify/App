import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {SingularSearchStatus} from '@components/Search/types';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

function getExpenseStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
        {text: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translate('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translate('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    ];
}

function getExpenseReportedStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translate('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translate('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    ];
}

function getInvoiceStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.INVOICE.PAID},
    ];
}

function getTripStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('search.filters.current'), value: CONST.SEARCH.STATUS.TRIP.CURRENT},
        {text: translate('search.filters.past'), value: CONST.SEARCH.STATUS.TRIP.PAST},
    ];
}

function getTaskStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.TASK.OUTSTANDING},
        {text: translate('search.filters.completed'), value: CONST.SEARCH.STATUS.TASK.COMPLETED},
    ];
}

function getStatusOptions(translate: LocalizedTranslate, type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return getInvoiceStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return getTripStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.TASK:
            return getTaskStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return getExpenseReportedStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return getExpenseStatusOptions(translate);
    }
}

function getHasOptions(translate: LocalizedTranslate, type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return [
                {text: translate('common.receipt'), value: CONST.SEARCH.HAS_VALUES.RECEIPT},
                {text: translate('common.attachment'), value: CONST.SEARCH.HAS_VALUES.ATTACHMENT},
                {text: translate('common.tag'), value: CONST.SEARCH.HAS_VALUES.TAG},
                {text: translate('common.category'), value: CONST.SEARCH.HAS_VALUES.CATEGORY},
            ];
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return [
                {text: translate('common.link'), value: CONST.SEARCH.HAS_VALUES.LINK},
                {text: translate('common.attachment'), value: CONST.SEARCH.HAS_VALUES.ATTACHMENT},
            ];
        default:
            return [];
    }
}

function getAllStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    const optionsByValue = new Map<string, MultiSelectItem<SingularSearchStatus>>();
    for (const type of Object.values(CONST.SEARCH.DATA_TYPES)) {
        for (const option of getStatusOptions(translate, type as SearchDataTypes)) {
            if (!optionsByValue.has(option.value)) {
                optionsByValue.set(option.value, option);
            }
        }
    }
    return [...optionsByValue.values()];
}

/**
 * Formats translated text for use in search queries.
 * Converts to lowercase and replaces regular spaces with thin spaces (U+2009)
 * so the parser treats multi-word translations as single tokens.
 */
function formatTranslatedValue(text: string): string {
    return text.toLowerCase().replaceAll(' ', '\u2009');
}

/**
 * Returns a Set of all translated status values across all search data types.
 * Values are lowercased for case-insensitive matching.
 */
function getAllTranslatedStatusValues(translate: LocalizedTranslate): Set<string> {
    const translatedValues = Object.values(CONST.SEARCH.DATA_TYPES)
        .map((type) => getStatusOptions(translate, type as SearchDataTypes))
        .flat()
        .map((option) => option.text.toLowerCase());

    const internalValues = Object.values(CONST.SEARCH.STATUS)
        .map((statusGroup) => Object.values(statusGroup))
        .flat()
        .filter((value): value is string => !!value)
        .map((value) => value.toLowerCase());

    return new Set([...translatedValues, ...internalValues]);
}

export {
    getStatusOptions,
    getHasOptions,
    getAllStatusOptions,
    getExpenseStatusOptions,
    getExpenseReportedStatusOptions,
    getInvoiceStatusOptions,
    getTripStatusOptions,
    getTaskStatusOptions,
    formatTranslatedValue,
    getAllTranslatedStatusValues,
};
