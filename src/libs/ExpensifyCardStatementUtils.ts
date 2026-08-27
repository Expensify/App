import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';
import type {SearchResultDataType, SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

import type EnvironmentType from './Environment/getEnvironment/types';

import addEncryptedAuthTokenToURL from './addEncryptedAuthTokenToURL';
import {getOldDotURLFromEnvironment} from './Environment/Environment';
import fileDownload from './fileDownload';
import {getFilterFromQuery} from './SearchQueryUtils';
import {buildSecureDownloadURL} from './UrlUtils';

type ExpensifyCardStatementFeed = {
    /** Set only when the search is filtered to one workspace, which scopes the statement to it. */
    policyID?: string;
    feedCountry?: string;
    /** The feed these settlements belong to. */
    fundID?: number;
    entryIDs: number[];
    /** Whether the user may export every selected settlement in this feed (backend canExportStatement, AND-ed across them). */
    canExportStatement: boolean;
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
    CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED,
    // A settlement debits one bank account, so filtering by it picks whole settlements (like feed), never rows inside
    // one. Card programs each settle to their own account, so this is how a single program is isolated.
    CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT,
]);

// Returns the single workspace the search is filtered to, or undefined. We scope the statement to a workspace only
// when the user filtered by one (a single, non-negated policyID), so the PDF matches the on-screen rows; otherwise the
// whole settlement is exported.
function getScopedPolicyID(queryJSON: SearchQueryJSON | undefined): string | undefined {
    const policyIDFilter = getFilterFromQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID);
    return policyIDFilter.value?.length === 1 && !policyIDFilter.isNegated ? policyIDFilter.value.at(0) : undefined;
}

// True when a workspace filter cannot be honored as a statement scope: more than one workspace (policyID:A,B) or a
// negated one (-policyID:A). A statement scopes to a single workspace or the whole settlement, never a subset, so
// either case would make the export disagree with the on-screen rows; hide the action instead.
function hasUnsupportedWorkspaceFilter(queryJSON: SearchQueryJSON | undefined): boolean {
    const policyIDFilter = getFilterFromQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID);
    return (policyIDFilter.value?.length ?? 0) > 1 || (policyIDFilter.isNegated && (policyIDFilter.value?.length ?? 0) > 0);
}

function hasOnlyStatementScopeFilters(queryJSON: SearchQueryJSON | undefined): boolean {
    if (!queryJSON) {
        return true;
    }

    // Any expense status filter (e.g. unreported, drafts) narrows which expenses are shown, so the rows would no
    // longer be the whole settlement. "All" is the absence of a status filter, so only a present status narrows.
    if (getFilterFromQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS).value) {
        return false;
    }

    return queryJSON.flatFilters?.every((filter) => STATEMENT_SCOPE_FILTER_KEYS.has(filter.key)) ?? true;
}

// A group key in SearchResultDataType maps to a union of group shapes (members, cards, withdrawals, etc.).
// entryID is unique to SearchWithdrawalIDGroup, so it identifies a settlement group without a cast.
function isWithdrawalIDGroup(value: SearchResultDataType[keyof SearchResultDataType]): value is SearchWithdrawalIDGroup {
    return typeof value === 'object' && value !== null && 'entryID' in value && typeof value.entryID === 'number';
}

