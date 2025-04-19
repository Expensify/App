
const __rest =
    (this && this.__rest) ||
    function (s, e) {
        const t = {};
        for (var p in s) {if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) {t[p] = s[p];}}
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            {for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) {t[p[i]] = s[p[i]];}
            }}
        return t;
    };
const __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) {s += arguments[i].length;}
        for (var r = Array(s), k = 0, i = 0; i < il; i++) {for (let a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {r[k] = a[j];}}
        return r;
    };
let _a;
exports.__esModule = true;
exports.isDefaultExpensesQueryWithPolicyIDCheck =
    exports.shouldHighlight =
    exports.isDefaultExpensesQuery =
    exports.getUserFriendlyKey =
    exports.getCurrentSearchQueryJSON =
    exports.getQueryWithUpdatedValues =
    exports.sanitizeSearchValue =
    exports.isCannedSearchQueryWithPolicyIDCheck =
    exports.isCannedSearchQuery =
    exports.buildCannedSearchQuery =
    exports.getPolicyIDFromSearchQuery =
    exports.buildFilterFormValuesFromQuery =
    exports.buildQueryStringFromFilterFormValues =
    exports.getFilterDisplayValue =
    exports.buildUserReadableQueryStringWithPolicyID =
    exports.buildUserReadableQueryString =
    exports.buildSearchQueryString =
    exports.buildSearchQueryJSON =
        void 0;
const cloneDeep_1 = require('lodash/cloneDeep');
const CONST_1 = require('@src/CONST');
const NAVIGATORS_1 = require('@src/NAVIGATORS');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const SCREENS_1 = require('@src/SCREENS');
const SearchAdvancedFiltersForm_1 = require('@src/types/form/SearchAdvancedFiltersForm');
const CardFeedUtils_1 = require('./CardFeedUtils');
const CardUtils_1 = require('./CardUtils');
const CurrencyUtils_1 = require('./CurrencyUtils');
const LocaleCompare_1 = require('./LocaleCompare');
const Log_1 = require('./Log');
const MoneyRequestUtils_1 = require('./MoneyRequestUtils');
const navigationRef_1 = require('./Navigation/navigationRef');
const PersonalDetailsUtils_1 = require('./PersonalDetailsUtils');
const PolicyUtils_1 = require('./PolicyUtils');
const ReportUtils_1 = require('./ReportUtils');
const searchParser_1 = require('./SearchParser/searchParser');
const UserUtils_1 = require('./UserUtils');
const ValidationUtils_1 = require('./ValidationUtils');
// This map contains chars that match each operator
const operatorToCharMap =
    ((_a = {}),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.EQUAL_TO] = ':'),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.LOWER_THAN] = '<'),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO] = '<='),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.GREATER_THAN] = '>'),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO] = '>='),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO] = '!='),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.AND] = ','),
    (_a[CONST_1['default'].SEARCH.SYNTAX_OPERATORS.OR] = ' '),
    _a);
/**
 * A mapping object that maps filter names from the internal codebase format to user-friendly names.
 */
const UserFriendlyKeyMap = {
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
    billable: 'billable',
    reimbursable: 'reimbursable',
};
/**
 * @private
 * Returns string value wrapped in quotes "", if the value contains space or &nbsp; (no-breaking space).
 */
function sanitizeSearchValue(str) {
    if (str.includes(' ') || str.includes('\u00A0')) {
        return `"${  str  }"`;
    }
    return str;
}
exports.sanitizeSearchValue = sanitizeSearchValue;
/**
 * @private
 * Returns date filter value for QueryString.
 */
function buildDateFilterQuery(filterValues, filterKey) {
    const dateBefore = filterValues[`${  filterKey  }${CONST_1['default'].SEARCH.DATE_MODIFIERS.BEFORE}`];
    const dateAfter = filterValues[`${  filterKey  }${CONST_1['default'].SEARCH.DATE_MODIFIERS.AFTER}`];
    let dateFilter = '';
    if (dateBefore) {
        dateFilter += `${filterKey  }<${  dateBefore}`;
    }
    if (dateBefore && dateAfter) {
        dateFilter += ' ';
    }
    if (dateAfter) {
        dateFilter += `${filterKey  }>${  dateAfter}`;
    }
    return dateFilter;
}
/**
 * @private
 * Returns amount filter value for QueryString.
 */
function buildAmountFilterQuery(filterValues) {
    const lessThan = filterValues[SearchAdvancedFiltersForm_1['default'].LESS_THAN];
    const greaterThan = filterValues[SearchAdvancedFiltersForm_1['default'].GREATER_THAN];
    let amountFilter = '';
    if (greaterThan) {
        amountFilter += `${CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.AMOUNT  }>${  greaterThan}`;
    }
    if (lessThan && greaterThan) {
        amountFilter += ' ';
    }
    if (lessThan) {
        amountFilter += `${CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.AMOUNT  }<${  lessThan}`;
    }
    return amountFilter;
}
/**
 * @private
 * Returns string of correctly formatted filter values from QueryFilters object.
 */
