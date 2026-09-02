/** Query builders for the suggested searches and the expense-status matching they rely on. */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {SearchQueryJSON} from '@components/Search/types';

import type {ButtonVariant} from '@styles/utils/types';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, getFilterFromQuery} from './SearchQueryUtils';

type SearchKey = ValueOf<typeof CONST.SEARCH.SEARCH_KEYS> | `${typeof CONST.SEARCH.SAVED_SEARCH_PREFIX}${string}`;

type ExpenseStatusPredicate = (expenseReport?: OnyxTypes.Report, transactionReportID?: string) => boolean;

const expenseStatusActionMapping: Record<string, ExpenseStatusPredicate> = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport, transactionReportID) => !expenseReport && transactionReportID !== CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.DELETED]: (_expenseReport, transactionReportID) => transactionReportID === CONST.REPORT.TRASH_REPORT_ID,
};

function isValidExpenseStatus(status: unknown): status is ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE> {
    return typeof status === 'string' && status in expenseStatusActionMapping;
}

const SEARCH_TYPE_MENU_ICON_NAMES = [
    'Receipt',
    'MoneyBag',
    'CreditCard',
    'MoneyHourglass',
    'CreditCardHourglass',
    'Bank',
    'User',
    'UserEye',
    'Folder',
    'Basket',
    'CalendarSolid',
    'Document',
    'Pencil',
    'ThumbsUp',
    'CheckCircle',
] as const satisfies readonly ExpensifyIconName[];

type SearchTypeMenuItem = {
    key: SearchKey;
    translationPath: TranslationPaths;
    type: SearchDataTypes;
    icon: TupleToUnion<typeof SEARCH_TYPE_MENU_ICON_NAMES>;
    searchQuery: string;
    searchQueryJSON: SearchQueryJSON | undefined;
    hash: number;
    similarSearchHash: number;
    recentSearchHash: number;
    badgeText?: string;
    emptyState?: {
        title: TranslationPaths;
        subtitle: TranslationPaths;
        buttons?: Array<{
            buttonText: TranslationPaths;
            buttonAction: () => void;
            buttonVariant?: ButtonVariant;
            icon?: IconAsset;
            isDisabled?: boolean;
        }>;
    };
};

/**
 * Creates a top search menu item with common structure for TOP_SPENDERS, TOP_CATEGORIES, and TOP_MERCHANTS
 */
function createTopSearchMenuItem(
    key: SearchKey,
    translationPath: TranslationPaths,
    icon: Extract<ExpensifyIconName, 'Receipt' | 'MoneyBag' | 'CreditCard' | 'MoneyHourglass' | 'CreditCardHourglass' | 'Bank' | 'User' | 'Folder' | 'Basket'>,
    groupBy: ValueOf<typeof CONST.SEARCH.GROUP_BY>,
    limit?: number,
    view?: ValueOf<typeof CONST.SEARCH.VIEW>,
): SearchTypeMenuItem {
    const defaultSortBy = CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL;
    const defaultSortOrder = CONST.SEARCH.SORT_ORDER.DESC;

    const searchQuery = buildQueryStringFromFilterFormValues(
        {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            groupBy,
            dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
            ...(view && {view}),
        },
        {
            sortBy: defaultSortBy,
            sortOrder: defaultSortOrder,
            ...(limit && {limit}),
        },
    );

    return {
        key,
        translationPath,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon,
        searchQuery,
        get searchQueryJSON() {
            return buildSearchQueryJSON(this.searchQuery);
        },
        get hash() {
            return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
        },
        get similarSearchHash() {
            return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
        },
        get recentSearchHash() {
            return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
        },
    };
}

/**
 * Returns a list of all possible searches in the LHN, along with their query & hash.
 * *NOTE* When rendering the LHN, you should use the "createTypeMenuSections" method, which
 * contains the conditionals for rendering each of these.
 *
 * Keep all suggested search declarations in this object.
 * If you are updating this function, do not add more params unless absolutely necessary for the searches. The amount of data needed to
 * get the list of searches should be as minimal as possible.
 *
 * These searches should be as static as possible, and should not contain conditionals, or any other logic.
 *
 * If you are trying to access data about a specific search, you do NOT need to subscribe to the data (such as feeds) if it does not
 * affect the specific query you are looking for
 */
