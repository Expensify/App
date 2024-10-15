import cloneDeep from 'lodash/cloneDeep';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {ASTNode, QueryFilter, QueryFilters, SearchQueryJSON, SearchQueryString, SearchStatus} from '@components/Search/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {validateAmount} from './MoneyRequestUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import {getTagNamesFromTagsLists} from './PolicyUtils';
import * as ReportUtils from './ReportUtils';
import * as searchParser from './SearchParser/searchParser';
import * as UserUtils from './UserUtils';
import * as ValidationUtils from './ValidationUtils';

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
 * @private
 * returns Date filter query string part, which needs special logic
 */
function buildDateFilterQuery(filterValues: Partial<SearchAdvancedFiltersForm>) {
    const dateBefore = filterValues[FILTER_KEYS.DATE_BEFORE];
    const dateAfter = filterValues[FILTER_KEYS.DATE_AFTER];

    let dateFilter = '';
    if (dateBefore) {
        dateFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}<${dateBefore}`;
    }
    if (dateBefore && dateAfter) {
        dateFilter += ' ';
    }
    if (dateAfter) {
        dateFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}>${dateAfter}`;
    }

    return dateFilter;
}

/**
 * @private
 * returns Date filter query string part, which needs special logic
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

function sanitizeString(str: string) {
    const regexp = /[^A-Za-z0-9_@./#&+\-\\';,"]/g;
    if (regexp.test(str)) {
        return `"${str}"`;
    }
    return str;
}

/**
 * @private
 * traverses the AST and returns filters as a QueryFilters object
 */
function getFilters(queryJSON: SearchQueryJSON) {
    const filters = {} as QueryFilters;
    const filterKeys = Object.values(CONST.SEARCH.SYNTAX_FILTER_KEYS);

    function traverse(node: ASTNode) {
        if (!node.operator) {
            return;
        }

        if (typeof node?.left === 'object' && node.left) {
            traverse(node.left);
        }

        if (typeof node?.right === 'object' && node.right && !Array.isArray(node.right)) {
            traverse(node.right);
        }

        const nodeKey = node.left as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>;
        if (!filterKeys.includes(nodeKey)) {
            return;
        }

        if (!filters[nodeKey]) {
            filters[nodeKey] = [];
        }

        // the "?? []" is added only for typescript because otherwise TS throws an error, in newer TS versions this should be fixed
        const filterArray = filters[nodeKey] ?? [];
        if (!Array.isArray(node.right)) {
            filterArray.push({
                operator: node.operator,
                value: node.right as string | number,
            });
        } else {
            node.right.forEach((element) => {
                filterArray.push({
                    operator: node.operator,
                    value: element as string | number,
                });
            });
        }
    }

    if (queryJSON.filters) {
        traverse(queryJSON.filters);
    }

    return filters;
}

function buildSearchQueryJSON(query: SearchQueryString) {
    try {
        const result = searchParser.parse(query) as SearchQueryJSON;
        const flatFilters = getFilters(result);

        // Add the full input and hash to the results
        const queryHash = UserUtils.hashText(query, 2 ** 32);

        result.hash = queryHash;
        result.inputQuery = query;
        result.flatFilters = flatFilters;

        return result;
    } catch (e) {
        console.error(`Error when parsing SearchQuery: "${query}"`, e);
    }
}

function buildSearchQueryString(queryJSON?: SearchQueryJSON) {
    const queryParts: string[] = [];
    const defaultQueryJSON = buildSearchQueryJSON('');

    for (const [, key] of Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS)) {
        const existingFieldValue = queryJSON?.[key];
        const queryFieldValue = existingFieldValue ?? defaultQueryJSON?.[key];

        if (queryFieldValue) {
            queryParts.push(`${key}:${queryFieldValue}`);
        }
    }

    if (!queryJSON) {
        return queryParts.join(' ');
    }

    const filters = queryJSON.flatFilters;

    for (const [, filterKey] of Object.entries(CONST.SEARCH.SYNTAX_FILTER_KEYS)) {
        const queryFilter = filters[filterKey];

        if (queryFilter) {
            const filterValueString = buildFilterString(filterKey, queryFilter);
            queryParts.push(filterValueString);
        }
    }

    return queryParts.join(' ');
}

/**
 * Given object with chosen search filters builds correct query string from them
 */