function buildFilterValuesString(filterName, queryFilters) {
    const delimiter = filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ? ' ' : ',';
    let filterValueString = '';
    queryFilters.forEach(function (queryFilter, index) {
        let _a; let _b;
        // If the previous queryFilter has the same operator (this rule applies only to eq and neq operators) then append the current value
        if (
            index !== 0 &&
            ((queryFilter.operator === 'eq' &&
                ((_a = queryFilters === null || queryFilters === void 0 ? void 0 : queryFilters.at(index - 1)) === null || _a === void 0 ? void 0 : _a.operator) === 'eq') ||
                (queryFilter.operator === 'neq' && ((_b = queryFilters.at(index - 1)) === null || _b === void 0 ? void 0 : _b.operator) === 'neq'))
        ) {
            filterValueString += `${  delimiter  }${sanitizeSearchValue(queryFilter.value.toString())}`;
        } else if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filterValueString += `${  delimiter  }${sanitizeSearchValue(queryFilter.value.toString())}`;
        } else {
            filterValueString += ` ${  filterName  }${operatorToCharMap[queryFilter.operator]  }${sanitizeSearchValue(queryFilter.value.toString())}`;
        }
    });
    return filterValueString;
}
/**
 * @private
 * Traverses the AST and returns filters as a QueryFilters object.
 */
