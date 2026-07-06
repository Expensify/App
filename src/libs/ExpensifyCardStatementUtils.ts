import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';
import type {SearchResultDataType, SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

import type EnvironmentType from './Environment/getEnvironment/types';

import addEncryptedAuthTokenToURL from './addEncryptedAuthTokenToURL';
import {getOldDotURLFromEnvironment} from './Environment/Environment';
import fileDownload from './fileDownload';
import {buildSecureDownloadURL} from './UrlUtils';

type ExpensifyCardStatementFeed = {
    /** Set only when the search is filtered to one workspace, which scopes the statement to it. */
    policyID?: string;
    feedCountry?: string;
    /** The feed these settlements belong to. */
    fundID?: number;
    entryIDs: number[];
};

type ExpensifyCardStatementSelection = {
    feeds: ExpensifyCardStatementFeed[];
    hasMultipleFeeds: boolean;
};

type ExpensifyCardStatementParams = {
    /** Set to scope the statement to one workspace; omitted to export the whole settlement. */
    policyID?: string;
    feedCountry?: string;
    entryIDs: number[];
    /** Set from the server response after GetExpensifyCardStatementPDF returns. */
    statementKey?: string;
};

function isExpensifyCardStatementSearch(queryJSON: SearchQueryJSON | undefined): boolean {
    if (!queryJSON) {
        return false;
    }

    if (queryJSON.type !== CONST.SEARCH.DATA_TYPES.EXPENSE) {
        return false;
    }

    if (queryJSON.groupBy !== CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID) {
        return false;
    }

    // The statement only covers Expensify Card settlements, so require the withdrawal-type filter to be exactly
    // `withdrawal-type:expensify-card`. A negated filter (neq) or one that also includes other types (e.g.
    // reimbursement) can show non-card withdrawal groups, which must not be exportable as a card statement.
    const withdrawalTypeFilter = queryJSON.flatFilters?.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE);
    return (
        withdrawalTypeFilter?.filters?.length === 1 &&
        withdrawalTypeFilter.filters.at(0)?.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO &&
        withdrawalTypeFilter.filters.at(0)?.value === CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD
    );
}

// Filters that define WHICH statement to generate (the settlements and the workspace), not what is shown inside a
// settlement. The PDF is the whole settlement scoped to the workspace, so any other (transaction-narrowing) filter
// would make the on-screen rows disagree with the PDF - in that case we hide the export instead.
const STATEMENT_SCOPE_FILTER_KEYS = new Set<string>([
    CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED,
]);

// Returns the single workspace the search is filtered to, or undefined. We scope the statement to a workspace only
// when the user filtered by one, so the PDF matches the on-screen rows; otherwise the whole settlement is exported.
// policyID is a root-level search key (like type/groupBy), so it lives on queryJSON.policyID, not in flatFilters.
function getScopedPolicyID(queryJSON: SearchQueryJSON | undefined): string | undefined {
    const policyID = queryJSON?.policyID;
    if (typeof policyID === 'string') {
        return policyID;
    }
    return policyID?.length === 1 ? policyID.at(0) : undefined;
}

// True when the search is filtered to more than one workspace. The statement can scope to one workspace or the whole
// settlement, but not to an arbitrary subset, so a multi-workspace filter (e.g. policyID:A,B) cannot be honored - the
// on-screen rows would be A/B while an unscoped export would include every workspace in the settlement.
function hasMultipleScopedPolicies(queryJSON: SearchQueryJSON | undefined): boolean {
    return Array.isArray(queryJSON?.policyID) && queryJSON.policyID.length > 1;
}

function hasOnlyStatementScopeFilters(queryJSON: SearchQueryJSON | undefined): boolean {
    if (!queryJSON) {
        return true;
    }

    // Expense status (e.g. unreported, drafts) lives on `status`, not in flatFilters. Anything other than the
    // single "all" status narrows which expenses are shown, so the rows would no longer be the whole settlement.
    if (queryJSON.status !== CONST.SEARCH.STATUS.EXPENSE.ALL) {
        return false;
    }

    return queryJSON.flatFilters?.every((filter) => STATEMENT_SCOPE_FILTER_KEYS.has(filter.key)) ?? true;
}

// A group key in SearchResultDataType maps to a union of group shapes (members, cards, withdrawals, etc.).
// entryID is unique to SearchWithdrawalIDGroup, so it identifies a settlement group without a cast.
function isWithdrawalIDGroup(value: SearchResultDataType[keyof SearchResultDataType]): value is SearchWithdrawalIDGroup {
    return typeof value === 'object' && value !== null && 'entryID' in value && typeof value.entryID === 'number';
}

