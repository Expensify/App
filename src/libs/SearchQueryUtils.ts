import cloneDeep from 'lodash/cloneDeep';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {
    ASTNode,
    QueryFilter,
    QueryFilters,
    SearchAmountFilterKeys,
    SearchDateFilterKeys,
    SearchDatePreset,
    SearchFilterKey,
    SearchQueryJSON,
    SearchQueryString,
    SearchQueryToken,
    SearchStatus,
    SearchWithdrawalType,
    UserFriendlyKey,
    UserFriendlyValue,
} from '@components/Search/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS, {ALLOWED_TYPE_FILTERS, AMOUNT_FILTER_KEYS, DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import SafeString from '@src/utils/SafeString';
import {getCardFeedsForDisplay} from './CardFeedUtils';
import {getCardDescription} from './CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsInteger} from './CurrencyUtils';
import Log from './Log';
import {validateAmount} from './MoneyRequestUtils';
import {getPreservedNavigatorState} from './Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import navigationRef from './Navigation/navigationRef';
import type {SearchFullscreenNavigatorParamList} from './Navigation/types';
import {getPersonalDetailByEmail} from './PersonalDetailsUtils';
import {getCleanedTagName, getTagNamesFromTagsLists} from './PolicyUtils';
import {getReportName} from './ReportUtils';
import {parse as parseSearchQuery} from './SearchParser';
import {hashText} from './UserUtils';
import {isValidDate} from './ValidationUtils';

type FilterKeys = keyof typeof CONST.SEARCH.SYNTAX_FILTER_KEYS;

// This map contains chars that match each operator
const operatorToCharMap = {
    [CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO]: ':' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN]: '<' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO]: '<=' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN]: '>' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO]: '>=' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.AND]: ',' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.OR]: ' ' as const,
};

const PRIMARY_ROOT_KEYS = new Set<string>([
    CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE,
    CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY,
    CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER,
    CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS,
    CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
]);

// Create reverse lookup maps for O(1) performance
const createKeyToUserFriendlyMap = () => {
    const map = new Map<string, string>();

    // Map SYNTAX_FILTER_KEYS values to their user-friendly names
    Object.entries(CONST.SEARCH.SYNTAX_FILTER_KEYS).forEach(([keyName, keyValue]) => {
        if (!(keyName in CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS)) {
            return;
        }
        map.set(keyValue, CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS[keyName as keyof typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS]);
    });

    // Map SYNTAX_ROOT_KEYS values to their user-friendly names
    Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS).forEach(([keyName, keyValue]) => {
        if (!(keyName in CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS)) {
            return;
        }
        map.set(keyValue, CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS[keyName as keyof typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS]);
    });

    return map;
};

// Create the maps once at module initialization for performance
const keyToUserFriendlyMap = createKeyToUserFriendlyMap();

/**
 * Lookup a key in the keyToUserFriendlyMap and return the user-friendly key.
 *
 * @example
 * getUserFriendlyKey("taxRate") // returns "tax-rate"
 */
function getUserFriendlyKey(keyName: SearchFilterKey | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER): UserFriendlyKey {
    return (keyToUserFriendlyMap.get(keyName) ?? keyName) as UserFriendlyKey;
}

/**
 * Converts a filter value from backend value to user friendly display text.
 *
 * @example
 * getUserFriendlyValues("perDiem") // returns "per-diem"
 */
function getUserFriendlyValue(value: string | undefined): UserFriendlyValue {
    return CONST.SEARCH.SEARCH_USER_FRIENDLY_VALUES_MAP[value as keyof typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_VALUES_MAP] ?? value;
}

/**
 * @private
 * Returns string value wrapped in quotes "", if the value contains space or &nbsp; (no-breaking space).
 */
function sanitizeSearchValue(str: string) {
    if (str.includes(' ') || str.includes(`\xA0`)) {
        return `"${str}"`;
    }
    return str;
}

/**
 * @private
 * Returns date filter value for QueryString.
 */
function buildDateFilterQuery(filterValues: Partial<SearchAdvancedFiltersForm>, filterKey: SearchDateFilterKeys) {
    const negatedDate = filterValues[`${filterKey}${CONST.SEARCH.NOT_MODIFIER}`];
    const dateOn = filterValues[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`];
    const dateAfter = filterValues[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`];
    const dateBefore = filterValues[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`];

    const dateFilters = [];

    if (dateOn) {
        dateFilters.push(`${filterKey}:${dateOn}`);
    }
    if (dateAfter) {
        dateFilters.push(`${filterKey}>${dateAfter}`);
    }
    if (dateBefore) {
        dateFilters.push(`${filterKey}<${dateBefore}`);
    }
    if (negatedDate) {
        dateFilters.push(`-${filterKey}:${negatedDate}`);
    }

    return dateFilters.join(' ');
}

/**
 * @private
 * Returns amount filter value for QueryString.
 */
function buildAmountFilterQuery(filterKey: SearchAmountFilterKeys, filterValues: Partial<SearchAdvancedFiltersForm>) {
    const negatedAmount = filterValues[`${filterKey}${CONST.SEARCH.NOT_MODIFIER}`];
    const equalTo = filterValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`];
    const lessThan = filterValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`];
    const greaterThan = filterValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`];

    const amountStrings = [];

    if (equalTo) {
        amountStrings.push(`${filterKey}:${equalTo}`);
    }

    if (greaterThan) {
        amountStrings.push(`${filterKey}>${greaterThan}`);
    }

    if (lessThan) {
        amountStrings.push(`${filterKey}<${lessThan}`);
    }

    if (negatedAmount) {
        amountStrings.push(`-${filterKey}:${negatedAmount}`);
    }

    return amountStrings.join(' ');
}

/**
 * @private
 * Returns string of correctly formatted filter values from QueryFilters object.
 */
function buildFilterValuesString(filterName: string, queryFilters: QueryFilter[]) {
    const delimiter = filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ? ' ' : ',';
    const allowedOps: string[] = [CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO];

    let filterValueString = '';
    queryFilters.forEach((queryFilter, index) => {
        const previousValueHasSameOp = allowedOps.includes(queryFilter.operator) && queryFilters?.at(index - 1)?.operator === queryFilter.operator;
        const nextValueHasSameOp = allowedOps.includes(queryFilter.operator) && queryFilters?.at(index + 1)?.operator === queryFilter.operator;

        // If the previous queryFilter has the same operator (this rule applies only to eq and neq operators) then append the current value
        if (index !== 0 && (previousValueHasSameOp || nextValueHasSameOp)) {
            filterValueString += `${delimiter}${sanitizeSearchValue(queryFilter.value.toString())}`;
        } else if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filterValueString += `${delimiter}${sanitizeSearchValue(queryFilter.value.toString())}`;
        } else if (queryFilter.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO) {
            filterValueString += ` -${filterName}:${sanitizeSearchValue(queryFilter.value.toString())}`;
        } else {
            filterValueString += ` ${filterName}${operatorToCharMap[queryFilter.operator]}${sanitizeSearchValue(queryFilter.value.toString())}`;
        }
    });

    return filterValueString;
}

/**
 * @private
 * Traverses the AST and returns filters as a QueryFilters object.
 */