function getSelectedSettlementGroups(selectedTransactions: SelectedTransactions, searchData: SearchResultDataType | undefined): SearchWithdrawalIDGroup[] | undefined {
    if (!searchData) {
        return [];
    }

    // A settlement can be selected two ways: its collapsed row is checked directly (its group key lands in
    // selectedTransactions), or its row is expanded and its transactions are checked (each tagged with the group key).
    // Collect both so we can tell, per settlement, whether the whole thing or only part of it is selected.
    const directlySelectedGroupKeys = new Set<string>();
    const selectedTransactionCountByGroupKey = new Map<string, number>();
    for (const [key, selection] of Object.entries(selectedTransactions)) {
        if (!selection?.isSelected) {
            continue;
        }
        if (key.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            directlySelectedGroupKeys.add(key);
        }
        if (selection.groupKey?.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            selectedTransactionCountByGroupKey.set(selection.groupKey, (selectedTransactionCountByGroupKey.get(selection.groupKey) ?? 0) + 1);
        }
    }

    const settlementGroups: SearchWithdrawalIDGroup[] = [];
    for (const [groupKey, group] of Object.entries(searchData)) {
        if (!isWithdrawalIDGroup(group)) {
            continue;
        }

        const selectedTransactionCount = selectedTransactionCountByGroupKey.get(groupKey) ?? 0;
        const isRowSelectedDirectly = directlySelectedGroupKeys.has(groupKey);
        const areAllTransactionsSelected = group.count > 0 && selectedTransactionCount >= group.count;

        // Whole settlement selected: include it in the statement.
        if (isRowSelectedDirectly || areAllTransactionsSelected) {
            settlementGroups.push(group);
            continue;
        }

        // Only some of this settlement's transactions are selected. The statement always covers the whole settlement,
        // so a partial selection would export more than what's on screen. Hide the action entirely.
        if (selectedTransactionCount > 0) {
            return undefined;
        }

        // Otherwise the settlement isn't part of the selection at all, so leave it out.
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

    // A multi-workspace or negated workspace filter cannot be scoped to a statement and must not silently fall back to
    // an unscoped export (which would include workspaces the filter narrowed out), so hide the action entirely.
    if (hasUnsupportedWorkspaceFilter(queryJSON)) {
        return undefined;
    }

    const selectedSettlementGroups = getSelectedSettlementGroups(selectedTransactions, searchData);
    if (!selectedSettlementGroups || selectedSettlementGroups.length === 0) {
        return undefined;
    }

    const scopedPolicyID = getScopedPolicyID(queryJSON);

    // A statement covers one feed, so group the selected settlements by feed (fundID, not feedCountry: one program can
    // have several feeds). Group before checking exportability so a selection spanning more than one feed still trips
    // the multi-feed message, even when the user is not an admin of one of those feeds. A settlement with no fundID
    // already spans multiple feeds, so key it uniquely by entryID to keep it a distinct feed.
    const feedsByKey = new Map<string, ExpensifyCardStatementFeed>();
    for (const settlementGroup of selectedSettlementGroups) {
        const feedKey = settlementGroup.fundID !== undefined ? `fund_${settlementGroup.fundID}` : `entry_${settlementGroup.entryID}`;
        const existingFeed = feedsByKey.get(feedKey);
        if (existingFeed) {
            existingFeed.entryIDs.push(settlementGroup.entryID);
            existingFeed.canExportStatement = existingFeed.canExportStatement && !!settlementGroup.canExportStatement;
            continue;
        }

        feedsByKey.set(feedKey, {
            policyID: scopedPolicyID,
            feedCountry: settlementGroup.feedCountry,
            fundID: settlementGroup.fundID,
            entryIDs: [settlementGroup.entryID],
            canExportStatement: !!settlementGroup.canExportStatement,
        });
    }

    const feeds = Array.from(feedsByKey.values());

    // More than one feed selected: show the multi-feed message regardless of which feeds the user can export, so the
    // user isn't silently given a statement for only the feeds they administer.
    if (feeds.length > 1) {
        return {feeds, hasMultipleFeeds: true};
    }

    // Single feed: the export is admin-only, and the backend stamps canExportStatement per settlement (same
    // authorization it applies when generating the PDF), so hide the action when the user can't export the feed
    // rather than re-deriving admin access on the client.
    if (feeds.length === 0 || !feeds.at(0)?.canExportStatement) {
        return undefined;
    }

    return {
        feeds,
        hasMultipleFeeds: false,
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