function getSelectedSettlementGroups(selectedTransactions: SelectedTransactions, searchData: SearchResultDataType | undefined): SearchWithdrawalIDGroup[] {
    if (!searchData) {
        return [];
    }

    // The statement exports the whole settlement, so only offer it when the whole settlement is selected - never
    // when the user selected a single transaction inside it. A settlement is selected in one of two ways:
    //   1. Its row is collapsed and selected directly, so its group key is stored in selectedTransactions.
    //   2. Its row is expanded and every transaction is selected; each transaction is tagged with the group key.
    // Case 2 tags each selected child with the group key, and a single selected child carries the same tag, so we
    // must count the selected children and require all of them (group count) rather than treat one as the whole.
    const directlySelectedGroupKeys = new Set<string>();
    const selectedCountByGroupKey = new Map<string, number>();
    for (const [key, selection] of Object.entries(selectedTransactions)) {
        if (!selection?.isSelected) {
            continue;
        }
        if (key.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            directlySelectedGroupKeys.add(key);
        }
        if (selection.groupKey?.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            selectedCountByGroupKey.set(selection.groupKey, (selectedCountByGroupKey.get(selection.groupKey) ?? 0) + 1);
        }
    }

    const settlementGroups: SearchWithdrawalIDGroup[] = [];
    for (const [key, value] of Object.entries(searchData)) {
        if (!isWithdrawalIDGroup(value)) {
            continue;
        }
        const isWholeSettlementSelected = directlySelectedGroupKeys.has(key) || (selectedCountByGroupKey.get(key) ?? 0) >= value.count;
        if (!isWholeSettlementSelected) {
            continue;
        }
        settlementGroups.push(value);
    }

    return settlementGroups;
}

function getExpensifyCardStatementSelection(
    queryJSON: SearchQueryJSON | undefined,
    selectedTransactions: SelectedTransactions | undefined,
    searchData: SearchResultDataType | undefined,
): ExpensifyCardStatementSelection | undefined {
    if (!isExpensifyCardStatementSearch(queryJSON) || !selectedTransactions) {
        return undefined;
    }

    // A transaction-narrowing filter (merchant, category, amount, etc.) would make the PDF disagree with the
    // on-screen rows, so the export is only offered for the unfiltered settlement view (workspace scope aside).
    if (!hasOnlyStatementScopeFilters(queryJSON)) {
        return undefined;
    }

    // A multi-workspace filter cannot be scoped to a statement and must not silently fall back to an unscoped export
    // (which would include workspaces outside the filter), so hide the action entirely.
    if (hasMultipleScopedPolicies(queryJSON)) {
        return undefined;
    }

    const selectedSettlementGroups = getSelectedSettlementGroups(selectedTransactions, searchData);
    if (selectedSettlementGroups.length === 0) {
        return undefined;
    }

    const scopedPolicyID = getScopedPolicyID(queryJSON);

    // A statement covers one feed, so group the selected settlements by feed and reject a selection that spans more
    // than one. The feed is identified by fundID, not feedCountry: one program can have several feeds.
    const feedsByKey = new Map<string, ExpensifyCardStatementFeed>();
    for (const settlementGroup of selectedSettlementGroups) {
        const feedKey = settlementGroup.fundID !== undefined ? String(settlementGroup.fundID) : '';
        const existingFeed = feedsByKey.get(feedKey);
        if (existingFeed) {
            existingFeed.entryIDs.push(settlementGroup.entryID);
            continue;
        }

        feedsByKey.set(feedKey, {
            policyID: scopedPolicyID,
            feedCountry: settlementGroup.feedCountry,
            fundID: settlementGroup.fundID,
            entryIDs: [settlementGroup.entryID],
        });
    }

    const feeds = Array.from(feedsByKey.values());
    if (feeds.length === 0) {
        return undefined;
    }

    return {
        feeds,
        hasMultipleFeeds: feeds.length > 1,
    };
}

function getExpensifyCardStatementParamsFromFeed(feed: ExpensifyCardStatementFeed): ExpensifyCardStatementParams {
    const entryIDs = [...feed.entryIDs];

    // fundID is only a client-side grouping key; the export itself is identified by entryIDs, so it is not forwarded.
    return {
        policyID: feed.policyID,
        feedCountry: feed.feedCountry,
        entryIDs,
    };
}

function downloadExpensifyCardStatementPDF(
    translate: LocalizedTranslate,
    fileName: string,
    statementKey: string,
    currentUserEmail: string,
    encryptedAuthToken: string,
    environment: EnvironmentType,
): void {
    const downloadFileName = `Expensify_Card_Statement_${statementKey}.pdf`;
    const pdfURL = buildSecureDownloadURL({
        baseURL: getOldDotURLFromEnvironment(environment),
        secureType: CONST.SECURE_DOWNLOAD_TYPE.PDF_REPORT,
        fileName,
        downloadName: downloadFileName,
        email: currentUserEmail,
    });
    fileDownload(translate, addEncryptedAuthTokenToURL(pdfURL, encryptedAuthToken, true), downloadFileName, '');
}

export type {ExpensifyCardStatementParams};
export {downloadExpensifyCardStatementPDF, getExpensifyCardStatementParamsFromFeed, getExpensifyCardStatementSelection, isExpensifyCardStatementSearch};