function getFilters(queryJSON: SearchQueryJSON) {
    const filters = [] as QueryFilters;
    const filterKeys = Object.values(CONST.SEARCH.SYNTAX_FILTER_KEYS);

    function traverse(node: ASTNode) {
        if (!node.operator) {
            return;
        }

        if (typeof node.left === 'object' && node.left) {
            traverse(node.left);
        }

        if (typeof node.right === 'object' && node.right && !Array.isArray(node.right)) {
            traverse(node.right);
        }

        const nodeKey = node.left as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>;
        if (!filterKeys.includes(nodeKey)) {
            return;
        }

        const filterArray = [];
        if (!Array.isArray(node.right)) {
            filterArray.push({
                operator: node.operator,
                value: node.right as string | number,
            });
        } else {
            node.right.forEach((element) => {
                filterArray.push({
                    operator: node.operator,
                    value: element,
                });
            });
        }
        filters.push({key: nodeKey, filters: filterArray});
    }

    if (queryJSON.filters) {
        traverse(queryJSON.filters);
    }

    return filters;
}

/**
 * @private
 * Returns an updated filter value for some query filters.
 * - for `AMOUNT` it formats value to "backend" amount
 * - for personal filters it tries to substitute any user emails with accountIDs
 */
function getUpdatedFilterValue(filterName: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>, filterValue: string | string[]) {
    if (AMOUNT_FILTER_KEYS.includes(filterName as SearchAmountFilterKeys)) {
        if (typeof filterValue === 'string') {
            const backendAmount = convertToBackendAmount(Number(filterValue));
            return Number.isNaN(backendAmount) ? filterValue : backendAmount.toString();
        }
        return filterValue.map((amount) => {
            const backendAmount = convertToBackendAmount(Number(amount));
            return Number.isNaN(backendAmount) ? amount : backendAmount.toString();
        });
    }

    if (
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE
    ) {
        if (typeof filterValue === 'string') {
            return getPersonalDetailByEmail(filterValue)?.accountID.toString() ?? filterValue;
        }

        return filterValue.map((email) => getPersonalDetailByEmail(email)?.accountID.toString() ?? email);
    }

    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID) {
        const cleanIDs = (value: string) =>
            value
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0)
                .join(',');

        if (typeof filterValue === 'string') {
            return cleanIDs(filterValue);
        }
        return filterValue.map(cleanIDs);
    }

    return filterValue;
}

/**
 * @private
 * This is a custom collator only for getQueryHashes function.
 * The reason for this is that the computation of hashes should not depend on the locale.
 * This is used to ensure that hashes stay consistent.
 */
const customCollator = new Intl.Collator('en', {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'});

/**
 * @private
 * Computes and returns a numerical hash for a given queryJSON.
 * Sorts the query keys and values to ensure that hashes stay consistent.
 */
function getQueryHashes(query: SearchQueryJSON): {primaryHash: number; recentSearchHash: number; similarSearchHash: number} {
    let orderedQuery = '';
    orderedQuery += `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${query.type}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${Array.isArray(query.status) ? query.status.join(',') : query.status}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY}:${query.groupBy}`;

    const filterSet = new Set<string>(orderedQuery);

    // Certain filters shouldn't affect whether two searchers are similar or not, since they dont
    // actually filter out results
    const similarSearchIgnoredFilters = new Set<SearchFilterKey>([CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY]);

    // Certain filters' values are significant in deciding which search we are on, so we want to include
    // their value when computing the similarSearchHash
    const similarSearchValueBasedFilters = new Set<SearchFilterKey>([CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION]);

    query.flatFilters
        .map((filter) => {
            const filterKey = filter.key;
            const filters = cloneDeep(filter.filters);
            filters.sort((a, b) => customCollator.compare(a.value.toString(), b.value.toString()));
            return {filterString: buildFilterValuesString(filterKey, filters), filterKey};
        })
        .sort((a, b) => customCollator.compare(a.filterString, b.filterString))
        .forEach(({filterString, filterKey}) => {
            if (!similarSearchIgnoredFilters.has(filterKey)) {
                filterSet.add(filterKey);
            }

            if (similarSearchValueBasedFilters.has(filterKey)) {
                filterSet.add(filterString.trim());
            }

            orderedQuery += ` ${filterString}`;
        });

    const similarSearchHash = hashText(Array.from(filterSet).join(''), 2 ** 32);
    const recentSearchHash = hashText(orderedQuery, 2 ** 32);

    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${query.sortBy}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${query.sortOrder}`;
    if (query.policyID) {
        orderedQuery += ` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${Array.isArray(query.policyID) ? query.policyID.join(',') : query.policyID} `;
    }
    const primaryHash = hashText(orderedQuery, 2 ** 32);

    return {primaryHash, recentSearchHash, similarSearchHash};
}

function toStringArray(value: unknown): string[] {
    if (value == null) return [];

    const convert = (v: unknown): string => SafeString(v, true);
    return Array.isArray(value) ? value.map(convert) : [convert(value)];
}

function syncTokensWithQuery(queryJSON: SearchQueryJSON) {
    if (!queryJSON.tokens || queryJSON.tokens.length === 0) {
        return;
    }

    const filterQueues = createFilterQueues(queryJSON);
    const toCanonicalRootKey = (rawKey: string) => (rawKey === 'group-by' ? CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY : rawKey);

    const updatedTokens: SearchQueryToken[] = [];

    queryJSON.tokens.forEach((token) => {
        const rawKey = token.key as string;
        const canonicalKey = toCanonicalRootKey(rawKey);

        if (PRIMARY_ROOT_KEYS.has(canonicalKey)) {
            const values = toStringArray(queryJSON[canonicalKey as keyof SearchQueryJSON]).filter((value) => value !== '');
            if (values.length === 0) {
                return;
            }

            let newValue: string | string[] = values;
            if (values.length === 1) {
                [newValue] = values;
            }

            updatedTokens.push({
                ...token,
                value: newValue,
            });
            return;
        }

        if (rawKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            const keywordFilters = filterQueues.get(rawKey);
            if (!keywordFilters || keywordFilters.length === 0) {
                return;
            }
            updatedTokens.push(token);
            return;
        }

        const queueKey = filterQueues.has(rawKey) ? rawKey : canonicalKey;
        const queue = queueKey ? filterQueues.get(queueKey) : undefined;
        if (!queue || queue.length === 0) {
            return;
        }

        queue.shift();
        filterQueues.set(queueKey, queue);
        updatedTokens.push(token);
    });

    queryJSON.tokens = updatedTokens;
}

function tokensMatchQuery(tokens: SearchQueryToken[] | undefined, queryJSON?: SearchQueryJSON): boolean {
    return !!(tokens && tokens.length > 0 && queryJSON);
}

function createFilterQueues(queryJSON: SearchQueryJSON) {
    const queues = new Map<string, QueryFilter[]>();
    queryJSON.flatFilters.forEach(({key, filters}) => {
        const existing = queues.get(key) ?? [];
        const newFilters = filters.map((filter) => ({
            operator: filter.operator,
            value: filter.value,
        }));
        queues.set(key, existing.concat(newFilters));
    });
    return queues;
}

function consumeFilterFromQueue(filterQueues: Map<string, QueryFilter[]>, rawKey: string, canonicalKey: string, token: SearchQueryToken, fallback: string) {
    const queueKey = filterQueues.has(rawKey) ? rawKey : canonicalKey;
    const queue = queueKey ? (filterQueues.get(queueKey) ?? []) : [];

    if (queue.length === 0) {
        return fallback;
    }

    let valuesToConsume = Array.isArray(token.value) ? token.value.length : 1;
    if (valuesToConsume <= 0 || valuesToConsume > queue.length) {
        valuesToConsume = queue.length;
    }

    const filtersToUse: QueryFilter[] = [];
    for (let i = 0; i < valuesToConsume; i += 1) {
        const filter = queue.shift();
        if (!filter) {
            break;
        }
        filtersToUse.push(filter);
    }

    filterQueues.set(queueKey, queue);

    const filterString = buildFilterValuesString(queueKey ?? rawKey, filtersToUse).trim();
    return filterString.length > 0 ? filterString : fallback;
}

function appendRemainingFilters(filterQueues: Map<string, QueryFilter[]>, orderedParts: string[]) {
    filterQueues.forEach((queue, key) => {
        if (!queue || queue.length === 0) {
            return;
        }
        const leftoverString = buildFilterValuesString(key, queue).trim();
        if (leftoverString.length > 0) {
            orderedParts.push(leftoverString);
        }
    });
}

function appendMissingPrimaryRoots(
    canonicalRootOrder: string[],
    orderedParts: string[],
    emittedRootKeys: Set<string>,
    rootKeyToIndex: Map<string, number>,
    emitRoot: (rootKey: string, tokenValue?: string | string[], fallbackRaw?: string, outputKey?: string) => string,
) {
    const insertAtIndex = (index: number, value: string) => {
        if (index < 0 || index > orderedParts.length) {
            orderedParts.push(value);
            return orderedParts.length - 1;
        }
        orderedParts.splice(index, 0, value);
        rootKeyToIndex.forEach((originalIndex, key) => {
            if (originalIndex >= index) {
                rootKeyToIndex.set(key, originalIndex + 1);
            }
        });
        return index;
    };

    const findInsertIndexForRoot = (rootKey: string) => {
        const rootIndex = canonicalRootOrder.indexOf(rootKey);
        let insertIndex: number | undefined;

        for (let i = rootIndex - 1; i >= 0; i -= 1) {
            const prevKey = canonicalRootOrder[i];
            const prevIndex = rootKeyToIndex.get(prevKey);
            if (prevIndex !== undefined) {
                insertIndex = prevIndex + 1;
                break;
            }
        }

        if (insertIndex === undefined) {
            for (let i = rootIndex + 1; i < canonicalRootOrder.length; i += 1) {
                const nextKey = canonicalRootOrder[i];
                const nextIndex = rootKeyToIndex.get(nextKey);
                if (nextIndex !== undefined) {
                    insertIndex = nextIndex;
                    break;
                }
            }
        }

        return insertIndex ?? 0;
    };

    canonicalRootOrder.forEach((rootKey) => {
        if (emittedRootKeys.has(rootKey)) {
            return;
        }
        const formatted = emitRoot(rootKey);
        if (formatted.length > 0) {
            const targetIndex = findInsertIndexForRoot(rootKey);
            const insertedIndex = insertAtIndex(targetIndex, formatted);
            rootKeyToIndex.set(rootKey, insertedIndex);
            emittedRootKeys.add(rootKey);
        }
    });
}

function appendMissingGroupBy(
    orderedParts: string[],
    emittedRootKeys: Set<string>,
    rootKeyToIndex: Map<string, number>,
    emitRoot: (rootKey: string, tokenValue?: string | string[], fallbackRaw?: string, outputKey?: string) => string,
) {
    const groupByKey = CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY;
    if (emittedRootKeys.has(groupByKey)) {
        return;
    }

    const formattedGroupBy = emitRoot(groupByKey);
    if (formattedGroupBy.length === 0) {
        return;
    }

    const index = orderedParts.push(formattedGroupBy) - 1;
    rootKeyToIndex.set(groupByKey, index);
    emittedRootKeys.add(groupByKey);
}

function appendPolicyIfMissing(orderedParts: string[], tokens: SearchQueryToken[], queryJSON: SearchQueryJSON) {
    const hasPolicyToken = tokens.some((token) => token.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID);
    if (hasPolicyToken || !queryJSON.policyID || queryJSON.policyID.length === 0) {
        return;
    }

    const policyValues = queryJSON.policyID.map((value) => sanitizeSearchValue(value)).join(',');
    if (policyValues.length > 0) {
        orderedParts.push(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${policyValues}`);
    }
}