function getSuggestedSearches(
    accountID: number = CONST.DEFAULT_NUMBER_ID,
    defaultFeedID?: string,
    shouldShowExpensifyCard?: boolean,
    topSpendersPolicyIDs: string[] = [],
    activeExpensifyCardFeedID?: string,
): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem> {
    // Card accruals (UNAPPROVED_CARD) defaults to the active workspace's Expensify Card when it has one,
    // falling back to the company/bank feed otherwise. Other feed-based searches keep using `defaultFeedID`.
    const unapprovedCardFeedID = activeExpensifyCardFeedID ?? defaultFeedID;
    return {
        [CONST.SEARCH.SEARCH_KEYS.EXPENSES]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            translationPath: 'search.tabs.expenses',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'Receipt',
            searchQuery: buildCannedSearchQuery(),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.REPORTS]: {
            key: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            translationPath: 'search.tabs.reports',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'Document',
            searchQuery: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: {
            key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
            translationPath: 'search.tabs.submit',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'Pencil',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                from: [`${accountID}`],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: {
            key: CONST.SEARCH.SEARCH_KEYS.APPROVE,
            translationPath: 'search.tabs.approve',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'ThumbsUp',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
                to: [`${accountID}`],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.PAY]: {
            key: CONST.SEARCH.SEARCH_KEYS.PAY,
            translationPath: 'search.tabs.pay',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'MoneyBag',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.PAY,
                reimbursable: CONST.SEARCH.BOOLEAN.YES,
                payer: accountID?.toString(),
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPORT,
            translationPath: 'search.tabs.export',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'CheckCircle',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.EXPORT,
                exporter: [`${accountID}`],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.STATEMENTS]: {
            key: CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
            translationPath: 'search.tabs.statements',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'CreditCard',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                feed: defaultFeedID ? [defaultFeedID] : [''],
                groupBy: CONST.SEARCH.GROUP_BY.CARD,
                postedOn: CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT,
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH]: {
            key: CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
            translationPath: 'search.tabs.unapprovedCash',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'MoneyHourglass',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                reimbursable: CONST.SEARCH.BOOLEAN.YES,
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD]: {
            key: CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
            translationPath: 'search.tabs.unapprovedCard',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'CreditCardHourglass',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                feed: unapprovedCardFeedID ? [unapprovedCardFeedID] : [''],
                groupBy: CONST.SEARCH.GROUP_BY.CARD,
                status: [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED, CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: {
            key: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
            translationPath: 'search.tabs.reconciliation',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'Bank',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    withdrawalType: shouldShowExpensifyCard ? CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD : CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT,
                    withdrawnOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                    view: CONST.SEARCH.VIEW.TABLE,
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS]: {
            key: CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS,
            translationPath: 'search.tabs.topSpenders',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'User',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.FROM,
                    dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    // Scope Top Spenders to the eligible workspaces so individual-chat/personal expenses don't leak in.
                    ...(topSpendersPolicyIDs.length > 0 ? {policyID: topSpendersPolicyIDs} : {}),
                    status: [
                        CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
                        CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
                        CONST.SEARCH.STATUS.EXPENSE.APPROVED,
                        CONST.SEARCH.STATUS.EXPENSE.DONE,
                        CONST.SEARCH.STATUS.EXPENSE.PAID,
                    ],
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES]: createTopSearchMenuItem(
            CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
            'search.tabs.topCategories',
            'Folder',
            CONST.SEARCH.GROUP_BY.CATEGORY,
            CONST.SEARCH.TOP_SEARCH_LIMIT,
            CONST.SEARCH.VIEW.BAR,
        ),
        [CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS]: createTopSearchMenuItem(
            CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
            'search.tabs.topMerchants',
            'Basket',
            CONST.SEARCH.GROUP_BY.MERCHANT,
            CONST.SEARCH.TOP_SEARCH_LIMIT,
            CONST.SEARCH.VIEW.PIE,
        ),
        [CONST.SEARCH.SEARCH_KEYS.VIOLATIONS_BY_SUBMITTER]: {
            key: CONST.SEARCH.SEARCH_KEYS.VIOLATIONS_BY_SUBMITTER,
            translationPath: 'search.tabs.violationsBySubmitter',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'UserEye',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.FROM,
                    submittedOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    has: [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION],
                    view: CONST.SEARCH.VIEW.TABLE,
                    limit: String(CONST.SEARCH.TOP_SEARCH_LIMIT),
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME]: {
            key: CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME,
            translationPath: 'search.spendOverTime',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'CalendarSolid',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
                    dateOn: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS,
                    view: CONST.SEARCH.VIEW.LINE,
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
                    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
    };
}

function isEligibleForStatus(currentQueryJSON: SearchQueryJSON | undefined, report: OnyxEntry<OnyxTypes.Report>, transactionItemReportID?: string) {
    const status = getFilterFromQuery(currentQueryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS);
    if (!status.value) {
        return true;
    }

    if (status.isNegated) {
        return Object.keys(expenseStatusActionMapping).some((expenseStatus) => {
            const isExcluded = status.value?.includes(expenseStatus);
            return !isExcluded && expenseStatusActionMapping[expenseStatus](report, transactionItemReportID);
        });
    }

    return status.value.some((expenseStatus) => {
        return isValidExpenseStatus(expenseStatus) ? expenseStatusActionMapping[expenseStatus](report, transactionItemReportID) : false;
    });
}

export {SEARCH_TYPE_MENU_ICON_NAMES, expenseStatusActionMapping, getSuggestedSearches, isEligibleForStatus};
export type {SearchKey, SearchTypeMenuItem};
