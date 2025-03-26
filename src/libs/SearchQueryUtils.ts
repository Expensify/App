import cloneDeep from 'lodash/cloneDeep';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {ASTNode, QueryFilter, QueryFilters, SearchDateFilterKeys, SearchFilterKey, SearchQueryJSON, SearchQueryString, SearchStatus, UserFriendlyKey} from '@components/Search/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS, {DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type {CardFeedNamesWithType} from './CardFeedUtils';
import {getWorkspaceCardFeedKey} from './CardFeedUtils';
import {getCardDescription} from './CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsInteger} from './CurrencyUtils';
import localeCompare from './LocaleCompare';
import Log from './Log';
import {validateAmount} from './MoneyRequestUtils';
import {getPersonalDetailByEmail} from './PersonalDetailsUtils';
import {getCleanedTagName, getTagNamesFromTagsLists} from './PolicyUtils';
import {getReportName} from './ReportUtils';
import {parse as parseSearchQuery} from './SearchParser/searchParser';
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
    [CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO]: '!=' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.AND]: ',' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.OR]: ' ' as const,
};

/**
 * A mapping object that maps filter names from the internal codebase format to user-friendly names.
 */
const UserFriendlyKeyMap: Record<SearchFilterKey | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER, UserFriendlyKey> = {
    type: 'type',
    status: 'status',
    sortBy: 'sort-by',
    sortOrder: 'sort-order',
    policyID: 'workspace',
    date: 'date',
    amount: 'amount',
    expenseType: 'expense-type',
    currency: 'currency',
    merchant: 'merchant',
    description: 'description',
    from: 'from',
    to: 'to',
    category: 'category',
    tag: 'tag',
    taxRate: 'tax-rate',
    cardID: 'card',
    feed: 'feed',
    reportID: 'reportid',
    keyword: 'keyword',
    in: 'in',
    submitted: 'submitted',
    approved: 'approved',
    paid: 'paid',
    exported: 'exported',
    posted: 'posted',
    groupBy: 'group-by',
};

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
    const dateBefore = filterValues[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`];
    const dateAfter = filterValues[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`];

    let dateFilter = '';
    if (dateBefore) {
        dateFilter += `${filterKey}<${dateBefore}`;
    }
    if (dateBefore && dateAfter) {
        dateFilter += ' ';
    }
    if (dateAfter) {
        dateFilter += `${filterKey}>${dateAfter}`;
    }

    return dateFilter;
}

/**
 * @private
 * Returns amount filter value for QueryString.
 */
function buildAmountFilterQuery(filterValues: Partial<SearchAdvancedFiltersForm>) {
    const lessThan = filterValues[FILTER_KEYS.LESS_THAN];
    const greaterThan = filterValues[FILTER_KEYS.GREATER_THAN];

    let amountFilter = '';
    if (greaterThan) {
        amountFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}>${greaterThan}`;
    }
    if (lessThan && greaterThan) {
        amountFilter += ' ';
    }
    if (lessThan) {
        amountFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}<${lessThan}`;
    }

    return amountFilter;
}

/**
 * @private
 * Returns string of correctly formatted filter values from QueryFilters object.
 */
function buildFilterValuesString(filterName: string, queryFilters: QueryFilter[]) {
    const delimiter = filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ? ' ' : ',';
    let filterValueString = '';
    queryFilters.forEach((queryFilter, index) => {
        // If the previous queryFilter has the same operator (this rule applies only to eq and neq operators) then append the current value
        if (
            index !== 0 &&
            ((queryFilter.operator === 'eq' && queryFilters?.at(index - 1)?.operator === 'eq') || (queryFilter.operator === 'neq' && queryFilters.at(index - 1)?.operator === 'neq'))
        ) {
            filterValueString += `${delimiter}${sanitizeSearchValue(queryFilter.value.toString())}`;
        } else if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filterValueString += `${delimiter}${sanitizeSearchValue(queryFilter.value.toString())}`;
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
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
        if (typeof filterValue === 'string') {
            return getPersonalDetailByEmail(filterValue)?.accountID.toString() ?? filterValue;
        }

        return filterValue.map((email) => getPersonalDetailByEmail(email)?.accountID.toString() ?? email);
    }

    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
        if (typeof filterValue === 'string') {
            const backendAmount = convertToBackendAmount(Number(filterValue));
            return Number.isNaN(backendAmount) ? filterValue : backendAmount.toString();
        }
        return filterValue.map((amount) => {
            const backendAmount = convertToBackendAmount(Number(amount));
            return Number.isNaN(backendAmount) ? amount : backendAmount.toString();
        });
    }

    return filterValue;
}