function removeRootPart(orderedParts: string[], rootKeyToIndex: Map<string, number>, rootKey: string) {
    const existingIndex = rootKeyToIndex.get(rootKey);
    if (existingIndex === undefined) {
        return;
    }

    orderedParts.splice(existingIndex, 1);
    rootKeyToIndex.delete(rootKey);
    rootKeyToIndex.forEach((index, key) => {
        if (index > existingIndex) {
            rootKeyToIndex.set(key, index - 1);
        }
    });
}

function buildQueryStringFromTokens(queryJSON: SearchQueryJSON, tokens: SearchQueryToken[], defaultQueryJSON?: SearchQueryJSON): string {
    const filterQueues = createFilterQueues(queryJSON);

    const toCanonicalRootKey = (rawKey: string) => (rawKey === 'group-by' ? CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY : rawKey);

    const emitRoot = (rootKey: string, _tokenValue?: string | string[], _fallbackRaw?: string, outputKey?: string) => {
        let values = toStringArray(queryJSON[rootKey as keyof SearchQueryJSON]).filter((value) => value !== '');

        if (values.length === 0 && defaultQueryJSON) {
            values = toStringArray(defaultQueryJSON[rootKey as keyof SearchQueryJSON]).filter((value) => value !== '');
        }

        if (values.length === 0) {
            return '';
        }

        if (values.length === 1) {
            (queryJSON as Record<string, unknown>)[rootKey] = values[0];
        }

        const sanitised = values.map((value) => sanitizeSearchValue(value)).join(',');
        const keyForOutput = outputKey ?? rootKey;
        return `${keyForOutput}:${sanitised}`;
    };

    const orderedParts: string[] = [];
    const emittedRootKeys = new Set<string>();
    const rootKeyToIndex = new Map<string, number>();

    tokens.forEach((token) => {
        const rawKey = token.key as string;

        if (rawKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            const keywordValue = token.raw.trim();
            if (keywordValue.length > 0) {
                orderedParts.push(keywordValue);
            }
            filterQueues.set(CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD, []);
            return;
        }

        const canonicalKey = toCanonicalRootKey(rawKey);
        const trimmedRaw = token.raw.trim();
        const outputKey = trimmedRaw.includes(':') ? trimmedRaw.split(':')[0] : rawKey;

        if (PRIMARY_ROOT_KEYS.has(canonicalKey)) {
            const formatted = emitRoot(canonicalKey, token.value, trimmedRaw, outputKey);
            if (formatted.length > 0) {
                removeRootPart(orderedParts, rootKeyToIndex, canonicalKey);
                const index = orderedParts.push(formatted) - 1;
                rootKeyToIndex.set(canonicalKey, index);
                emittedRootKeys.add(canonicalKey);
            }
            return;
        }

        const fallback = trimmedRaw.length > 0 ? trimmedRaw : '';
        const filterString = consumeFilterFromQueue(filterQueues, rawKey, canonicalKey, token, fallback);
        if (filterString.length > 0) {
            orderedParts.push(filterString);
        }
    });

    appendRemainingFilters(filterQueues, orderedParts);

    const canonicalRootOrder = [CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY, CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER, CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS];

    appendMissingPrimaryRoots(canonicalRootOrder, orderedParts, emittedRootKeys, rootKeyToIndex, emitRoot);
    appendMissingGroupBy(orderedParts, emittedRootKeys, rootKeyToIndex, emitRoot);
    appendPolicyIfMissing(orderedParts, tokens, queryJSON);

    return orderedParts.join(' ').trim();
}