function getFilters(queryJSON) {
    const filters = [];
    const filterKeys = Object.values(CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS);
    function traverse(node) {
        if (!node.operator) {
            return;
        }
        if (typeof node.left === 'object' && node.left) {
            traverse(node.left);
        }
        if (typeof node.right === 'object' && node.right && !Array.isArray(node.right)) {
            traverse(node.right);
        }
        const nodeKey = node.left;
        if (!filterKeys.includes(nodeKey)) {
            return;
        }
        const filterArray = [];
        if (!Array.isArray(node.right)) {
            filterArray.push({
                operator: node.operator,
                value: node.right,
            });
        } else {
            node.right.forEach(function (element) {
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
function getUpdatedFilterValue(filterName, filterValue) {
    let _a; let _b;
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.FROM || filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TO) {
        if (typeof filterValue === 'string') {
            return (_b = (_a = PersonalDetailsUtils_1.getPersonalDetailByEmail(filterValue)) === null || _a === void 0 ? void 0 : _a.accountID.toString()) !== null && _b !== void 0
                ? _b
                : filterValue;
        }
        return filterValue.map(function (email) {
            let _a; let _b;
            return (_b = (_a = PersonalDetailsUtils_1.getPersonalDetailByEmail(email)) === null || _a === void 0 ? void 0 : _a.accountID.toString()) !== null && _b !== void 0 ? _b : email;
        });
    }
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
        if (typeof filterValue === 'string') {
            const backendAmount = CurrencyUtils_1.convertToBackendAmount(Number(filterValue));
            return Number.isNaN(backendAmount) ? filterValue : backendAmount.toString();
        }
        return filterValue.map(function (amount) {
            const backendAmount = CurrencyUtils_1.convertToBackendAmount(Number(amount));
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
function getQueryHashes(query) {
    let orderedQuery = '';
    orderedQuery += `${CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.TYPE  }:${  query.type}`;
    orderedQuery += ` ${  CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.STATUS  }:${  Array.isArray(query.status) ? query.status.join(',') : query.status}`;
    query.flatFilters
        .map(function (filter) {
            const filters = cloneDeep_1['default'](filter.filters);
            filters.sort(function (a, b) {
                return LocaleCompare_1['default'](a.value.toString(), b.value.toString());
            });
            return buildFilterValuesString(filter.key, filters);
        })
        .sort()
        .forEach(function (filterString) {
            return (orderedQuery += ` ${  filterString}`);
        });
    const recentSearchHash = UserUtils_1.hashText(orderedQuery, 2**32);
    orderedQuery += ` ${  CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.SORT_BY  }:${  query.sortBy}`;
    orderedQuery += ` ${  CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER  }:${  query.sortOrder}`;
    if (query.policyID) {
        orderedQuery += ` ${  CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID  }:${  query.policyID  } `;
    }
    const primaryHash = UserUtils_1.hashText(orderedQuery, 2**32);
    return {primaryHash, recentSearchHash};
}
/**
 * Parses a given search query string into a structured `SearchQueryJSON` format.
 * This format of query is most commonly shared between components and also sent to backend to retrieve search results.
 *
 * In a way this is the reverse of buildSearchQueryString()
 */
function buildSearchQueryJSON(query) {
    try {
        const result = searchParser_1.parse(query);
        const flatFilters = getFilters(result);
        // Add the full input and hash to the results
        result.inputQuery = query;
        result.flatFilters = flatFilters;
        const _a = getQueryHashes(result);
            const primaryHash = _a.primaryHash;
            const recentSearchHash = _a.recentSearchHash;
        result.hash = primaryHash;
        result.recentSearchHash = recentSearchHash;
        return result;
    } catch (e) {
        console.error(`Error when parsing SearchQuery: "${  query  }"`, e);
    }
}
exports.buildSearchQueryJSON = buildSearchQueryJSON;
/**
 * Formats a given `SearchQueryJSON` object into the string version of query.
 * This format of query is the most basic string format and is used as the query param `q` in search URLs.
 *
 * In a way this is the reverse of buildSearchQueryJSON()
 */
function buildSearchQueryString(queryJSON) {
    const queryParts = [];
    const defaultQueryJSON = buildSearchQueryJSON('');
    for (let _i = 0, _a = Object.entries(CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS); _i < _a.length; _i++) {
        const _b = _a[_i];
            const key = _b[1];
        const existingFieldValue = queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON[key];
        const queryFieldValue =
            existingFieldValue !== null && existingFieldValue !== void 0 ? existingFieldValue : defaultQueryJSON === null || defaultQueryJSON === void 0 ? void 0 : defaultQueryJSON[key];
        if (queryFieldValue) {
            if (Array.isArray(queryFieldValue)) {
                queryParts.push(`${key  }:${  queryFieldValue.join(',')}`);
            } else {
                queryParts.push(`${key  }:${  queryFieldValue}`);
            }
        }
    }
    if (queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.policyID) {
        queryParts.push(`${CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID  }:${  queryJSON.policyID}`);
    }
    if (!queryJSON) {
        return queryParts.join(' ');
    }
    const filters = queryJSON.flatFilters;
    for (let _c = 0, filters_1 = filters; _c < filters_1.length; _c++) {
        const filter = filters_1[_c];
        const filterValueString = buildFilterValuesString(filter.key, filter.filters);
        queryParts.push(filterValueString.trim());
    }
    return queryParts.join(' ');
}
exports.buildSearchQueryString = buildSearchQueryString;
/**
 * Formats a given object with search filter values into the string version of the query.
 * Main usage is to consume data format that comes from AdvancedFilters Onyx Form Data, and generate query string.
 *
 * Reverse operation of buildFilterFormValuesFromQuery()
 */
function buildQueryStringFromFilterFormValues(filterValues) {
    // We separate type and status filters from other filters to maintain hashes consistency for saved searches
    const type = filterValues.type;
        const status = filterValues.status;
        const policyID = filterValues.policyID;
        const otherFilters = __rest(filterValues, ['type', 'status', 'policyID']);
    const filtersString = [];
    filtersString.push(`${CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.SORT_BY  }:${  CONST_1['default'].SEARCH.TABLE_COLUMNS.DATE}`);
    filtersString.push(`${CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER  }:${  CONST_1['default'].SEARCH.SORT_ORDER.DESC}`);
    if (type) {
        const sanitizedType = sanitizeSearchValue(type);
        filtersString.push(`${CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.TYPE  }:${  sanitizedType}`);
    }
    if (status) {
        const sanitizedStatus = sanitizeSearchValue(status);
        filtersString.push(`${CONST_1['default'].SEARCH.SYNTAX_ROOT_KEYS.STATUS  }:${  sanitizedStatus}`);
    }
    if (policyID) {
        const sanitizedPolicyID = sanitizeSearchValue(policyID);
        filtersString.push(`${CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID  }:${  sanitizedPolicyID}`);
    }
    const mappedFilters = Object.entries(otherFilters)
        .map(function (_a) {
            const filterKey = _a[0];
                const filterValue = _a[1];
            if (
                (filterKey === SearchAdvancedFiltersForm_1['default'].MERCHANT ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].DESCRIPTION ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].REPORT_ID ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].REIMBURSABLE ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].BILLABLE) &&
                filterValue
            ) {
                var keyInCorrectForm = Object.keys(CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS).find(function (key) {
                    return CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey;
                });
                if (keyInCorrectForm) {
                    return `${CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]  }:${  sanitizeSearchValue(filterValue)}`;
                }
            }
            if (filterKey === SearchAdvancedFiltersForm_1['default'].KEYWORD && filterValue) {
                const value = filterValue.split(' ').map(sanitizeSearchValue).join(' ');
                return `${  value}`;
            }
            if (
                (filterKey === SearchAdvancedFiltersForm_1['default'].CATEGORY ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].CARD_ID ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].TAX_RATE ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].EXPENSE_TYPE ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].TAG ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].CURRENCY ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].FROM ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].TO ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].FEED ||
                    filterKey === SearchAdvancedFiltersForm_1['default'].IN) &&
                Array.isArray(filterValue) &&
                filterValue.length > 0
            ) {
                const filterValueArray = __spreadArrays(new Set(filterValue));
                var keyInCorrectForm = Object.keys(CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS).find(function (key) {
                    return CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey;
                });
                if (keyInCorrectForm) {
                    return `${CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]  }:${  filterValueArray.map(sanitizeSearchValue).join(',')}`;
                }
            }
            return undefined;
        })
        .filter(function (filter) {
            return !!filter;
        });
    filtersString.push.apply(filtersString, mappedFilters);
    SearchAdvancedFiltersForm_1.DATE_FILTER_KEYS.forEach(function (dateKey) {
        const dateFilter = buildDateFilterQuery(filterValues, dateKey);
        filtersString.push(dateFilter);
    });
    const amountFilter = buildAmountFilterQuery(filterValues);
    filtersString.push(amountFilter);
    return filtersString.filter(Boolean).join(' ').trim();
}
exports.buildQueryStringFromFilterFormValues = buildQueryStringFromFilterFormValues;
/**
 * Generates object with search filter values, in a format that can be consumed by SearchAdvancedFiltersForm.
 * Main usage of this is to generate the initial values for AdvancedFilters from existing query.
 *
 * Reverse operation of buildQueryStringFromFilterFormValues()
 */
function buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTags, currencyList, personalDetails, cardList, reports, taxRates) {
    let _a; let _b; let _c; let _d; let _e; let _f; let _g; let _h; let _j; let _k; let _l; let _m;
    const filters = queryJSON.flatFilters;
    const filtersForm = {};
    const policyID = queryJSON.policyID;
    const _loop_1 = function (queryFilter) {
        const filterKey = queryFilter.key;
        const filterList = queryFilter.filters;
        const filterValues = filterList.map(function (item) {
            return item.value.toString();
        });
        if (
            filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
            filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
            filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        ) {
            filtersForm[filterKey] = filterValues.at(0);
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
            const validExpenseTypes_1 = new Set(Object.values(CONST_1['default'].SEARCH.TRANSACTION_TYPE));
            filtersForm[filterKey] = filterValues.filter(function (expenseType) {
                return validExpenseTypes_1.has(expenseType);
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            filtersForm[filterKey] = filterValues.filter(function (card) {
                return cardList[card];
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.FEED) {
            filtersForm[filterKey] = filterValues.filter(function (feed) {
                return feed;
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const allTaxRates_1 = new Set(Object.values(taxRates).flat());
            filtersForm[filterKey] = filterValues.filter(function (tax) {
                return allTaxRates_1.has(tax);
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.IN) {
            filtersForm[filterKey] = filterValues.filter(function (id) {
                let _a;
                return (_a = reports === null || reports === void 0 ? void 0 : reports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${id}`]) === null || _a === void 0 ? void 0 : _a.reportID;
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.FROM || filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TO) {
            filtersForm[filterKey] = filterValues.filter(function (id) {
                return personalDetails && personalDetails[id];
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.CURRENCY) {
            const validCurrency_1 = new Set(Object.keys(currencyList));
            filtersForm[filterKey] = filterValues.filter(function (currency) {
                return validCurrency_1.has(currency);
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TAG) {
            const tags = policyID
                ? PolicyUtils_1.getTagNamesFromTagsLists(
                      (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _a !== void 0
                          ? _a
                          : {},
                  )
                : Object.values(policyTags !== null && policyTags !== void 0 ? policyTags : {})
                      .filter(function (item) {
                          return !!item;
                      })
                      .map(function (tagList) {
                          return PolicyUtils_1.getTagNamesFromTagsLists(tagList !== null && tagList !== void 0 ? tagList : {});
                      })
                      .flat();
            const uniqueTags_1 = new Set(tags);
            uniqueTags_1.add(CONST_1['default'].SEARCH.EMPTY_VALUE);
            filtersForm[filterKey] = filterValues.filter(function (name) {
                return uniqueTags_1.has(name);
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) {
            const categories = policyID
                ? Object.values(
                      (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_CATEGORIES  }${policyID}`]) !==
                          null && _b !== void 0
                          ? _b
                          : {},
                  ).map(function (category) {
                      return category.name;
                  })
                : Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {})
                      .map(function (item) {
                          return Object.values(item !== null && item !== void 0 ? item : {}).map(function (category) {
                              return category.name;
                          });
                      })
                      .flat();
            const uniqueCategories_1 = new Set(categories);
            uniqueCategories_1.add(CONST_1['default'].SEARCH.EMPTY_VALUE);
            filtersForm[filterKey] = filterValues.filter(function (name) {
                return uniqueCategories_1.has(name);
            });
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            filtersForm[filterKey] =
                filterValues === null || filterValues === void 0
                    ? void 0
                    : filterValues
                          .map(function (filter) {
                              if (filter.includes(' ')) {
                                  return `"${  filter  }"`;
                              }
                              return filter;
                          })
                          .join(' ');
        }
        if (SearchAdvancedFiltersForm_1.DATE_FILTER_KEYS.includes(filterKey)) {
            const beforeKey = `${  filterKey  }${CONST_1['default'].SEARCH.DATE_MODIFIERS.BEFORE}`;
            const afterKey = `${  filterKey  }${CONST_1['default'].SEARCH.DATE_MODIFIERS.AFTER}`;
            filtersForm[beforeKey] =
                (_d =
                    (_c = filterList.find(function (filter) {
                        return filter.operator === 'lt' && ValidationUtils_1.isValidDate(filter.value.toString());
                    })) === null || _c === void 0
                        ? void 0
                        : _c.value.toString()) !== null && _d !== void 0
                    ? _d
                    : filtersForm[beforeKey];
            filtersForm[afterKey] =
                (_f =
                    (_e = filterList.find(function (filter) {
                        return filter.operator === 'gt' && ValidationUtils_1.isValidDate(filter.value.toString());
                    })) === null || _e === void 0
                        ? void 0
                        : _e.value.toString()) !== null && _f !== void 0
                    ? _f
                    : filtersForm[afterKey];
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
            // backend amount is an integer and is 2 digits longer than frontend amount
            filtersForm[SearchAdvancedFiltersForm_1['default'].LESS_THAN] =
                (_h =
                    (_g = filterList.find(function (filter) {
                        return filter.operator === 'lt' && MoneyRequestUtils_1.validateAmount(filter.value.toString(), 0, CONST_1['default'].IOU.AMOUNT_MAX_LENGTH + 2);
                    })) === null || _g === void 0
                        ? void 0
                        : _g.value.toString()) !== null && _h !== void 0
                    ? _h
                    : filtersForm[SearchAdvancedFiltersForm_1['default'].LESS_THAN];
            filtersForm[SearchAdvancedFiltersForm_1['default'].GREATER_THAN] =
                (_k =
                    (_j = filterList.find(function (filter) {
                        return filter.operator === 'gt' && MoneyRequestUtils_1.validateAmount(filter.value.toString(), 0, CONST_1['default'].IOU.AMOUNT_MAX_LENGTH + 2);
                    })) === null || _j === void 0
                        ? void 0
                        : _j.value.toString()) !== null && _k !== void 0
                    ? _k
                    : filtersForm[SearchAdvancedFiltersForm_1['default'].GREATER_THAN];
        }
        if (filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.BILLABLE || filterKey === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE) {
            const validBooleanTypes = Object.values(CONST_1['default'].SEARCH.BOOLEAN);
            filtersForm[filterKey] = validBooleanTypes.find(function (value) {
                return filterValues.at(0) === value;
            });
        }
    };
    for (let _i = 0, filters_2 = filters; _i < filters_2.length; _i++) {
        const queryFilter = filters_2[_i];
        _loop_1(queryFilter);
    }
    const _o =
            (_l = Object.entries(CONST_1['default'].SEARCH.DATA_TYPES).find(function (_a) {
                const value = _a[1];
                return value === queryJSON.type;
            })) !== null && _l !== void 0
                ? _l
                : [];
        const _p = _o[0];
        const typeKey = _p === void 0 ? '' : _p;
        const typeValue = _o[1];
    filtersForm[SearchAdvancedFiltersForm_1['default'].TYPE] = typeValue ? queryJSON.type : CONST_1['default'].SEARCH.DATA_TYPES.EXPENSE;
    const statusKey = (
        (_m = Object.entries(CONST_1['default'].SEARCH.STATUS).find(function (_a) {
            const value = _a[1];
            return Array.isArray(queryJSON.status)
                ? queryJSON.status.some(function (status) {
                      return Object.values(value).includes(status);
                  })
                : Object.values(value).includes(queryJSON.status);
        })) !== null && _m !== void 0
            ? _m
            : []
    )[0];
    if (typeKey === statusKey) {
        filtersForm[SearchAdvancedFiltersForm_1['default'].STATUS] = Array.isArray(queryJSON.status) ? queryJSON.status.join(',') : queryJSON.status;
    } else {
        filtersForm[SearchAdvancedFiltersForm_1['default'].STATUS] = CONST_1['default'].SEARCH.STATUS.EXPENSE.ALL;
    }
    if (queryJSON.policyID) {
        filtersForm[SearchAdvancedFiltersForm_1['default'].POLICY_ID] = queryJSON.policyID;
    }
    return filtersForm;
}
exports.buildFilterFormValuesFromQuery = buildFilterFormValuesFromQuery;
/**
 * Given a SearchQueryJSON this function will try to find the value of policyID filter saved in query
 * and return just the first policyID value from the filter.
 *
 * Note: `policyID` property can store multiple policy ids (just like many other search filters) as a comma separated value;
 * however there are several places in the app (related to WorkspaceSwitcher) that will accept only a single policyID.
 */
function getPolicyIDFromSearchQuery(queryJSON) {
    const policyIDFilter = queryJSON.policyID;
    if (!policyIDFilter) {
        return;
    }
    // policyID is a comma-separated value
    const policyID = policyIDFilter.split(',')[0];
    return policyID;
}
exports.getPolicyIDFromSearchQuery = getPolicyIDFromSearchQuery;
/**
 * Returns the human-readable "pretty" string for a specified filter value.
 */
function getFilterDisplayValue(filterName, filterValue, personalDetails, reports, cardList, cardFeedNamesWithType) {
    let _a;
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.FROM || filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TO) {
        // login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return ((_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[filterValue]) === null || _a === void 0 ? void 0 : _a.displayName) || filterValue;
    }
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
        const cardID = parseInt(filterValue, 10);
        if (Number.isNaN(cardID)) {
            return filterValue;
        }
        return CardUtils_1.getCardDescription(cardID, cardList) || filterValue;
    }
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.IN) {
        return ReportUtils_1.getReportName(reports === null || reports === void 0 ? void 0 : reports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${filterValue}`]) || filterValue;
    }
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
        const frontendAmount = CurrencyUtils_1.convertToFrontendAmountAsInteger(Number(filterValue));
        return Number.isNaN(frontendAmount) ? filterValue : frontendAmount.toString();
    }
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TAG) {
        return PolicyUtils_1.getCleanedTagName(filterValue);
    }
    if (filterName === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.FEED) {
        const workspaceFeedKey = CardFeedUtils_1.getWorkspaceCardFeedKey(filterValue);
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
exports.getFilterDisplayValue = getFilterDisplayValue;
/**
 * A copy of `buildUserReadableQueryString` handling the policy ID, used if you have access to the leftHandBar beta.
 * When this beta is no longer needed, this method will be renamed to `buildUserReadableQueryString` and will replace the old method.
 * Formats a given `SearchQueryJSON` object into the human-readable string version of query.
 * This format of query is the one which we want to display to users.
 * We try to replace every numeric id value with a display version of this value,
 * So: user IDs get turned into emails, report ids into report names etc.
 */
function buildUserReadableQueryStringWithPolicyID(queryJSON, PersonalDetails, reports, taxRates, cardList, cardFeedNamesWithType, policies) {
    let _a; let _b;
    const type = queryJSON.type;
        const status = queryJSON.status;
        const groupBy = queryJSON.groupBy;
        const policyID = queryJSON.policyID;
    const filters = queryJSON.flatFilters;
    let title = `type:${  type  } status:${  Array.isArray(status) ? status.join(',') : status}`;
    if (groupBy) {
        title += ` group-by:${  groupBy}`;
    }
    if (policyID) {
        const workspace =
            (_b =
                (_a = policies === null || policies === void 0 ? void 0 : policies[`${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`]) === null || _a === void 0 ? void 0 : _a.name) !==
                null && _b !== void 0
                ? _b
                : policyID;
        title += ` workspace:${  sanitizeSearchValue(workspace)}`;
    }
    const _loop_2 = function (filterObject) {
        const key = filterObject.key;
        const queryFilter = filterObject.filters;
        let displayQueryFilters = [];
        if (key === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const taxRateIDs = queryFilter.map(function (filter) {
                return filter.value.toString();
            });
            const taxRateNames = taxRateIDs
                .map(function (id) {
                    const taxRate = Object.entries(taxRates)
                        .filter(function (_a) {
                            const IDs = _a[1];
                            return IDs.includes(id);
                        })
                        .map(function (_a) {
                            const name = _a[0];
                            return name;
                        });
                    return taxRate.length > 0 ? taxRate : id;
                })
                .flat();
            const uniqueTaxRateNames = __spreadArrays(new Set(taxRateNames));
            displayQueryFilters = uniqueTaxRateNames.map(function (taxRate) {
                let _a; let _b;
                return {
                    operator:
                        (_b = (_a = queryFilter.at(0)) === null || _a === void 0 ? void 0 : _a.operator) !== null && _b !== void 0 ? _b : CONST_1['default'].SEARCH.SYNTAX_OPERATORS.AND,
                    value: taxRate,
                };
            });
        } else {
            displayQueryFilters = queryFilter.map(function (filter) {
                return {
                    operator: filter.operator,
                    value: getFilterDisplayValue(key, filter.value.toString(), PersonalDetails, reports, cardList, cardFeedNamesWithType),
                };
            });
        }
        title += buildFilterValuesString(getUserFriendlyKey(key), displayQueryFilters);
    };
    for (let _i = 0, filters_3 = filters; _i < filters_3.length; _i++) {
        const filterObject = filters_3[_i];
        _loop_2(filterObject);
    }
    return title;
}
exports.buildUserReadableQueryStringWithPolicyID = buildUserReadableQueryStringWithPolicyID;
/**
 * Formats a given `SearchQueryJSON` object into the human-readable string version of query.
 * This format of query is the one which we want to display to users.
 * We try to replace every numeric id value with a display version of this value,
 * So: user IDs get turned into emails, report ids into report names etc.
 */
function buildUserReadableQueryString(queryJSON, PersonalDetails, reports, taxRates, cardList, cardFeedNamesWithType) {
    const type = queryJSON.type;
        const status = queryJSON.status;
        const groupBy = queryJSON.groupBy;
    const filters = queryJSON.flatFilters;
    let title = `type:${  type  } status:${  Array.isArray(status) ? status.join(',') : status}`;
    if (groupBy) {
        title += ` group-by:${  groupBy}`;
    }
    const _loop_3 = function (filterObject) {
        const key = filterObject.key;
        const queryFilter = filterObject.filters;
        let displayQueryFilters = [];
        if (key === CONST_1['default'].SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const taxRateIDs = queryFilter.map(function (filter) {
                return filter.value.toString();
            });
            const taxRateNames = taxRateIDs
                .map(function (id) {
                    const taxRate = Object.entries(taxRates)
                        .filter(function (_a) {
                            const IDs = _a[1];
                            return IDs.includes(id);
                        })
                        .map(function (_a) {
                            const name = _a[0];
                            return name;
                        });
                    return taxRate.length > 0 ? taxRate : id;
                })
                .flat();
            const uniqueTaxRateNames = __spreadArrays(new Set(taxRateNames));
            displayQueryFilters = uniqueTaxRateNames.map(function (taxRate) {
                let _a; let _b;
                return {
                    operator:
                        (_b = (_a = queryFilter.at(0)) === null || _a === void 0 ? void 0 : _a.operator) !== null && _b !== void 0 ? _b : CONST_1['default'].SEARCH.SYNTAX_OPERATORS.AND,
                    value: taxRate,
                };
            });
        } else {
            displayQueryFilters = queryFilter.map(function (filter) {
                return {
                    operator: filter.operator,
                    value: getFilterDisplayValue(key, filter.value.toString(), PersonalDetails, reports, cardList, cardFeedNamesWithType),
                };
            });
        }
        title += buildFilterValuesString(getUserFriendlyKey(key), displayQueryFilters);
    };
    for (let _i = 0, filters_4 = filters; _i < filters_4.length; _i++) {
        const filterObject = filters_4[_i];
        _loop_3(filterObject);
    }
    return title;
}
exports.buildUserReadableQueryString = buildUserReadableQueryString;
/**
 * Returns properly built QueryString for a canned query, with the optional policyID.
 */
function buildCannedSearchQuery(_a) {
    const _b = _a === void 0 ? {} : _a;
        const _c = _b.type;
        const type = _c === void 0 ? CONST_1['default'].SEARCH.DATA_TYPES.EXPENSE : _c;
        const _d = _b.status;
        const status = _d === void 0 ? CONST_1['default'].SEARCH.STATUS.EXPENSE.ALL : _d;
        const policyID = _b.policyID;
        const cardID = _b.cardID;
        const groupBy = _b.groupBy;
    let queryString = `type:${  type  } status:${  Array.isArray(status) ? status.join(',') : status}`;
    if (groupBy) {
        queryString += ` group-by:${  groupBy}`;
    }
    if (policyID) {
        queryString += ` policyID:${  policyID}`;
    }
    if (cardID) {
        queryString += ` expense-type:card card:${  cardID}`;
    }
    // Parse the query to fill all default query fields with values
    const normalizedQueryJSON = buildSearchQueryJSON(queryString);
    return buildSearchQueryString(normalizedQueryJSON);
}
exports.buildCannedSearchQuery = buildCannedSearchQuery;
/**
 * A copy of `isCannedSearchQuery` handling the policy ID, used if you have access to the leftHandBar beta.
 * When this beta is no longer needed, this method will be renamed to `isCannedSearchQuery` and will replace the old method.
 *
 * Returns whether a given search query is a Canned query.
 *
 * Canned queries are simple predefined queries, that are defined only using type and status and no additional filters.
 * In addition, they can contain an optional policyID.
 * For example: "type:trip status:all" is a canned query.
 */
function isCannedSearchQueryWithPolicyIDCheck(queryJSON) {
    return !queryJSON.filters && !queryJSON.policyID;
}
exports.isCannedSearchQueryWithPolicyIDCheck = isCannedSearchQueryWithPolicyIDCheck;
/**
 * Returns whether a given search query is a Canned query.
 *
 * Canned queries are simple predefined queries, that are defined only using type and status and no additional filters.
 * In addition, they can contain an optional policyID.
 * For example: "type:trip status:all" is a canned query.
 */
function isCannedSearchQuery(queryJSON) {
    return !queryJSON.filters;
}
exports.isCannedSearchQuery = isCannedSearchQuery;
/**
 * A copy of `isDefaultExpensesQuery` handling the policy ID, used if you have access to the leftHandBar beta.
 * When this beta is no longer needed, this method will be renamed to `isDefaultExpensesQuery` and will replace the old method.
 */
function isDefaultExpensesQueryWithPolicyIDCheck(queryJSON) {
    return (
        queryJSON.type === CONST_1['default'].SEARCH.DATA_TYPES.EXPENSE &&
        queryJSON.status === CONST_1['default'].SEARCH.STATUS.EXPENSE.ALL &&
        !queryJSON.filters &&
        !queryJSON.groupBy &&
        !queryJSON.policyID
    );
}
exports.isDefaultExpensesQueryWithPolicyIDCheck = isDefaultExpensesQueryWithPolicyIDCheck;
function isDefaultExpensesQuery(queryJSON) {
    return queryJSON.type === CONST_1['default'].SEARCH.DATA_TYPES.EXPENSE && queryJSON.status === CONST_1['default'].SEARCH.STATUS.EXPENSE.ALL && !queryJSON.filters && !queryJSON.groupBy;
}
exports.isDefaultExpensesQuery = isDefaultExpensesQuery;
/**
 *  Given a search query, this function will standardize the query by replacing display values with their corresponding IDs.
 */
function traverseAndUpdatedQuery(queryJSON, computeNodeValue) {
    const standardQuery = cloneDeep_1['default'](queryJSON);
    const filters = standardQuery.filters;
    const traverse = function (node) {
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
function getQueryWithUpdatedValues(query, policyID) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        Log_1['default'].alert(`${CONST_1['default'].ERROR.ENSURE_BUGBOT  } user query failed to parse`, {}, false);
        return;
    }
    if (policyID) {
        queryJSON.policyID = policyID;
    }
    const standardizedQuery = traverseAndUpdatedQuery(queryJSON, getUpdatedFilterValue);
    return buildSearchQueryString(standardizedQuery);
}
exports.getQueryWithUpdatedValues = getQueryWithUpdatedValues;
function getCurrentSearchQueryJSON() {
    let _a; let _b;
    const rootState = navigationRef_1['default'].getRootState();
    const lastPolicyRoute =
        (_a = rootState === null || rootState === void 0 ? void 0 : rootState.routes) === null || _a === void 0
            ? void 0
            : _a.findLast(function (route) {
                  return route.name === NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR || route.name === NAVIGATORS_1['default'].SEARCH_FULLSCREEN_NAVIGATOR;
              });
    if (!lastPolicyRoute) {
        return;
    }
    const lastSearchRoute =
        (_b = lastPolicyRoute.state) === null || _b === void 0
            ? void 0
            : _b.routes.findLast(function (route) {
                  return route.name === SCREENS_1['default'].SEARCH.ROOT;
              });
    if (!lastSearchRoute || !lastSearchRoute.params) {
        return;
    }
    const searchParams = lastSearchRoute.params.q;
    const queryJSON = buildSearchQueryJSON(searchParams);
    if (!queryJSON) {
        return;
    }
    return queryJSON;
}
exports.getCurrentSearchQueryJSON = getCurrentSearchQueryJSON;
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
function getUserFriendlyKey(keyName) {
    return UserFriendlyKeyMap[keyName];
}
exports.getUserFriendlyKey = getUserFriendlyKey;
function shouldHighlight(referenceText, searchText) {
    if (!referenceText || !searchText) {
        return false;
    }
    const escapedText = searchText
        .toLowerCase()
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|\\s)${  escapedText  }(?=\\s|$)`, 'i');
    return pattern.test(referenceText.toLowerCase());
}
exports.shouldHighlight = shouldHighlight;