/**
 * @private
 * Computes and returns a numerical hash for a given queryJSON.
 * Sorts the query keys and values to ensure that hashes stay consistent.
 */
function getQueryHashes(query: SearchQueryJSON): {primaryHash: number; recentSearchHash: number} {
    let orderedQuery = '';
    orderedQuery += `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${query.type}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${Array.isArray(query.status) ? query.status.join(',') : query.status}`;

    query.flatFilters
        .map((filter) => {
            const filters = cloneDeep(filter.filters);
            filters.sort((a, b) => localeCompare(a.value.toString(), b.value.toString()));
            return buildFilterValuesString(filter.key, filters);
        })
        .sort()
        .forEach((filterString) => (orderedQuery += ` ${filterString}`));

    const recentSearchHash = hashText(orderedQuery, 2 ** 32);

    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${query.sortBy}`;
    orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${query.sortOrder}`;
    if (query.policyID) {
        orderedQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${query.policyID} `;
    }
    const primaryHash = hashText(orderedQuery, 2 ** 32);

    return {primaryHash, recentSearchHash};
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
        const {primaryHash, recentSearchHash} = getQueryHashes(result);
        result.hash = primaryHash;
        result.recentSearchHash = recentSearchHash;

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

    for (const [, key] of Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS)) {
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
    // We separate type and status filters from other filters to maintain hashes consistency for saved searches
    const {type, status, policyID, ...otherFilters} = filterValues;
    const filtersString: string[] = [];

    filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${CONST.SEARCH.TABLE_COLUMNS.DATE}`);
    filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${CONST.SEARCH.SORT_ORDER.DESC}`);

    if (type) {
        const sanitizedType = sanitizeSearchValue(type);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${sanitizedType}`);
    }

    if (status) {
        const sanitizedStatus = sanitizeSearchValue(status);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${sanitizedStatus}`);
    }

    if (policyID) {
        const sanitizedPolicyID = sanitizeSearchValue(policyID);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${sanitizedPolicyID}`);
    }

    const mappedFilters = Object.entries(otherFilters)
        .map(([filterKey, filterValue]) => {
            if ((filterKey === FILTER_KEYS.MERCHANT || filterKey === FILTER_KEYS.DESCRIPTION || filterKey === FILTER_KEYS.REPORT_ID) && filterValue) {
                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
                if (keyInCorrectForm) {
                    return `${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${sanitizeSearchValue(filterValue as string)}`;
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
                    filterKey === FILTER_KEYS.FROM ||
                    filterKey === FILTER_KEYS.TO ||
                    filterKey === FILTER_KEYS.FEED ||
                    filterKey === FILTER_KEYS.IN) &&
                Array.isArray(filterValue) &&
                filterValue.length > 0
            ) {
                const filterValueArray = [...new Set<string>(filterValue)];
                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
                if (keyInCorrectForm) {
                    return `${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${filterValueArray.map(sanitizeSearchValue).join(',')}`;
                }
            }

            return undefined;
        })
        .filter((filter): filter is string => !!filter);

    filtersString.push(...mappedFilters);

    DATE_FILTER_KEYS.forEach((dateKey) => {
        const dateFilter = buildDateFilterQuery(filterValues, dateKey);
        filtersString.push(dateFilter);
    });

    const amountFilter = buildAmountFilterQuery(filterValues);
    filtersString.push(amountFilter);

    return filtersString.join(' ').trim();
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
        const filterKey = queryFilter.key;
        const filterList = queryFilter.filters;
        const filterValues = filterList.map((item) => item.value.toString());
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION) {
            filtersForm[filterKey] = filterValues.at(0);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
            const validExpenseTypes = new Set(Object.values(CONST.SEARCH.TRANSACTION_TYPE));
            filtersForm[filterKey] = filterValues.filter((expenseType) => validExpenseTypes.has(expenseType as ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            filtersForm[filterKey] = filterValues.filter((card) => cardList[card]);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED) {
            filtersForm[filterKey] = filterValues.filter((feed) => feed);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const allTaxRates = new Set(Object.values(taxRates).flat());
            filtersForm[filterKey] = filterValues.filter((tax) => allTaxRates.has(tax));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
            filtersForm[filterKey] = filterValues.filter((id) => reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`]?.reportID);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
            filtersForm[filterKey] = filterValues.filter((id) => personalDetails && personalDetails[id]);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY) {
            const validCurrency = new Set(Object.keys(currencyList));
            filtersForm[filterKey] = filterValues.filter((currency) => validCurrency.has(currency));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) {
            const tags = policyID
                ? getTagNamesFromTagsLists(policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})
                : Object.values(policyTags ?? {})
                      .filter((item) => !!item)
                      .map((tagList) => getTagNamesFromTagsLists(tagList ?? {}))
                      .flat();
            const uniqueTags = new Set(tags);
            uniqueTags.add(CONST.SEARCH.EMPTY_VALUE);
            filtersForm[filterKey] = filterValues.filter((name) => uniqueTags.has(name));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) {
            const categories = policyID
                ? Object.values(policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {}).map((category) => category.name)
                : Object.values(policyCategories ?? {})
                      .map((item) => Object.values(item ?? {}).map((category) => category.name))
                      .flat();
            const uniqueCategories = new Set(categories);
            uniqueCategories.add(CONST.SEARCH.EMPTY_VALUE);
            filtersForm[filterKey] = filterValues.filter((name) => uniqueCategories.has(name));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filtersForm[filterKey] = filterValues
                ?.map((filter) => {
                    if (filter.includes(' ')) {
                        return `"${filter}"`;
                    }
                    return filter;
                })
                .join(' ');
        }
        if (DATE_FILTER_KEYS.includes(filterKey as SearchDateFilterKeys)) {
            const beforeKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.BEFORE}`;
            const afterKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.AFTER}`;
            filtersForm[beforeKey] = filterList.find((filter) => filter.operator === 'lt' && isValidDate(filter.value.toString()))?.value.toString() ?? filtersForm[beforeKey];
            filtersForm[afterKey] = filterList.find((filter) => filter.operator === 'gt' && isValidDate(filter.value.toString()))?.value.toString() ?? filtersForm[afterKey];
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
            // backend amount is an integer and is 2 digits longer than frontend amount
            filtersForm[FILTER_KEYS.LESS_THAN] =
                filterList.find((filter) => filter.operator === 'lt' && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2))?.value.toString() ??
                filtersForm[FILTER_KEYS.LESS_THAN];
            filtersForm[FILTER_KEYS.GREATER_THAN] =
                filterList.find((filter) => filter.operator === 'gt' && validateAmount(filter.value.toString(), 0, CONST.IOU.AMOUNT_MAX_LENGTH + 2))?.value.toString() ??
                filtersForm[FILTER_KEYS.GREATER_THAN];
        }
    }

    const [typeKey = '', typeValue] = Object.entries(CONST.SEARCH.DATA_TYPES).find(([, value]) => value === queryJSON.type) ?? [];
    filtersForm[FILTER_KEYS.TYPE] = typeValue ? queryJSON.type : CONST.SEARCH.DATA_TYPES.EXPENSE;
    const [statusKey] =
        Object.entries(CONST.SEARCH.STATUS).find(([, value]) =>
            Array.isArray(queryJSON.status) ? queryJSON.status.some((status) => Object.values(value).includes(status)) : Object.values(value).includes(queryJSON.status),
        ) ?? [];

    if (typeKey === statusKey) {
        filtersForm[FILTER_KEYS.STATUS] = Array.isArray(queryJSON.status) ? queryJSON.status.join(',') : queryJSON.status;
    } else {
        filtersForm[FILTER_KEYS.STATUS] = CONST.SEARCH.STATUS.EXPENSE.ALL;
    }

    if (queryJSON.policyID) {
        filtersForm[FILTER_KEYS.POLICY_ID] = queryJSON.policyID;
    }

    return filtersForm;
}

/**
 * Given a SearchQueryJSON this function will try to find the value of policyID filter saved in query
 * and return just the first policyID value from the filter.
 *
 * Note: `policyID` property can store multiple policy ids (just like many other search filters) as a comma separated value;
 * however there are several places in the app (related to WorkspaceSwitcher) that will accept only a single policyID.
 */
function getPolicyIDFromSearchQuery(queryJSON: SearchQueryJSON) {
    const policyIDFilter = queryJSON.policyID;

    if (!policyIDFilter) {
        return;
    }

    // policyID is a comma-separated value
    const [policyID] = policyIDFilter.split(',');

    return policyID;
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
    cardFeedNamesWithType: CardFeedNamesWithType,
) {
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
        // login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return personalDetails?.[filterValue]?.displayName || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        const cardID = parseInt(filterValue, 10);
        if (Number.isNaN(cardID)) {
            return filterValue;
        }
        return getCardDescription(cardID, cardList) || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
        return getReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${filterValue}`]) || filterValue;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
        const frontendAmount = convertToFrontendAmountAsInteger(Number(filterValue));
        return Number.isNaN(frontendAmount) ? filterValue : frontendAmount.toString();
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) {
        return getCleanedTagName(filterValue);
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED) {
        const workspaceFeedKey = getWorkspaceCardFeedKey(filterValue);

        const workspaceValue = cardFeedNamesWithType[workspaceFeedKey];
        const domainValue = cardFeedNamesWithType[filterValue];

        if (workspaceValue && workspaceValue.type === 'workspace') {
            return workspaceValue.name;
        }

        if (domainValue && domainValue.type === 'domain') {
            return domainValue.name;
        }
    }
    return filterValue;
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
    cardFeedNamesWithType: CardFeedNamesWithType,
) {
    const {type, status, groupBy} = queryJSON;
    const filters = queryJSON.flatFilters;

    let title = `type:${type} status:${Array.isArray(status) ? status.join(',') : status}`;

    if (groupBy) {
        title += ` group-by:${groupBy}`;
    }

    for (const filterObject of filters) {
        const key = filterObject.key;
        const queryFilter = filterObject.filters;

        let displayQueryFilters: QueryFilter[] = [];
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

            displayQueryFilters = uniqueTaxRateNames.map((taxRate) => ({
                operator: queryFilter.at(0)?.operator ?? CONST.SEARCH.SYNTAX_OPERATORS.AND,
                value: taxRate,
            }));
        } else {
            displayQueryFilters = queryFilter.map((filter) => ({
                operator: filter.operator,
                value: getFilterDisplayValue(key, filter.value.toString(), PersonalDetails, reports, cardList, cardFeedNamesWithType),
            }));
        }
        title += buildFilterValuesString(getUserFriendlyKey(key), displayQueryFilters);
    }

    return title;
}