/**
 * Returns whether a given string is a date preset (e.g. Last month)
 */
function isSearchDatePreset(date: string | undefined): date is SearchDatePreset {
    return Object.values(CONST.SEARCH.DATE_PRESETS).some((datePreset) => datePreset === date);
}

/**
 * Returns whether a given search filter is supported in a given search data type
 */
function isFilterSupported(filter: SearchAdvancedFiltersKey, type: SearchDataTypes) {
    return ALLOWED_TYPE_FILTERS[type].some((supportedFilter) => supportedFilter === filter);
}

/**
 * Normalizes the value into a single string.
 * - If it's an array, returns the first element.
 * - Otherwise, returns the value as is.

 * @param value - The raw field value from SearchQueryJSON
 * @returns The normalized field value
 */
function normalizeValue<T>(value: T | T[]): T {
    if (Array.isArray(value)) {
        return value.at(0) as T;
    }

    return value;
}

/**
 * Parses a given search query string into a structured `SearchQueryJSON` format.
 * This format of query is most commonly shared between components and also sent to backend to retrieve search results.
 *
 * In a way this is the reverse of buildSearchQueryString()
 */
function buildSearchQueryJSON(query: SearchQueryString) {
    try {
        const result = parseSearchQuery(query) as SearchQueryJSON;
        const flatFilters = getFilters(result);

        // Add the full input and hash to the results
        result.inputQuery = query;
        result.flatFilters = flatFilters;
        syncTokensWithQuery(result);
        const {primaryHash, recentSearchHash, similarSearchHash} = getQueryHashes(result);
        result.hash = primaryHash;
        result.recentSearchHash = recentSearchHash;
        result.similarSearchHash = similarSearchHash;

        if (result.policyID && typeof result.policyID === 'string') {
            // Ensure policyID is always an array for consistency
            result.policyID = [result.policyID];
        }

        if (result.groupBy) {
            result.groupBy = normalizeValue(result.groupBy);
        }

        if (result.type) {
            result.type = normalizeValue(result.type);
        }

        return result;
    } catch (e) {
        console.error(`Error when parsing SearchQuery: "${query}"`, e);
    }
}

/**
 * Formats a given `SearchQueryJSON` object into the string version of query.
 * This format of query is the most basic string format and is used as the query param `q` in search URLs.
 *
 * In a way this is the reverse of buildSearchQueryJSON()
 */
