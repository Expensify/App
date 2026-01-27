import cloneDeep from 'lodash/cloneDeep';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {
    ASTNode,
    QueryFilter,
    QueryFilters,
    RawQueryFilter,
    ReportFieldDateKey,
    ReportFieldNegatedKey,
    ReportFieldTextKey,
    SearchAmountFilterKeys,
    SearchDateFilterKeys,
    SearchDatePreset,
    SearchFilterKey,
    SearchQueryJSON,
    SearchQueryString,
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
import arraysEqual from '@src/utils/arraysEqual';
import {getCardFeedsForDisplay} from './CardFeedUtils';
import {getCardDescription} from './CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsInteger} from './CurrencyUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import Log from './Log';
import {validateAmount} from './MoneyRequestUtils';
import {getPreservedNavigatorState} from './Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import navigationRef from './Navigation/navigationRef';
import type {SearchFullscreenNavigatorParamList} from './Navigation/types';
import {getDisplayNameOrDefault, getPersonalDetailByEmail} from './PersonalDetailsUtils';
import {getCleanedTagName, getTagNamesFromTagsLists} from './PolicyUtils';
import {getReportName} from './ReportUtils';
import {parse as parseSearchQuery} from './SearchParser/searchParser';
import StringUtils from './StringUtils';
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

// Create reverse lookup maps for O(1) performance
const createKeyToUserFriendlyMap = () => {
    const map = new Map<string, string>();

    // Map SYNTAX_FILTER_KEYS values to their user-friendly names
    for (const [keyName, keyValue] of Object.entries(CONST.SEARCH.SYNTAX_FILTER_KEYS)) {
        if (!(keyName in CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS)) {
            continue;
        }
        map.set(keyValue, CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS[keyName as keyof typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS]);
    }

    // Map SYNTAX_ROOT_KEYS values to their user-friendly names
    for (const [keyName, keyValue] of Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS)) {
        if (!(keyName in CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS)) {
            continue;
        }
        map.set(keyValue, CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS[keyName as keyof typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS]);
    }

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
function getUserFriendlyKey(
    keyName: SearchFilterKey | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT,
): UserFriendlyKey {
    const isReportField = keyName.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX);

    if (isReportField) {
        return keyName.replace(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX, CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.REPORT_FIELD) as UserFriendlyKey;
    }

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
    const allowedOps = new Set<string>([CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO]);

    let filterValueString = '';
    for (const [index, queryFilter] of queryFilters.entries()) {
        const previousValueHasSameOp = allowedOps.has(queryFilter.operator) && queryFilters?.at(index - 1)?.operator === queryFilter.operator;
        const nextValueHasSameOp = allowedOps.has(queryFilter.operator) && queryFilters?.at(index + 1)?.operator === queryFilter.operator;

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
    }

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

        // Only process if its a leaf
        if (typeof node.left !== 'string') {
            return;
        }

        const nodeKey = node.left;

        if (!filterKeys.includes(nodeKey) && !nodeKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
            return;
        }

        const filterArray = [];
        if (!Array.isArray(node.right)) {
            filterArray.push({
                operator: node.operator,
                value: node.right as string | number,
            });
        } else {
            for (const element of node.right) {
                filterArray.push({
                    operator: node.operator,
                    value: element,
                });
            }
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
function getUpdatedFilterValue(filterName: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>, filterValue: string | string[], shouldSkipAmountConversion = false) {
    if (AMOUNT_FILTER_KEYS.includes(filterName as SearchAmountFilterKeys)) {
        if (shouldSkipAmountConversion) {
            return filterValue;
        }
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

    if (query.policyID) {
        orderedQuery += ` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${Array.isArray(query.policyID) ? query.policyID.join(',') : query.policyID} `;
    }

    const filterSet = new Set<string>(orderedQuery);

    // Certain filters shouldn't affect whether two searchers are similar or not, since they dont
    // actually filter out results
    const similarSearchIgnoredFilters = new Set<SearchFilterKey>([CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY]);

    // Certain filters' values are significant in deciding which search we are on, so we want to include
    // their value when computing the similarSearchHash
    const similarSearchValueBasedFilters = new Set<SearchFilterKey>([CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION]);

    const flatFilters = query.flatFilters
        .map((filter) => {
            const filterKey = filter.key;
            const filters = cloneDeep(filter.filters);
            filters.sort((a, b) => customCollator.compare(a.value.toString(), b.value.toString()));
            return {filterString: buildFilterValuesString(filterKey, filters), filterKey};
        })
        .sort((a, b) => customCollator.compare(a.filterString, b.filterString));

    for (const {filterString, filterKey} of flatFilters) {
        if (!similarSearchIgnoredFilters.has(filterKey)) {
            filterSet.add(filterKey);
        }

        if (similarSearchValueBasedFilters.has(filterKey)) {
            filterSet.add(filterString.trim());
        }

        orderedQuery += ` ${filterString}`;
    }

    const similarSearchHash = hashText(Array.from(filterSet).join(''), 2 ** 32);
    const recentSearchHash = hashText(orderedQuery, 2 ** 32);

    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${query.sortBy}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${query.sortOrder}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS}:${Array.isArray(query.columns) ? query.columns.join(',') : query.columns}`;

    if (query.limit !== undefined) {
        orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT}:${query.limit}`;
    }
    const primaryHash = hashText(orderedQuery, 2 ** 32);

    return {primaryHash, recentSearchHash, similarSearchHash};
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
    return ALLOWED_TYPE_FILTERS[type].some((supportedFilter) => {
        const isReportFieldSupported = supportedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD && filter.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX);
        return supportedFilter === filter || isReportFieldSupported;
    });
}