/**
 * Returns properly built QueryString for a canned query, with the optional policyID.
 */
function buildCannedSearchQuery({
    type = CONST.SEARCH.DATA_TYPES.EXPENSE,
    status = CONST.SEARCH.STATUS.EXPENSE.ALL,
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
    let queryString = `type:${type} status:${Array.isArray(status) ? status.join(',') : status}`;

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
 * For example: "type:trip status:all" is a canned query.
 */
function isCannedSearchQuery(queryJSON: SearchQueryJSON) {
    return !queryJSON.filters;
}

function isDefaultExpensesQuery(queryJSON: SearchQueryJSON) {
    return queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE && queryJSON.status === CONST.SEARCH.STATUS.EXPENSE.ALL && !queryJSON.filters && !queryJSON.groupBy;
}

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
function getQueryWithUpdatedValues(query: string, policyID?: string) {
    const queryJSON = buildSearchQueryJSON(query);

    if (!queryJSON) {
        Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} user query failed to parse`, {}, false);
        return;
    }

    if (policyID) {
        queryJSON.policyID = policyID;
    }

    const standardizedQuery = traverseAndUpdatedQuery(queryJSON, getUpdatedFilterValue);
    return buildSearchQueryString(standardizedQuery);
}

/**
 * Converts a filter key from old naming (camelCase) to user friendly naming (kebab-case).
 *
 * There are two types of keys used in the context of Search.
 * The `camelCase` naming (ex: `sortBy`, `taxRate`) is more friendly to developers, but not nice to show to people. This was the default key naming in the past.
 * The "user friendly" naming (ex: `sort-by`, `tax-rate`) was introduced at a later point, to offer better experience for the users.
 * Currently search parsers support both versions as an input, but output the `camelCase` form. Whenever we display some query to the user however, we always do it in the newer pretty format.
 *
 * @example
 * getUserFriendlyKey("taxRate") // returns "tax-rate"
 */
function getUserFriendlyKey(keyName: SearchFilterKey | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER): UserFriendlyKey {
    return UserFriendlyKeyMap[keyName];
}

export {
    buildSearchQueryJSON,
    buildSearchQueryString,
    buildUserReadableQueryString,
    getFilterDisplayValue,
    buildQueryStringFromFilterFormValues,
    buildFilterFormValuesFromQuery,
    getPolicyIDFromSearchQuery,
    buildCannedSearchQuery,
    isCannedSearchQuery,
    sanitizeSearchValue,
    getQueryWithUpdatedValues,
    getUserFriendlyKey,
    isDefaultExpensesQuery,
};