function buildSearchQueryString(queryJSON?: SearchQueryJSON) {
    const defaultQueryJSON = buildSearchQueryJSON('');

    if (queryJSON?.tokens && queryJSON.tokens.length > 0) {
        syncTokensWithQuery(queryJSON);
    }

    if (queryJSON?.tokens && tokensMatchQuery(queryJSON.tokens, queryJSON)) {
        const orderedQuery = buildQueryStringFromTokens(queryJSON, queryJSON.tokens, defaultQueryJSON);
        if (orderedQuery.length > 0) {
            return orderedQuery;
        }
    }

    const queryParts: string[] = [];
    const baseQueryJSON = queryJSON ?? defaultQueryJSON;

    for (const [, key] of Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS)) {
        const existingFieldValue = baseQueryJSON?.[key as keyof SearchQueryJSON];
        const queryFieldValue = existingFieldValue ?? defaultQueryJSON?.[key as keyof SearchQueryJSON];

        if (queryFieldValue) {
            if (Array.isArray(queryFieldValue)) {
                queryParts.push(`${key}:${queryFieldValue.join(',')}`);
            } else {
                queryParts.push(`${key}:${queryFieldValue}`);
            }
        }
    }

    const policyValues = toStringArray(baseQueryJSON?.policyID ?? defaultQueryJSON?.policyID).filter((value) => value.length > 0);
    if (policyValues.length > 0) {
        queryParts.push(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${policyValues.join(',')}`);
    }

    if (!queryJSON) {
        return queryParts.join(' ');
    }

    const filters = queryJSON.flatFilters;

    for (const filter of filters) {
        const filterValueString = buildFilterValuesString(filter.key, filter.filters);
        queryParts.push(filterValueString.trim());
    }

    return queryParts.join(' ');
}

/**
 * Formats a given object with search filter values into the string version of the query.
 * Main usage is to consume data format that comes from AdvancedFilters Onyx Form Data, and generate query string.
 *
 * Reverse operation of buildFilterFormValuesFromQuery()
 */
function buildQueryStringFromFilterFormValues(filterValues: Partial<SearchAdvancedFiltersForm>) {
    const supportedFilterValues = {...filterValues};

    // When switching types/setting the type, ensure we aren't polluting our query with filters that are
    // only available for the previous type. Remove all filters that are not allowed for the new type
    const providedFilterKeys = Object.keys(supportedFilterValues) as SearchAdvancedFiltersKey[];
    providedFilterKeys.forEach((filter) => {
        if (isFilterSupported(filter, supportedFilterValues.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE)) {
            return;
        }

        supportedFilterValues[filter] = undefined;
    });

    // We separate type and status filters from other filters to maintain hashes consistency for saved searches
    const {type, status, groupBy, ...otherFilters} = supportedFilterValues;
    const filtersString: string[] = [];

    filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${CONST.SEARCH.TABLE_COLUMNS.DATE}`);
    filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${CONST.SEARCH.SORT_ORDER.DESC}`);

    if (type) {
        const sanitizedType = sanitizeSearchValue(type);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${sanitizedType}`);
    }

    if (groupBy) {
        const sanitizedGroupBy = sanitizeSearchValue(groupBy);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY}:${sanitizedGroupBy}`);
    }

    if (status && typeof status === 'string') {
        const sanitizedStatus = sanitizeSearchValue(status);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${sanitizedStatus}`);
    }

    if (status && Array.isArray(status)) {
        const filterValueArray = [...new Set<string>(status)];
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${filterValueArray.map(sanitizeSearchValue).join(',')}`);
    }

    const mappedFilters = Object.entries(otherFilters)
        .map(([filterKey, filterValue]) => {
            const isNegated = filterKey.endsWith(CONST.SEARCH.NOT_MODIFIER);

            if (isNegated) {
                // eslint-disable-next-line no-param-reassign
                filterKey = filterKey.replace(CONST.SEARCH.NOT_MODIFIER, '');
            }

            const prefix = isNegated ? '-' : '';

            if (
                (filterKey === FILTER_KEYS.MERCHANT ||
                    filterKey === FILTER_KEYS.DESCRIPTION ||
                    filterKey === FILTER_KEYS.REIMBURSABLE ||
                    filterKey === FILTER_KEYS.BILLABLE ||
                    filterKey === FILTER_KEYS.TITLE ||
                    filterKey === FILTER_KEYS.PAYER ||
                    filterKey === FILTER_KEYS.GROUP_CURRENCY ||
                    filterKey === FILTER_KEYS.WITHDRAWAL_TYPE ||
                    filterKey === FILTER_KEYS.ACTION) &&
                filterValue
            ) {
                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
                if (keyInCorrectForm) {
                    return `${prefix}${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${sanitizeSearchValue(filterValue as string)}`;
                }
            }
            if ((filterKey === FILTER_KEYS.REPORT_ID || filterKey === FILTER_KEYS.WITHDRAWAL_ID) && filterValue) {
                const reportIDs = (filterValue as string)
                    .split(',')
                    .map((id) => sanitizeSearchValue(id.trim()))
                    .filter((id) => id.length > 0);

                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
                if (keyInCorrectForm && reportIDs.length > 0) {
                    return `${prefix}${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${reportIDs.join(',')}`;
                }
            }

            if (filterKey === FILTER_KEYS.KEYWORD && filterValue) {
                const value = (filterValue as string).split(' ').map(sanitizeSearchValue).join(' ');
                return `${value}`;
            }

            if (
                (filterKey === FILTER_KEYS.CATEGORY ||
                    filterKey === FILTER_KEYS.CARD_ID ||
                    filterKey === FILTER_KEYS.TAX_RATE ||
                    filterKey === FILTER_KEYS.EXPENSE_TYPE ||
                    filterKey === FILTER_KEYS.TAG ||
                    filterKey === FILTER_KEYS.CURRENCY ||
                    filterKey === FILTER_KEYS.PURCHASE_CURRENCY ||
                    filterKey === FILTER_KEYS.FROM ||
                    filterKey === FILTER_KEYS.TO ||
                    filterKey === FILTER_KEYS.FEED ||
                    filterKey === FILTER_KEYS.IN ||
                    filterKey === FILTER_KEYS.ASSIGNEE ||
                    filterKey === FILTER_KEYS.POLICY_ID ||
                    filterKey === FILTER_KEYS.HAS ||
                    filterKey === FILTER_KEYS.IS ||
                    filterKey === FILTER_KEYS.EXPORTER ||
                    filterKey === FILTER_KEYS.ATTENDEE) &&
                Array.isArray(filterValue) &&
                filterValue.length > 0
            ) {
                const filterValueArray = [...new Set<string>(filterValue)];
                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);

                if (keyInCorrectForm) {
                    return `${prefix}${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${filterValueArray.map(sanitizeSearchValue).join(',')}`;
                }
            }

            return undefined;
        })
        .filter((filter): filter is string => !!filter);

    filtersString.push(...mappedFilters);

    DATE_FILTER_KEYS.forEach((dateKey) => {
        const dateFilter = buildDateFilterQuery(supportedFilterValues, dateKey);
        filtersString.push(dateFilter);
    });

    AMOUNT_FILTER_KEYS.forEach((filterKey) => {
        const amountFilter = buildAmountFilterQuery(filterKey, supportedFilterValues);
        filtersString.push(amountFilter);
    });

    return filtersString.filter(Boolean).join(' ').trim();
}

function getAllPolicyValues<T extends OnyxCollectionKey>(
    policyID: string[] | undefined,
    key: T,
    policyData: OnyxCollection<OnyxCollectionValuesMapping[T]>,
): Array<OnyxCollectionValuesMapping[T]> {
    if (!policyData || !policyID) {
        return [];
    }

    return policyID.map((id) => policyData?.[`${key}${id}`]).filter((data) => !!data) as Array<OnyxCollectionValuesMapping[T]>;
}

/**
 * Generates object with search filter values, in a format that can be consumed by SearchAdvancedFiltersForm.
 * Main usage of this is to generate the initial values for AdvancedFilters from existing query.
 *
 * Reverse operation of buildQueryStringFromFilterFormValues()
 */
function buildFilterFormValuesFromQuery(
    queryJSON: SearchQueryJSON,
    policyCategories: OnyxCollection<OnyxTypes.PolicyCategories>,
    policyTags: OnyxCollection<OnyxTypes.PolicyTagLists>,
    currencyList: OnyxTypes.CurrencyList,
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    cardList: OnyxTypes.CardList,
    reports: OnyxCollection<OnyxTypes.Report>,
    taxRates: Record<string, string[]>,
) {
    const filters = queryJSON.flatFilters;
    const filtersForm = {} as Partial<SearchAdvancedFiltersForm>;
    const policyID = queryJSON.policyID;

    for (const queryFilter of filters) {
        const filterList = queryFilter.filters;
        const filterKey = queryFilter.key as SearchAdvancedFiltersKey;
        const filterValues = filterList.map((item) => item.value.toString());

        const isNegated = filterList.some((item) => item.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO);
        const key = isNegated ? (`${filterKey}${CONST.SEARCH.NOT_MODIFIER}` as const) : filterKey;

        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID) {
            filtersForm[key as typeof filterKey] = filterValues.join(',');
        }
        if (
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION
        ) {
            filtersForm[key as typeof filterKey] = filterValues.at(0);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
            const validExpenseTypes = new Set(Object.values(CONST.SEARCH.TRANSACTION_TYPE));
            filtersForm[key as typeof filterKey] = filterValues.filter((expenseType) => validExpenseTypes.has(expenseType as ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS) {
            const validHasTypes = new Set(Object.values(CONST.SEARCH.HAS_VALUES));
            filtersForm[key as typeof filterKey] = filterValues.filter((hasType) => validHasTypes.has(hasType as ValueOf<typeof CONST.SEARCH.HAS_VALUES>));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.IS) {
            const validIsTypes = new Set(Object.values(CONST.SEARCH.IS_VALUES));
            filtersForm[key as typeof filterKey] = filterValues.filter((isType) => validIsTypes.has(isType as ValueOf<typeof CONST.SEARCH.IS_VALUES>));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE) {
            const validWithdrawalTypes = new Set(Object.values(CONST.SEARCH.WITHDRAWAL_TYPE));
            filtersForm[key as typeof filterKey] = filterValues
                .filter((withdrawalType): withdrawalType is SearchWithdrawalType => validWithdrawalTypes.has(withdrawalType as ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>))
                .at(0);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            filtersForm[key as typeof filterKey] = filterValues.filter((card) => cardList[card]);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED) {
            filtersForm[key as typeof filterKey] = filterValues.filter((feed) => feed);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const allTaxRates = new Set(Object.values(taxRates).flat());
            filtersForm[key as typeof filterKey] = filterValues.filter((tax) => allTaxRates.has(tax));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
            filtersForm[key as typeof filterKey] = filterValues.filter((id) => reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`]?.reportID);
        }
        if (
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE
        ) {
            filtersForm[key as typeof filterKey] = filterValues.filter((id) => personalDetails?.[id]);
        }

        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER) {
            filtersForm[key as typeof filterKey] = filterValues.find((id) => personalDetails?.[id]);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY) {
            const validCurrency = new Set(Object.keys(currencyList));
            filtersForm[key as typeof filterKey] = filterValues.filter((currency) => validCurrency.has(currency));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY) {
            const validCurrency = new Set(Object.keys(currencyList));
            filtersForm[filterKey] = filterValues.filter((currency) => validCurrency.has(currency)).at(0);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) {
            const tags = policyID
                ? getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_TAGS, policyTags)
                      .map((tagList) => getTagNamesFromTagsLists(tagList ?? {}))
                      .flat()
                : Object.values(policyTags ?? {})
                      .filter((item) => !!item)
                      .map((tagList) => getTagNamesFromTagsLists(tagList ?? {}))
                      .flat();
            const uniqueTags = new Set(tags);
            uniqueTags.add(CONST.SEARCH.TAG_EMPTY_VALUE);
            filtersForm[key as typeof filterKey] = filterValues.filter((name) => uniqueTags.has(name));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) {
            const categories = policyID
                ? getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_CATEGORIES, policyCategories)
                      .map((item) => Object.values(item ?? {}).map((category) => category.name))
                      .flat()
                : Object.values(policyCategories ?? {})
                      .map((item) => Object.values(item ?? {}).map((category) => category.name))
                      .flat();
            const uniqueCategories = new Set(categories);
            const emptyCategories = CONST.SEARCH.CATEGORY_EMPTY_VALUE.split(',');
            const hasEmptyCategoriesInFilter = emptyCategories.every((category) => filterValues.includes(category));
            // We split CATEGORY_EMPTY_VALUE into individual values to detect both are present in filterValues.
            // If empty categories are found, append the CATEGORY_EMPTY_VALUE to filtersForm.
            filtersForm[key as typeof filterKey] = filterValues.filter((name) => uniqueCategories.has(name)).concat(hasEmptyCategoriesInFilter ? [CONST.SEARCH.CATEGORY_EMPTY_VALUE] : []);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filtersForm[key as typeof filterKey] = filterValues
                ?.map((filter) => {
                    if (filter.includes(' ')) {
                        return `"${filter}"`;
                    }
                    return filter;
                })
                .join(' ');
        }

        if (DATE_FILTER_KEYS.includes(filterKey as SearchDateFilterKeys)) {
            const negatedKey = `${filterKey}${CONST.SEARCH.NOT_MODIFIER}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.NOT_MODIFIER}`;
            const beforeKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.BEFORE}`;
            const afterKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.AFTER}`;
            const onKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.ON}`;

            const beforeFilter = filterList.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN && isValidDate(filter.value.toString()));
            const afterFilter = filterList.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN && isValidDate(filter.value.toString()));

            // The `On` and `Not on` filter could be either a date or a date preset (e.g. Last month)
            const negatedFilter = filterList.find((filter) => {
                return filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO && (isValidDate(filter.value.toString()) || isSearchDatePreset(filter.value.toString()));
            });
            const onFilter = filterList.find((filter) => {
                return filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO && (isValidDate(filter.value.toString()) || isSearchDatePreset(filter.value.toString()));
            });

            filtersForm[beforeKey] = beforeFilter?.value.toString() ?? filtersForm[beforeKey];
            filtersForm[afterKey] = afterFilter?.value.toString() ?? filtersForm[afterKey];
            filtersForm[onKey] = onFilter?.value.toString() ?? filtersForm[onKey];
            filtersForm[negatedKey] = negatedFilter?.value.toString() ?? filtersForm[negatedKey];
        }

        if (AMOUNT_FILTER_KEYS.includes(filterKey as SearchAmountFilterKeys)) {
            const negatedKey = `${filterKey}${CONST.SEARCH.NOT_MODIFIER}` as `${SearchAmountFilterKeys}${typeof CONST.SEARCH.NOT_MODIFIER}`;
            const equalToKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}` as `${SearchAmountFilterKeys}${typeof CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`;
            const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}` as `${SearchAmountFilterKeys}${typeof CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`;
            const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}` as `${SearchAmountFilterKeys}${typeof CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`;

            // backend amount is an integer and is 2 digits longer than frontend amount
            filtersForm[equalToKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2))
                    ?.value.toString() ?? filtersForm[equalToKey];
            filtersForm[lessThanKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2))
                    ?.value.toString() ?? filtersForm[lessThanKey];
            filtersForm[greaterThanKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2))
                    ?.value.toString() ?? filtersForm[greaterThanKey];
            filtersForm[negatedKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2))
                    ?.value.toString() ?? filtersForm[negatedKey];
        }

        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE) {
            const validBooleanTypes = Object.values(CONST.SEARCH.BOOLEAN);
            filtersForm[key as typeof filterKey] = validBooleanTypes.find((value) => filterValues.at(0) === value);
        }
    }

    const [typeKey, typeValue] = Object.entries(CONST.SEARCH.DATA_TYPES).find(([, value]) => value === queryJSON.type) ?? [];
    filtersForm[FILTER_KEYS.TYPE] = typeValue ? queryJSON.type : CONST.SEARCH.DATA_TYPES.EXPENSE;

    if (typeKey) {
        if (Array.isArray(queryJSON.status)) {
            const validStatuses = queryJSON.status.filter((status) => Object.values(CONST.SEARCH.STATUS[typeKey as keyof typeof CONST.SEARCH.DATA_TYPES]).includes(status));

            if (validStatuses.length) {
                filtersForm[FILTER_KEYS.STATUS] = queryJSON.status.join(',');
            } else {
                filtersForm[FILTER_KEYS.STATUS] = CONST.SEARCH.STATUS.EXPENSE.ALL;
            }
        } else {
            filtersForm[FILTER_KEYS.STATUS] = queryJSON.status;
        }
    }

    if (queryJSON.policyID) {
        filtersForm[FILTER_KEYS.POLICY_ID] = queryJSON.policyID;
    }

    if (queryJSON.groupBy) {
        filtersForm[FILTER_KEYS.GROUP_BY] = queryJSON.groupBy;
    }

    return filtersForm;
}