/**
 * Parses a given search query string into a structured `SearchQueryJSON` format.
 * This format of query is most commonly shared between components and also sent to backend to retrieve search results.
 *
 * In a way this is the reverse of buildSearchQueryString()
 */
function getRawFilterListFromQuery(rawQuery: SearchQueryString) {
    try {
        const rawResult = parseSearchQuery(rawQuery) as SearchQueryJSON;
        const sanitizedFilters = getSanitizedRawFilters(rawResult);
        return sanitizedFilters;
    } catch (error) {
        Log.warn('[Search] Failed to parse raw query for raw filters', {error, rawQuery});
    }

    return undefined;
}

function buildSearchQueryJSON(query: SearchQueryString, rawQuery?: SearchQueryString) {
    try {
        const result = parseSearchQuery(query) as SearchQueryJSON;
        const flatFilters = getFilters(result);

        // Add the full input and hash to the results
        result.inputQuery = query;
        result.flatFilters = flatFilters;

        if (result.policyID && typeof result.policyID === 'string') {
            // Ensure policyID is always an array for consistency
            result.policyID = [result.policyID];
        }

        // Normalize limit before computing hashes to ensure invalid values don't affect hash
        if (result.limit !== undefined) {
            const num = Number(result.limit);
            result.limit = Number.isInteger(num) && num > 0 ? num : undefined;
        }

        const {primaryHash, recentSearchHash, similarSearchHash} = getQueryHashes(result);
        result.hash = primaryHash;
        result.recentSearchHash = recentSearchHash;
        result.similarSearchHash = similarSearchHash;

        delete result.rawFilterList;
        if (rawQuery) {
            result.rawFilterList = getRawFilterListFromQuery(rawQuery);
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
    const queryParts: string[] = [];
    const defaultQueryJSON = buildSearchQueryJSON('');

    // Check if view was explicitly set by the user (exists in rawFilterList)
    const wasViewExplicitlySet = queryJSON?.rawFilterList?.some((filter) => filter.key === CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW);

    for (const [, key] of Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS)) {
        // Skip view if it wasn't explicitly set by the user
        if (key === CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW && !wasViewExplicitlySet) {
            continue;
        }

        const existingFieldValue = queryJSON?.[key];
        const queryFieldValue = existingFieldValue ?? defaultQueryJSON?.[key];

        if (queryFieldValue) {
            if (Array.isArray(queryFieldValue)) {
                queryParts.push(`${key}:${queryFieldValue.join(',')}`);
            } else {
                queryParts.push(`${key}:${queryFieldValue}`);
            }
        }
    }

    if (queryJSON?.policyID) {
        queryParts.push(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${Array.isArray(queryJSON.policyID) ? queryJSON.policyID.join(',') : queryJSON.policyID}`);
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

function getSanitizedRawFilters(queryJSON: SearchQueryJSON): RawQueryFilter[] | undefined {
    if (!queryJSON.rawFilterList || queryJSON.rawFilterList.length === 0) {
        return undefined;
    }

    const sanitizedFilters = queryJSON.rawFilterList.reduce<RawQueryFilter[]>((accumulator, rawFilter) => {
        if (!rawFilter) {
            return accumulator;
        }

        if (rawFilter.isDefault) {
            accumulator.push(rawFilter);
            return accumulator;
        }

        const rawValue = rawFilter.value;
        const filterKey = rawFilter.key;
        const isRecognizedFilterKey = Object.values(CONST.SEARCH.SYNTAX_FILTER_KEYS).includes(filterKey as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>);
        let updatedValue: string | string[] = Array.isArray(rawValue) ? rawValue.map((value) => value?.toString() ?? '') : (rawValue?.toString() ?? '');

        if (isRecognizedFilterKey) {
            updatedValue = getUpdatedFilterValue(filterKey as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>, updatedValue);
        }

        accumulator.push({
            ...rawFilter,
            value: updatedValue,
        });
        return accumulator;
    }, []);

    const seenKeys = new Set<string>();

    for (let index = sanitizedFilters.length - 1; index >= 0; index -= 1) {
        const filter = sanitizedFilters.at(index);

        if (!filter) {
            continue;
        }

        const filterKey = filter.key;

        if (seenKeys.has(filterKey) && filter.isDefault) {
            sanitizedFilters.splice(index, 1);
            continue;
        }

        seenKeys.add(filterKey);
    }

    return sanitizedFilters;
}

type BuildQueryStringOptions = {
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
};

/**
 * Formats a given object with search filter values into the string version of the query.
 * Main usage is to consume data format that comes from AdvancedFilters Onyx Form Data, and generate query string.
 *
 * Reverse operation of buildFilterFormValuesFromQuery()
 */
function buildQueryStringFromFilterFormValues(filterValues: Partial<SearchAdvancedFiltersForm>, options?: BuildQueryStringOptions) {
    const supportedFilterValues = {...filterValues};

    // When switching types/setting the type, ensure we aren't polluting our query with filters that are
    // only available for the previous type. Remove all filters that are not allowed for the new type
    const providedFilterKeys = Object.keys(supportedFilterValues) as SearchAdvancedFiltersKey[];
    for (const filter of providedFilterKeys) {
        if (isFilterSupported(filter, supportedFilterValues.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE)) {
            continue;
        }

        supportedFilterValues[filter] = undefined;
    }

    // We separate type and status filters from other filters to maintain hashes consistency for saved searches
    const {type, status, groupBy, columns, limit, ...otherFilters} = supportedFilterValues;
    const filtersString: string[] = [];

    filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${options?.sortBy ?? CONST.SEARCH.TABLE_COLUMNS.DATE}`);
    filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${options?.sortOrder ?? CONST.SEARCH.SORT_ORDER.DESC}`);

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

    if (columns?.length) {
        const filterValueArray = [...new Set<string>(columns)];
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS}:${filterValueArray.map(sanitizeSearchValue).join(',')}`);
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

            if (filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX) && filterValue) {
                const value = sanitizeSearchValue(filterValue as string);
                const isFieldNegated = filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.NOT_PREFIX);
                const isTextBasedReportField = filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX) || isNegated;
                const fieldPrefix = isFieldNegated ? '-' : '';

                if (isTextBasedReportField) {
                    return `${fieldPrefix}${filterKey}:${value}`;
                }

                const isOnDateField = filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.ON_PREFIX);
                const isAfterDateField = filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX);
                const isBeforeDateField = filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX);

                if (isOnDateField) {
                    const key = filterKey.replace(CONST.SEARCH.REPORT_FIELD.ON_PREFIX, CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX);
                    return `${key}:${value}`;
                }

                if (isAfterDateField) {
                    const key = filterKey.replace(CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX, CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX);
                    return `${key}>${value}`;
                }

                if (isBeforeDateField) {
                    const key = filterKey.replace(CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX, CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX);
                    return `${key}<${value}`;
                }
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
                    filterKey === FILTER_KEYS.ATTENDEE ||
                    filterKey === FILTER_KEYS.COLUMNS) &&
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

    for (const dateKey of DATE_FILTER_KEYS) {
        const dateFilter = buildDateFilterQuery(supportedFilterValues, dateKey);
        filtersString.push(dateFilter);
    }

    for (const filterKey of AMOUNT_FILTER_KEYS) {
        const amountFilter = buildAmountFilterQuery(filterKey, supportedFilterValues);
        filtersString.push(amountFilter);
    }

    const limitValue = limit ?? options?.limit;
    if (limitValue !== undefined) {
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT}:${limitValue}`);
    }

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
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE) {
            filtersForm[key as typeof filterKey] = filterValues.at(0);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION) {
            const actionValue = filterValues.at(0);
            filtersForm[key as typeof filterKey] =
                actionValue && Object.values(CONST.SEARCH.ACTION_FILTERS).includes(actionValue as ValueOf<typeof CONST.SEARCH.ACTION_FILTERS>) ? actionValue : undefined;
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
            filtersForm[key as typeof filterKey] = filterValues.find((withdrawalType): withdrawalType is SearchWithdrawalType =>
                validWithdrawalTypes.has(withdrawalType as ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>),
            );
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
            filtersForm[filterKey] = filterValues.find((currency) => validCurrency.has(currency));
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
            const hasEmptyCategoriesInFilter = filterValues.includes(CONST.SEARCH.CATEGORY_EMPTY_VALUE);
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
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2, true))
                    ?.value.toString() ?? filtersForm[equalToKey];
            filtersForm[lessThanKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2, true))
                    ?.value.toString() ?? filtersForm[lessThanKey];
            filtersForm[greaterThanKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2, true))
                    ?.value.toString() ?? filtersForm[greaterThanKey];
            filtersForm[negatedKey] =
                filterList
                    .find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2, true))
                    ?.value.toString() ?? filtersForm[negatedKey];
        }

        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE) {
            const validBooleanTypes = Object.values(CONST.SEARCH.BOOLEAN);
            filtersForm[key as typeof filterKey] = validBooleanTypes.find((value) => filterValues.at(0) === value);
        }

        if (filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX)) {
            const suffix = filterKey.replace(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX, '');

            const textKey = filterKey as ReportFieldTextKey;
            const negatedKey = `${CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX}${CONST.SEARCH.NOT_MODIFIER}${suffix}` as ReportFieldNegatedKey;
            const dateOnKey = `${CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX}${CONST.SEARCH.DATE_MODIFIERS.ON}${suffix}` as ReportFieldDateKey;
            const dateBeforeKey = `${CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}${suffix}` as ReportFieldDateKey;
            const dateAfterKey = `${CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX}${CONST.SEARCH.DATE_MODIFIERS.AFTER}${suffix}` as ReportFieldDateKey;

            let dateBeforeFilter;
            let dateAfterFilter;
            let dateOnFilter;
            let negatedFilter;
            let textFilter;

            for (const filter of filterList) {
                if (filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN && isValidDate(filter.value.toString())) {
                    dateBeforeFilter = filter;
                } else if (filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN && isValidDate(filter.value.toString())) {
                    dateAfterFilter = filter;
                } else if (filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO && (isValidDate(filter.value.toString()) || isSearchDatePreset(filter.value.toString()))) {
                    dateOnFilter = filter;
                } else if (filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO) {
                    negatedFilter = filter;
                } else if (filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO && !isValidDate(filter.value.toString()) && !isSearchDatePreset(filter.value.toString())) {
                    textFilter = filter;
                }
            }

            filtersForm[textKey] = textFilter?.value.toString() ?? filtersForm[textKey];
            filtersForm[negatedKey] = negatedFilter?.value.toString() ?? filtersForm[negatedKey];
            filtersForm[dateOnKey] = dateOnFilter?.value.toString() ?? filtersForm[dateOnKey];
            filtersForm[dateBeforeKey] = dateBeforeFilter?.value.toString() ?? filtersForm[dateBeforeKey];
            filtersForm[dateAfterKey] = dateAfterFilter?.value.toString() ?? filtersForm[dateAfterKey];
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

    if (queryJSON.columns) {
        const columns = [queryJSON.columns].flat();
        filtersForm[FILTER_KEYS.COLUMNS] = columns;
    }

    if (queryJSON.limit !== undefined) {
        filtersForm[FILTER_KEYS.LIMIT] = queryJSON.limit.toString();
    }

    return filtersForm;
}

/**
 * Returns the policy name for a given policy ID.
 * First checks the policies collection, then falls back to cached names in reports (policyName or oldPolicyName).
 * This ensures workspace names remain visible even after a user is removed from the workspace.
 */
function getPolicyNameWithFallback(policyID: string, policies: OnyxCollection<OnyxTypes.Policy>, reports?: OnyxCollection<OnyxTypes.Report>): string {
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
    const policy = policies?.[policyKey];

    if (policy?.name) {
        return policy.name;
    }

    // Fallback: find cached name from reports that reference this policy
    if (!reports) {
        return policyID;
    }

    const reportWithPolicyName = Object.values(reports).find((report) => report?.policyID === policyID && (report?.policyName ?? report?.oldPolicyName));

    return reportWithPolicyName?.policyName ?? reportWithPolicyName?.oldPolicyName ?? policyID;
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
        return filterValue === currentUserAccountID.toString() ? CONST.SEARCH.ME : getDisplayNameOrDefault(personalDetails?.[filterValue], filterValue, false);
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        const cardID = parseInt(filterValue, 10);
        if (Number.isNaN(cardID)) {
            return filterValue;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getCardDescription(cardList?.[cardID], translateLocal) || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        return getPolicyNameWithFallback(filterValue, policies, reports);
    }
    return filterValue;
}

function getDisplayQueryFiltersForKey(
    key: string,
    queryFilter: QueryFilter[],
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    reports: OnyxCollection<OnyxTypes.Report>,
    taxRates: Record<string, string[]>,
    cardList: OnyxTypes.CardList,
    cardFeeds: OnyxCollection<OnyxTypes.CardFeeds>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    currentUserAccountID: number,
) {
    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
        const taxRateIDs = queryFilter.map((filter) => filter.value.toString());
        const taxRateNames = taxRateIDs
            .map((id) => {
                const taxRate = Object.entries(taxRates)
                    .filter(([, IDs]) => IDs.includes(id))
                    .map(([name]) => name);
                return taxRate.length > 0 ? taxRate : id;
            })
            .flat();

        const uniqueTaxRateNames = [...new Set(taxRateNames)];

        return uniqueTaxRateNames.map((taxRate) => ({
            operator: queryFilter.at(0)?.operator ?? CONST.SEARCH.SYNTAX_OPERATORS.AND,
            value: taxRate,
        }));
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED) {
        return queryFilter.reduce((acc, filter) => {
            const feedKey = filter.value.toString();
            const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeeds, cardList);
            const plaidFeedName = feedKey?.split(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID)?.at(1);
            const regularBank = feedKey?.split('_')?.at(1) ?? CONST.DEFAULT_NUMBER_ID;
            const idPrefix = feedKey?.split('_')?.at(0) ?? CONST.DEFAULT_NUMBER_ID;
            const plaidValue = cardFeedsForDisplay[`${idPrefix}_${CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID}${plaidFeedName}` as OnyxTypes.CompanyCardFeed]?.name;
            if (plaidFeedName) {
                if (plaidValue) {
                    acc.push({operator: filter.operator, value: plaidValue});
                }
                return acc;
            }
            const value = cardFeedsForDisplay[`${idPrefix}_${regularBank}` as OnyxTypes.CompanyCardFeed]?.name ?? feedKey;
            acc.push({operator: filter.operator, value});

            return acc;
        }, [] as QueryFilter[]);
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        return queryFilter.reduce((acc, filter) => {
            const cardValue = filter.value.toString();
            const cardID = parseInt(cardValue, 10);

            if (cardList?.[cardID]) {
                if (Number.isNaN(cardID)) {
                    acc.push({operator: filter.operator, value: cardID});
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    acc.push({operator: filter.operator, value: getCardDescription(cardList?.[cardID], translateLocal) || cardID});
                }
            }
            return acc;
        }, [] as QueryFilter[]);
    }

    return queryFilter.map((filter) => ({
        operator: filter.operator,
        value: getFilterDisplayValue(key, getUserFriendlyValue(filter.value.toString()), personalDetails, reports, cardList, cardFeeds, policies, currentUserAccountID),
    }));
}

function formatDefaultRawFilterSegment(rawFilter: RawQueryFilter, policies: OnyxCollection<OnyxTypes.Policy>, reports?: OnyxCollection<OnyxTypes.Report>) {
    const rawValues = Array.isArray(rawFilter.value) ? rawFilter.value : [rawFilter.value];
    const cleanedValues = rawValues.map((val) => (typeof val === 'string' ? val.trim() : '')).filter((val) => val.length > 0);

    if (cleanedValues.length === 0) {
        return;
    }

    if (rawFilter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) {
        const workspaceValues = cleanedValues.map((id) => {
            const policyName = getPolicyNameWithFallback(id, policies, reports);
            return sanitizeSearchValue(policyName);
        });

        if (workspaceValues.length === 0) {
            return;
        }

        return `${getUserFriendlyKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID)}:${workspaceValues.join(',')}`;
    }

    if (rawFilter.key === CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY || rawFilter.key === CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER) {
        return;
    }

    let userFriendlyKey: UserFriendlyKey;
    switch (rawFilter.key) {
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE:
            userFriendlyKey = getUserFriendlyKey(CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE);
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS:
            userFriendlyKey = getUserFriendlyKey(CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS);
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            userFriendlyKey = getUserFriendlyKey(CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY);
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS:
            userFriendlyKey = getUserFriendlyKey(CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS);
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT:
            userFriendlyKey = getUserFriendlyKey(CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT);
            break;
        default:
            userFriendlyKey = getUserFriendlyKey(rawFilter.key as SearchFilterKey);
            break;
    }

    const formattedValues = cleanedValues.map((val) => sanitizeSearchValue(getUserFriendlyValue(val)));

    if (!formattedValues.length) {
        return;
    }

    return `${userFriendlyKey}:${formattedValues.join(',')}`;
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
    autoCompleteWithSpace = false,
) {
    const {type, status, groupBy, columns, policyID, rawFilterList, flatFilters: filters = [], limit} = queryJSON;

    if (rawFilterList && rawFilterList.length > 0) {
        const segments: string[] = [];

        for (const rawFilter of rawFilterList) {
            if (!rawFilter) {
                continue;
            }

            if (rawFilter.isDefault) {
                const defaultSegment = formatDefaultRawFilterSegment(rawFilter, policies, reports);
                if (defaultSegment) {
                    segments.push(defaultSegment);
                }
                continue;
            }

            const rawValues = Array.isArray(rawFilter.value) ? rawFilter.value : [rawFilter.value];
            const queryFilters = rawValues
                .map((val) => (val ?? '').toString())
                .filter((val) => val.length > 0)
                .map((val) => ({
                    operator: rawFilter.operator,
                    value: val,
                }));

            if (!queryFilters.length) {
                continue;
            }

            const displayQueryFilters = getDisplayQueryFiltersForKey(rawFilter.key, queryFilters, PersonalDetails, reports, taxRates, cardList, cardFeeds, policies, currentUserAccountID);

            if (!displayQueryFilters.length) {
                continue;
            }

            const segment = buildFilterValuesString(getUserFriendlyKey(rawFilter.key as SearchFilterKey), displayQueryFilters).trim();

            if (segment) {
                segments.push(segment);
            }
        }

        if (segments.length > 0) {
            return segments.join(' ');
        }
    }

    let title = status
        ? `type:${getUserFriendlyValue(type)} status:${Array.isArray(status) ? status.map(getUserFriendlyValue).join(',') : getUserFriendlyValue(status)}`
        : `type:${getUserFriendlyValue(type)}`;

    if (groupBy) {
        title += ` group-by:${getUserFriendlyValue(groupBy)}`;
    }

    if (policyID && policyID.length > 0) {
        title += ` workspace:${policyID.map((id) => sanitizeSearchValue(getPolicyNameWithFallback(id, policies, reports))).join(',')}`;
    }

    if (columns && columns.length > 0) {
        const columnValue = Array.isArray(columns) ? columns.map((column) => getUserFriendlyValue(column)).join(',') : getUserFriendlyValue(columns);
        title += ` columns:${columnValue}`;
    }

    for (const filterObject of filters) {
        const key = filterObject.key;
        const displayQueryFilters = getDisplayQueryFiltersForKey(key, filterObject.filters, PersonalDetails, reports, taxRates, cardList, cardFeeds, policies, currentUserAccountID);

        if (!displayQueryFilters.length) {
            continue;
        }

        title += buildFilterValuesString(getUserFriendlyKey(key), displayQueryFilters);
    }

    if (limit !== undefined) {
        title += ` limit:${limit}`;
    }

    if (autoCompleteWithSpace && !title.endsWith(' ')) {
        title += ' ';
    }

    return title;
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
    const selectedColumns = [queryJSON.columns ?? []].flat();
    const defaultColumns = Object.values(CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE_REPORT);
    const hasCustomColumns = !arraysEqual(defaultColumns, selectedColumns) && selectedColumns.length > 0;
    return !queryJSON.filters && !queryJSON.policyID && !queryJSON.status && !hasCustomColumns;
}

function isDefaultExpensesQuery(queryJSON: SearchQueryJSON) {
    return queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE && !queryJSON.status && !queryJSON.filters && !queryJSON.groupBy && !queryJSON.policyID;
}

function isDefaultExpenseReportsQuery(queryJSON: SearchQueryJSON) {
    return queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT && !queryJSON.status && !queryJSON.filters && !queryJSON.groupBy && !queryJSON.policyID;
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
    return standardQuery;
}

/**
 * Returns new string query, after parsing it and traversing to update some filter values.
 * If there are any personal emails, it will try to substitute them with accountIDs
 */
function getQueryWithUpdatedValues(query: string, shouldSkipAmountConversion = false) {
    const queryJSON = buildSearchQueryJSON(query);

    if (!queryJSON) {
        Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} user query failed to parse`, {}, false);
        return;
    }

    const computeNodeValue = (left: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>, right: string | string[]) => getUpdatedFilterValue(left, right, shouldSkipAmountConversion);
    const standardizedQuery = traverseAndUpdatedQuery(queryJSON, computeNodeValue);
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

    const {q: searchParams, rawQuery} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
    const queryJSON = buildSearchQueryJSON(searchParams, rawQuery);
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

    const escapedText = StringUtils.normalizeAccents(searchText)
        .toLowerCase()
        .trim()
        .replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|\\s)${escapedText}(?=\\s|$)`, 'i');

    return pattern.test(StringUtils.normalizeAccents(referenceText).toLowerCase());
}

function shouldSkipSuggestedSearchNavigation(queryJSON?: SearchQueryJSON) {
    if (!queryJSON) {
        return false;
    }

    const hasKeywordFilter = queryJSON.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD);
    const hasContextFilter = queryJSON.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN);
    const inputQuery = queryJSON.inputQuery?.toLowerCase() ?? '';
    const hasInlineKeywordFilter = inputQuery.includes(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD.toLowerCase()}:`);
    const hasInlineContextFilter = inputQuery.includes(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN.toLowerCase()}:`);
    const isChatSearch = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

    return !!queryJSON.rawFilterList || hasKeywordFilter || hasContextFilter || hasInlineKeywordFilter || hasInlineContextFilter || isChatSearch;
}

export {
    isSearchDatePreset,
    isFilterSupported,
    buildSearchQueryJSON,
    buildSearchQueryString,
    buildUserReadableQueryString,
    getFilterDisplayValue,
    getPolicyNameWithFallback,
    buildQueryStringFromFilterFormValues,
    buildFilterFormValuesFromQuery,
    buildCannedSearchQuery,
    isCannedSearchQuery,
    sanitizeSearchValue,
    getQueryWithUpdatedValues,
    getCurrentSearchQueryJSON,
    getQueryWithoutFilters,
    isDefaultExpensesQuery,
    isDefaultExpenseReportsQuery,
    sortOptionsWithEmptyValue,
    shouldHighlight,
    getAllPolicyValues,
    getUserFriendlyValue,
    getUserFriendlyKey,
    shouldSkipSuggestedSearchNavigation,
};
