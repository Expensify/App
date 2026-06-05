import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import type EnvironmentType from '@libs/Environment/getEnvironment/types';
import fileDownload from '@libs/fileDownload';
import {getSettlementStatus} from '@libs/SearchUIUtils';
import addTrailingForwardSlash from '@libs/UrlUtils';
import CONST from '@src/CONST';
import type {SearchResultDataType, SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

let environment: EnvironmentType;
getEnvironment().then((env) => {
    environment = env;
});

type ExpensifyCardStatementFeed = {
    policyID: string;
    feedCountry?: string;
    entryIDs: number[];
};

type ExpensifyCardStatementSelection = {
    feeds: ExpensifyCardStatementFeed[];
    hasMultipleFeeds: boolean;
};

type ExpensifyCardStatementParams = {
    policyID: string;
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

    const withdrawalTypeFilter = queryJSON.flatFilters?.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE);
    return withdrawalTypeFilter?.filters?.some((filter) => filter.value === CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD) ?? false;
}

function getSelectedSettlementGroups(selectedTransactions: SelectedTransactions, searchData: SearchResultDataType | undefined): SearchWithdrawalIDGroup[] {
    if (!searchData) {
        return [];
    }

    // A settlement can be selected two ways. When its row is collapsed it has no loaded transactions, so
    // its group key is stored directly in selectedTransactions. When its row is expanded, its transactions
    // are stored individually, each tagged with the settlement's groupKey. Collect the settlement keys from
    // both forms. The PDF is generated for the whole settlement by entryID, so one selected transaction is
    // enough to include it - we must not require every transaction in the settlement to be loaded.
    const selectedGroupKeys = new Set<string>();
    for (const [key, selection] of Object.entries(selectedTransactions)) {
        if (!selection?.isSelected) {
            continue;
        }
        if (key.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            selectedGroupKeys.add(key);
        }
        if (selection.groupKey?.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            selectedGroupKeys.add(selection.groupKey);
        }
    }

    const settlementGroups: SearchWithdrawalIDGroup[] = [];
    for (const groupKey of selectedGroupKeys) {
        const group = searchData[groupKey as keyof SearchResultDataType] as SearchWithdrawalIDGroup | undefined;
        if (!group || typeof group.entryID !== 'number' || getSettlementStatus(group.state) === CONST.SEARCH.SETTLEMENT_STATUS.FAILED) {
            continue;
        }
        settlementGroups.push(group);
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

    const selectedSettlementGroups = getSelectedSettlementGroups(selectedTransactions, searchData);
    if (selectedSettlementGroups.length === 0) {
        return undefined;
    }

    const feedsByKey = new Map<string, ExpensifyCardStatementFeed>();
    let hasMixedWorkspaceSettlement = false;
    for (const settlementGroup of selectedSettlementGroups) {
        if (!settlementGroup.policyID) {
            hasMixedWorkspaceSettlement = true;
            continue;
        }

        const feedKey = `${settlementGroup.policyID}:${settlementGroup.feedCountry ?? ''}`;
        const existingFeed = feedsByKey.get(feedKey);
        if (existingFeed) {
            existingFeed.entryIDs.push(settlementGroup.entryID);
            continue;
        }

        feedsByKey.set(feedKey, {
            policyID: settlementGroup.policyID,
            feedCountry: settlementGroup.feedCountry,
            entryIDs: [settlementGroup.entryID],
        });
    }

    const feeds = Array.from(feedsByKey.values());
    if (feeds.length === 0 && !hasMixedWorkspaceSettlement) {
        return undefined;
    }

    return {
        feeds,
        hasMultipleFeeds: feeds.length > 1 || hasMixedWorkspaceSettlement,
    };
}

function getExpensifyCardStatementParamsFromFeed(feed: ExpensifyCardStatementFeed): ExpensifyCardStatementParams {
    const entryIDs = [...feed.entryIDs];
    return {
        policyID: feed.policyID,
        feedCountry: feed.feedCountry,
        entryIDs,
    };
}

function getExpensifyCardStatementParams(
    queryJSON: SearchQueryJSON | undefined,
    selectedTransactions: SelectedTransactions | undefined,
    searchData: SearchResultDataType | undefined,
): ExpensifyCardStatementParams | undefined {
    const selection = getExpensifyCardStatementSelection(queryJSON, selectedTransactions, searchData);
    if (!selection || selection.hasMultipleFeeds || selection.feeds.length !== 1) {
        return undefined;
    }

    const feed = selection.feeds.at(0);
    if (!feed) {
        return undefined;
    }

    return getExpensifyCardStatementParamsFromFeed(feed);
}

function downloadExpensifyCardStatementPDF(translate: LocalizedTranslate, fileName: string, statementKey: string, currentUserEmail: string, encryptedAuthToken: string): Promise<void> {
    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));
    const downloadFileName = `Expensify_Card_Statement_${statementKey}.pdf`;
    const pdfURL = `${baseURL}secure?secureType=pdfreport&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(downloadFileName)}&email=${encodeURIComponent(currentUserEmail)}`;
    return fileDownload(translate, addEncryptedAuthTokenToURL(pdfURL, encryptedAuthToken, true), downloadFileName, '');
}

export type {ExpensifyCardStatementParams};
export {downloadExpensifyCardStatementPDF, getExpensifyCardStatementParams, getExpensifyCardStatementParamsFromFeed, getExpensifyCardStatementSelection, isExpensifyCardStatementSearch};