/**
 * Returns the human-readable "pretty" string for a specified filter value.
 */
function getFilterDisplayValue(
    filterName: string,
    filterValue: string,
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    reports: OnyxCollection<OnyxTypes.Report>,
    cardList: OnyxTypes.CardList,
    cardFeeds: OnyxCollection<OnyxTypes.CardFeeds>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    currentUserAccountID: number,
) {
    if (
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER ||
        filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE
    ) {
        // login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return filterValue === currentUserAccountID.toString() ? CONST.SEARCH.ME : personalDetails?.[filterValue]?.displayName || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        const cardID = parseInt(filterValue, 10);
        if (Number.isNaN(cardID)) {
            return filterValue;
        }
        return getCardDescription(cardList?.[cardID]) || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
        return getReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${filterValue}`]) || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT) {
        const frontendAmount = convertToFrontendAmountAsInteger(Number(filterValue));
        return Number.isNaN(frontendAmount) ? filterValue : frontendAmount.toString();
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) {
        return getCleanedTagName(filterValue);
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED) {
        const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeeds, cardList);
        return cardFeedsForDisplay[filterValue]?.name ?? filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) {
        return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${filterValue}`]?.name ?? filterValue;
    }
    return filterValue;
}

function getDisplayQueryFiltersForKey(
    filterObject: QueryFilters[number],
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    reports: OnyxCollection<OnyxTypes.Report>,
    taxRates: Record<string, string[]>,
    cardList: OnyxTypes.CardList,
    cardFeeds: OnyxCollection<OnyxTypes.CardFeeds>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    currentUserAccountID: number,
): QueryFilter[] {
    const key = filterObject.key as SearchFilterKey;
    const queryFilter = filterObject.filters;

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
        const taxRateIDs = queryFilter.map((filter) => filter.value.toString());
        const taxRateNames = taxRateIDs.flatMap((id) => {
            const taxRate = Object.entries(taxRates)
                .filter(([, IDs]) => IDs.includes(id))
                .map(([name]) => name);
            return taxRate.length > 0 ? taxRate : id;
        });

        const uniqueTaxRateNames = [...new Set(taxRateNames)];

        return uniqueTaxRateNames.map<QueryFilter>((taxRate) => ({
            operator: queryFilter.at(0)?.operator ?? CONST.SEARCH.SYNTAX_OPERATORS.AND,
            value: taxRate,
        }));
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        return queryFilter.reduce<QueryFilter[]>((acc, filter) => {
            const cardValue = filter.value.toString();
            const cardID = Number(cardValue);
            if (Number.isNaN(cardID)) {
                acc.push({operator: filter.operator, value: cardValue});
            } else {
                acc.push({operator: filter.operator, value: getCardDescription(cardList?.[cardID]) || cardID.toString()});
            }

            return acc;
        }, []);
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE) {
        return queryFilter.reduce<QueryFilter[]>((acc, filter) => {
            const attendee = filter.value.toString();
            if (Number.isNaN(Number(attendee))) {
                acc.push({operator: filter.operator, value: getUserFriendlyValue(attendee)});
            } else {
                const attendeePersonalDetails = personalDetails?.[attendee];
                if (attendeePersonalDetails) {
                    acc.push({operator: filter.operator, value: attendeePersonalDetails.displayName ?? attendee});
                } else {
                    acc.push({operator: filter.operator, value: attendee});
                }
            }
            return acc;
        }, [] as QueryFilter[]);
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IS) {
        return queryFilter.map((filter) => ({
            operator: filter.operator,
            value: getUserFriendlyValue(filter.value.toString()),
        }));
    }

    return queryFilter.map((filter) => ({
        operator: filter.operator,
        value: getFilterDisplayValue(key, filter.value.toString(), personalDetails, reports, cardList, cardFeeds, policies, currentUserAccountID),
    }));
}