function buildQueryStringFromFilterFormValues(filterValues: Partial<SearchAdvancedFiltersForm>) {
    // We separate type and status filters from other filters to maintain hashes consistency for saved searches
    const {type, status, policyID, ...otherFilters} = filterValues;
    const filtersString: string[] = [];

    if (type) {
        const sanitizedType = sanitizeString(type);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${sanitizedType}`);
    }

    if (status) {
        const sanitizedStatus = sanitizeString(status);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${sanitizedStatus}`);
    }

    if (policyID) {
        const sanitizedPolicyID = sanitizeString(policyID);
        filtersString.push(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${sanitizedPolicyID}`);
    }

    const mappedFilters = Object.entries(otherFilters)
        .map(([filterKey, filterValue]) => {
            if ((filterKey === FILTER_KEYS.MERCHANT || filterKey === FILTER_KEYS.DESCRIPTION || filterKey === FILTER_KEYS.REPORT_ID) && filterValue) {
                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
                if (keyInCorrectForm) {
                    return `${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${sanitizeString(filterValue as string)}`;
                }
            }

            if (filterKey === FILTER_KEYS.KEYWORD && filterValue) {
                const value = (filterValue as string).split(' ').map(sanitizeString).join(' ');
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
                    filterKey === FILTER_KEYS.IN) &&
                Array.isArray(filterValue) &&
                filterValue.length > 0
            ) {
                const filterValueArray = [...new Set<string>(filterValue)];
                const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as FilterKeys[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
                if (keyInCorrectForm) {
                    return `${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${filterValueArray.map(sanitizeString).join(',')}`;
                }
            }

            return undefined;
        })
        .filter((filter): filter is string => !!filter);

    filtersString.push(...mappedFilters);

    const dateFilter = buildDateFilterQuery(filterValues);
    filtersString.push(dateFilter);

    const amountFilter = buildAmountFilterQuery(filterValues);
    filtersString.push(amountFilter);

    return filtersString.join(' ').trim();
}

/**
 * returns the values of the filters in a format that can be used in the SearchAdvancedFiltersForm as initial form values
 */
function buildFilterFormValuesFromQuery(
    queryJSON: SearchQueryJSON,
    policyCategories: OnyxCollection<OnyxTypes.PolicyCategories>,
    policyTags: OnyxCollection<OnyxTypes.PolicyTagLists>,
    currencyList: OnyxTypes.CurrencyList,
    personalDetails: OnyxTypes.PersonalDetailsList,
    cardList: OnyxTypes.CardList,
    reports: OnyxCollection<OnyxTypes.Report>,
    taxRates: Record<string, string[]>,
) {
    const filters = queryJSON.flatFilters;
    const filterKeys = Object.keys(filters);
    const filtersForm = {} as Partial<SearchAdvancedFiltersForm>;
    const policyID = queryJSON.policyID;
    for (const filterKey of filterKeys) {
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION) {
            filtersForm[filterKey] = filters[filterKey]?.[0]?.value.toString();
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
            filtersForm[filterKey] = filters[filterKey]
                ?.map((expenseType) => expenseType.value.toString())
                .filter((expenseType) => Object.values(CONST.SEARCH.TRANSACTION_TYPE).includes(expenseType as ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            filtersForm[filterKey] = filters[filterKey]?.map((card) => card.value.toString()).filter((card) => Object.keys(cardList).includes(card));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            filtersForm[filterKey] = filters[filterKey]?.map((tax) => tax.value.toString()).filter((tax) => [...Object.values(taxRates)].flat().includes(tax));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
            filtersForm[filterKey] = filters[filterKey]?.map((report) => report.value.toString()).filter((id) => reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`]);
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
            filtersForm[filterKey] = filters[filterKey]?.map((id) => id.value.toString()).filter((id) => Object.keys(personalDetails).includes(id));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY) {
            filtersForm[filterKey] = filters[filterKey]?.filter((currency) => Object.keys(currencyList).includes(currency.value.toString())).map((currency) => currency.value.toString());
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) {
            const tags = policyID
                ? getTagNamesFromTagsLists(policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})
                : Object.values(policyTags ?? {})
                      .filter((item) => !!item)
                      .map((tagList) => getTagNamesFromTagsLists(tagList ?? {}))
                      .flat();
            filtersForm[filterKey] = filters[filterKey]?.map((tag) => tag.value.toString()).filter((name) => tags.includes(name));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) {
            const categories = policyID
                ? Object.values(policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {}).map((category) => category.name)
                : Object.values(policyCategories ?? {})
                      .map((xd) => Object.values(xd ?? {}).map((category) => category.name))
                      .flat();
            filtersForm[filterKey] = filters[filterKey]?.map((category) => category.value.toString()).filter((name) => categories.includes(name));
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filtersForm[filterKey] = filters[filterKey]
                ?.map((filter) => filter.value.toString())
                .map((filter) => {
                    if (filter.includes(' ')) {
                        return `"${filter}"`;
                    }
                    return filter;
                })
                .join(' ');
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE) {
            filtersForm[FILTER_KEYS.DATE_BEFORE] = filters[filterKey]?.find((filter) => filter.operator === 'lt' && ValidationUtils.isValidDate(filter.value.toString()))?.value.toString();
            filtersForm[FILTER_KEYS.DATE_AFTER] = filters[filterKey]?.find((filter) => filter.operator === 'gt' && ValidationUtils.isValidDate(filter.value.toString()))?.value.toString();
        }
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
            filtersForm[FILTER_KEYS.LESS_THAN] = filters[filterKey]?.find((filter) => filter.operator === 'lt' && validateAmount(filter.value.toString(), 2))?.value.toString();
            filtersForm[FILTER_KEYS.GREATER_THAN] = filters[filterKey]?.find((filter) => filter.operator === 'gt' && validateAmount(filter.value.toString(), 2))?.value.toString();
        }
    }

    const [typeKey = '', typeValue] = Object.entries(CONST.SEARCH.DATA_TYPES).find(([, value]) => value === queryJSON.type) ?? [];
    filtersForm[FILTER_KEYS.TYPE] = typeValue ? queryJSON.type : CONST.SEARCH.DATA_TYPES.EXPENSE;
    const [statusKey] = Object.entries(CONST.SEARCH.STATUS).find(([, value]) => Object.values(value).includes(queryJSON.status)) ?? [];
    filtersForm[FILTER_KEYS.STATUS] = typeKey === statusKey ? queryJSON.status : CONST.SEARCH.STATUS.EXPENSE.ALL;

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