function buildFilterDisplayString(
    filterObject: QueryFilters[number],
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    reports: OnyxCollection<OnyxTypes.Report>,
    taxRates: Record<string, string[]>,
    cardList: OnyxTypes.CardList,
    cardFeeds: OnyxCollection<OnyxTypes.CardFeeds>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    currentUserAccountID: number,
): string {
    const key = filterObject.key as SearchFilterKey;
    const displayQueryFilters = getDisplayQueryFiltersForKey(filterObject, personalDetails, reports, taxRates, cardList, cardFeeds, policies, currentUserAccountID);

    if (!displayQueryFilters || displayQueryFilters.length === 0) {
        return '';
    }

    return buildFilterValuesString(getUserFriendlyKey(key), displayQueryFilters).trim();
}

/**
 * Formats a given `SearchQueryJSON` object into the human-readable string version of query.
 * This format of query is the one which we want to display to users.
 * We try to replace every numeric id value with a display version of this value,
 * So: user IDs get turned into emails, report ids into report names etc.
 */
function buildUserReadableQueryString(
    queryJSON: SearchQueryJSON,
    PersonalDetails: OnyxTypes.PersonalDetailsList | undefined,
    reports: OnyxCollection<OnyxTypes.Report>,
    taxRates: Record<string, string[]>,
    cardList: OnyxTypes.CardList,
    cardFeeds: OnyxCollection<OnyxTypes.CardFeeds>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    currentUserAccountID: number,
) {
    const {type, status, groupBy, policyID, tokens} = queryJSON;
    const filters = queryJSON.flatFilters;

    const filterDisplayEntries = filters
        .map((filterObject) => {
            const displayString = buildFilterDisplayString(filterObject, PersonalDetails, reports, taxRates, cardList, cardFeeds, policies, currentUserAccountID);
            return {key: filterObject.key as string, value: displayString};
        })
        .filter((entry) => entry.value.length > 0);

    const filterQueues = new Map<string, string[]>();
    filterDisplayEntries.forEach(({key, value}) => {
        const queue = filterQueues.get(key) ?? [];
        queue.push(value);
        filterQueues.set(key, queue);
    });

    const getWorkspaceValues = () =>
        toStringArray(policyID)
            .map((id) => sanitizeSearchValue(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]?.name ?? id))
            .filter((value) => value.length > 0);

    const tokensList = tokens ?? [];

    if (tokensList.length === 0) {
        let title =
            status && (!Array.isArray(status) || status.length > 0)
                ? `type:${getUserFriendlyValue(type)} status:${Array.isArray(status) ? status.map(getUserFriendlyValue).join(',') : getUserFriendlyValue(status)}`
                : `type:${getUserFriendlyValue(type)}`;

        if (groupBy) {
            title += ` group-by:${getUserFriendlyValue(groupBy)}`;
        }

        const workspaceValues = getWorkspaceValues();
        if (workspaceValues.length > 0) {
            title += ` ${getUserFriendlyKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID)}:${workspaceValues.join(',')}`;
        }

        filterDisplayEntries.forEach(({value}) => {
            title += ` ${value}`;
        });

        return title.trim();
    }

    const rootDisplayKeyMap: Record<string, string> = {
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE]: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE,
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS]: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS,
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY]: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY,
    };

    const toCanonicalRootKey = (rawKey: string) => (rawKey === 'group-by' ? CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY : rawKey);

    const buildRootPart = (rootKey: string, fallbackValues?: string | string[]) => {
        let values = toStringArray(queryJSON[rootKey as keyof SearchQueryJSON]).filter((value) => value !== '');
        if (values.length === 0 && fallbackValues) {
            values = toStringArray(fallbackValues).filter((value) => value !== '');
        }
        if (values.length === 0) {
            return '';
        }

        const friendlyValues = values.map((value) => sanitizeSearchValue(getUserFriendlyValue(value)));
        if (friendlyValues.length === 0) {
            return '';
        }

        const displayKey = rootDisplayKeyMap[rootKey] ?? rootKey;
        return `${displayKey}:${friendlyValues.join(',')}`;
    };

    let policyTokenConsumed = false;
    const parts: string[] = [];

    tokensList.forEach((token) => {
        const rawKey = token.key as string;
        const canonicalKey = toCanonicalRootKey(rawKey);

        if (canonicalKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY || canonicalKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER) {
            return;
        }

        if (rawKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            const keywordPart = token.raw.trim();
            if (keywordPart.length > 0) {
                parts.push(keywordPart);
            }
            filterQueues.set(rawKey, []);
            return;
        }

        if (canonicalKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE || canonicalKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS || canonicalKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY) {
            const rootPart = buildRootPart(canonicalKey, token.value);
            if (rootPart.length > 0) {
                parts.push(rootPart);
            }
            return;
        }

        if (rawKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) {
            const workspaceValues = getWorkspaceValues();
            if (workspaceValues.length > 0) {
                parts.push(`${getUserFriendlyKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID)}:${workspaceValues.join(',')}`);
                policyTokenConsumed = true;
                return;
            }
        }

        const queueKey = filterQueues.has(rawKey) ? rawKey : canonicalKey;
        const queue = queueKey ? filterQueues.get(queueKey) : undefined;
        if (queue && queue.length > 0) {
            const part = queue.shift();
            if (part && part.length > 0) {
                parts.push(part.trim());
            }
            filterQueues.set(queueKey, queue);
            return;
        }

        const fallback = token.raw.trim();
        if (fallback.length > 0) {
            parts.push(fallback);
        }
    });

    queryJSON.flatFilters.forEach((filterObject) => {
        const key = filterObject.key as string;
        const queue = filterQueues.get(key);
        if (!queue) {
            return;
        }
        while (queue.length > 0) {
            const part = queue.shift();
            if (part && part.length > 0) {
                parts.push(part.trim());
            }
        }
        filterQueues.set(key, queue);
    });

    if (!policyTokenConsumed) {
        const workspaceValues = getWorkspaceValues();
        if (workspaceValues.length > 0) {
            parts.push(`${getUserFriendlyKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID)}:${workspaceValues.join(',')}`);
        }
    }

    return parts.join(' ').trim();
}

/**
 * Returns properly built QueryString for a canned query, with the optional policyID.
 */
function buildCannedSearchQuery({
    type = CONST.SEARCH.DATA_TYPES.EXPENSE,
    status,
    policyID,
    cardID,
    groupBy,
}: {
    type?: SearchDataTypes;
    status?: SearchStatus;
    policyID?: string;
    cardID?: string;
    groupBy?: string;
} = {}): SearchQueryString {
    let queryString = status ? `type:${type} status:${Array.isArray(status) ? status.join(',') : status}` : `type:${type}`;

    if (groupBy) {
        queryString += ` group-by:${groupBy}`;
    }

    if (policyID) {
        queryString += ` policyID:${policyID}`;
    }

    if (cardID) {
        queryString += ` expense-type:card card:${cardID}`;
    }

    // Parse the query to fill all default query fields with values
    const normalizedQueryJSON = buildSearchQueryJSON(queryString);
    return buildSearchQueryString(normalizedQueryJSON);
}

/**
 * Returns whether a given search query is a Canned query.
 *
 * Canned queries are simple predefined queries, that are defined only using type and status and no additional filters.
 * In addition, they can contain an optional policyID.
 * For example: "type:trip" is a canned query.
 */
function isCannedSearchQuery(queryJSON: SearchQueryJSON) {
    return !queryJSON.filters && !queryJSON.policyID && !queryJSON.status;
}

function isDefaultExpensesQuery(queryJSON: SearchQueryJSON) {
    return queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE && !queryJSON.status && !queryJSON.filters && !queryJSON.groupBy && !queryJSON.policyID;
}

/**
 * Always show `No category` and `No tag` as the first option
 */
const sortOptionsWithEmptyValue = (a: string, b: string, localeCompare: LocaleContextProps['localeCompare']) => {
    if (a === CONST.SEARCH.CATEGORY_EMPTY_VALUE || a === CONST.SEARCH.TAG_EMPTY_VALUE) {
        return -1;
    }
    if (b === CONST.SEARCH.CATEGORY_EMPTY_VALUE || b === CONST.SEARCH.TAG_EMPTY_VALUE) {
        return 1;
    }
    return localeCompare(a, b);
};

/**
 *  Given a search query, this function will standardize the query by replacing display values with their corresponding IDs.
 */
function traverseAndUpdatedQuery(queryJSON: SearchQueryJSON, computeNodeValue: (left: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>, right: string | string[]) => string | string[]) {
    const standardQuery = cloneDeep(queryJSON);
    const filters = standardQuery.filters;
    const traverse = (node: ASTNode) => {
        if (!node.operator) {
            return;
        }
        if (typeof node.left === 'object') {
            traverse(node.left);
        }
        if (typeof node.right === 'object' && !Array.isArray(node.right)) {
            traverse(node.right);
        }

        if (typeof node.left !== 'object' && (Array.isArray(node.right) || typeof node.right === 'string')) {
            // eslint-disable-next-line no-param-reassign
            node.right = computeNodeValue(node.left, node.right);
        }
    };

    if (filters) {
        traverse(filters);
    }

    standardQuery.flatFilters = getFilters(standardQuery);
    syncTokensWithQuery(standardQuery);
    return standardQuery;
}

/**
 * Returns new string query, after parsing it and traversing to update some filter values.
 * If there are any personal emails, it will try to substitute them with accountIDs
 */
function getQueryWithUpdatedValues(query: string) {
    const queryJSON = buildSearchQueryJSON(query);

    if (!queryJSON) {
        Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} user query failed to parse`, {}, false);
        return;
    }

    const standardizedQuery = traverseAndUpdatedQuery(queryJSON, getUpdatedFilterValue);
    return buildSearchQueryString(standardizedQuery);
}

function getCurrentSearchQueryJSON() {
    const rootState = navigationRef.getRootState();
    const lastSearchNavigator = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

    let lastSearchNavigatorState = lastSearchNavigator?.state;
    if (!lastSearchNavigatorState) {
        lastSearchNavigatorState = lastSearchNavigator && lastSearchNavigator.key ? getPreservedNavigatorState(lastSearchNavigator?.key) : undefined;
    }
    if (!lastSearchNavigatorState) {
        return;
    }

    const lastSearchRoute = lastSearchNavigatorState.routes.findLast((route) => route.name === SCREENS.SEARCH.ROOT);
    if (!lastSearchRoute || !lastSearchRoute.params) {
        return;
    }

    const {q: searchParams} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
    const queryJSON = buildSearchQueryJSON(searchParams);
    if (!queryJSON) {
        return;
    }

    return queryJSON;
}

/**
 * Extracts the query text without the filter parts.
 * This is used to determine if a user's core search terms have changed,
 * ignoring any filter modifications.
 *
 * @param searchQuery - The complete search query string
 * @returns The query without filters (core search terms only)
 */
function getQueryWithoutFilters(searchQuery: string) {
    const queryJSON = buildSearchQueryJSON(searchQuery);
    if (!queryJSON) {
        return '';
    }

    const keywordFilter = queryJSON.flatFilters.find((filter) => filter.key === 'keyword');

    return keywordFilter?.filters.map((filter) => filter.value).join(' ') ?? '';
}

function shouldHighlight(referenceText: string, searchText: string) {
    if (!referenceText || !searchText) {
        return false;
    }

    const escapedText = searchText
        .toLowerCase()
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|\\s)${escapedText}(?=\\s|$)`, 'i');

    return pattern.test(referenceText.toLowerCase());
}

export {
    isSearchDatePreset,
    isFilterSupported,
    buildSearchQueryJSON,
    buildSearchQueryString,
    buildUserReadableQueryString,
    getFilterDisplayValue,
    buildQueryStringFromFilterFormValues,
    buildFilterFormValuesFromQuery,
    buildCannedSearchQuery,
    isCannedSearchQuery,
    sanitizeSearchValue,
    getQueryWithUpdatedValues,
    getCurrentSearchQueryJSON,
    getQueryWithoutFilters,
    isDefaultExpensesQuery,
    sortOptionsWithEmptyValue,
    shouldHighlight,
    getAllPolicyValues,
    getUserFriendlyValue,
    getUserFriendlyKey,
};