function getDisplayValue(filterName: string, filter: string, personalDetails: OnyxTypes.PersonalDetailsList, cardList: OnyxTypes.CardList, reports: OnyxCollection<OnyxTypes.Report>) {
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
        // login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return personalDetails?.[filter]?.login || filter;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        return cardList[filter]?.bank || filter;
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
        return ReportUtils.getReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${filter}`]) || filter;
    }
    return filter;
}

function buildFilterString(filterName: string, queryFilters: QueryFilter[]) {
    const delimiter = filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ? ' ' : ',';
    let filterValueString = '';
    queryFilters.forEach((queryFilter, index) => {
        // If the previous queryFilter has the same operator (this rule applies only to eq and neq operators) then append the current value
        if (
            index !== 0 &&
            ((queryFilter.operator === 'eq' && queryFilters?.at(index - 1)?.operator === 'eq') || (queryFilter.operator === 'neq' && queryFilters.at(index - 1)?.operator === 'neq'))
        ) {
            filterValueString += `${delimiter}${sanitizeString(queryFilter.value.toString())}`;
        } else if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filterValueString += `${delimiter}${sanitizeString(queryFilter.value.toString())}`;
        } else {
            filterValueString += ` ${filterName}${operatorToCharMap[queryFilter.operator]}${sanitizeString(queryFilter.value.toString())}`;
        }
    });

    return filterValueString;
}

function getSearchHeaderTitle(
    queryJSON: SearchQueryJSON,
    PersonalDetails: OnyxTypes.PersonalDetailsList,
    cardList: OnyxTypes.CardList,
    reports: OnyxCollection<OnyxTypes.Report>,
    TaxRates: Record<string, string[]>,
) {
    const {type, status} = queryJSON;
    const filters = queryJSON.flatFilters ?? {};

    let title = `type:${type} status:${status}`;

    Object.keys(filters).forEach((key) => {
        const queryFilter = filters[key as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>] ?? [];
        let displayQueryFilters: QueryFilter[] = [];
        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const taxRateIDs = queryFilter.map((filter) => filter.value.toString());
            const taxRateNames = taxRateIDs
                .map((id) => {
                    const taxRate = Object.entries(TaxRates)
                        .filter(([, IDs]) => IDs.includes(id))
                        .map(([name]) => name);
                    return taxRate?.length > 0 ? taxRate : id;
                })
                .flat();

            displayQueryFilters = taxRateNames.map((taxRate) => ({
                operator: queryFilter.at(0)?.operator ?? CONST.SEARCH.SYNTAX_OPERATORS.AND,
                value: taxRate,
            }));
        } else {
            displayQueryFilters = queryFilter.map((filter) => ({
                operator: filter.operator,
                value: getDisplayValue(key, filter.value.toString(), PersonalDetails, cardList, reports),
            }));
        }
        title += buildFilterString(key, displayQueryFilters);
    });

    return title;
}

function buildCannedSearchQuery({
    type = CONST.SEARCH.DATA_TYPES.EXPENSE,
    status = CONST.SEARCH.STATUS.EXPENSE.ALL,
    policyID,
}: {
    type?: SearchDataTypes;
    status?: SearchStatus;
    policyID?: string;
} = {}): SearchQueryString {
    const queryString = policyID ? `type:${type} status:${status} policyID:${policyID}` : `type:${type} status:${status}`;

    // Parse the query to fill all default query fields with values
    const normalizedQueryJSON = buildSearchQueryJSON(queryString);
    return buildSearchQueryString(normalizedQueryJSON);
}

/**
 * @private
 * Given a filter name and its value, this function will try to find the corresponding ID.
 */
function findIDFromDisplayValue(filterName: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>, filter: string | string[], cardList: OnyxTypes.CardList, taxRates: Record<string, string[]>) {
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
        if (typeof filter === 'string') {
            const email = filter;
            return PersonalDetailsUtils.getPersonalDetailByEmail(email)?.accountID.toString() ?? filter;
        }
        const emails = filter;
        return emails.map((email) => PersonalDetailsUtils.getPersonalDetailByEmail(email)?.accountID.toString() ?? email);
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
        const names = Array.isArray(filter) ? filter : ([filter] as string[]);
        return names.map((name) => taxRates[name] ?? name).flat();
    }
    if (filterName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        if (typeof filter === 'string') {
            const bank = filter;
            const ids =
                Object.values(cardList)
                    .filter((card) => card.bank === bank)
                    .map((card) => card.cardID.toString()) ?? filter;
            return ids.length > 0 ? ids : bank;
        }
        const banks = filter;
        return banks
            .map(
                (bank) =>
                    Object.values(cardList)
                        .filter((card) => card.bank === bank)
                        .map((card) => card.cardID.toString()) ?? bank,
            )
            .flat();
    }
    return filter;
}

/**
 *  Given a search query, this function will standardize the query by replacing display values with their corresponding IDs.
 */
function standardizeQueryJSON(queryJSON: SearchQueryJSON, cardList: OnyxTypes.CardList, taxRates: Record<string, string[]>) {
    const standardQuery = cloneDeep(queryJSON);
    const filters = standardQuery.filters;
    const traverse = (node: ASTNode) => {
        if (!node.operator) {
            return;
        }
        if (typeof node.left === 'object' && node.left) {
            traverse(node.left);
        }
        if (typeof node.right === 'object' && node.right && !Array.isArray(node.right)) {
            traverse(node.right);
        }

        if (typeof node.left !== 'object') {
            // eslint-disable-next-line no-param-reassign
            node.right = findIDFromDisplayValue(node.left, node.right as string | string[], cardList, taxRates);
        }
    };

    if (filters) {
        traverse(filters);
    }

    standardQuery.flatFilters = getFilters(standardQuery);
    return standardQuery;
}

/**
 * Returns whether a given search query is a Canned query.
 *
 * Canned queries are simple predefined queries, that are defined only using type and status and no additional filters.
 * For example: "type:trip status:all" is a canned query.
 */
function isCannedSearchQuery(queryJSON: SearchQueryJSON) {
    return !queryJSON.filters;
}

function getContextualSuggestionQuery(reportID: string) {
    return `type:chat in:${reportID}`;
}

export {
    buildSearchQueryJSON,
    buildSearchQueryString,
    buildQueryStringFromFilterFormValues,
    buildFilterFormValuesFromQuery,
    getPolicyIDFromSearchQuery,
    getSearchHeaderTitle,
    buildCannedSearchQuery,
    isCannedSearchQuery,
    standardizeQueryJSON,
    getContextualSuggestionQuery,
};
