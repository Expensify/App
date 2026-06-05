import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import type EnvironmentType from '@libs/Environment/getEnvironment/types';
import fileDownload from '@libs/fileDownload';
import {getSettlementStatus} from '@libs/SearchUIUtils';
import sha1Hex from '@libs/StringUtils/sha1Hex';
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
    statementKey: string;
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

function getExpensifyCardStatementKey(policyID: string, feedCountry: string | undefined, entryIDs: number[]): string {
    const sortedEntryIDs = [...entryIDs].sort((firstEntryID, secondEntryID) => firstEntryID - secondEntryID);
    const feedCountrySuffix = feedCountry ? `_${feedCountry}` : '';
    return `${policyID}${feedCountrySuffix}_${sha1Hex(sortedEntryIDs.join(','))}`;
}

function getSelectedSettlementGroups(selectedTransactions: SelectedTransactions, searchData: SearchResultDataType | undefined): SearchWithdrawalIDGroup[] {
    if (!searchData) {
        return [];
    }

    // Selecting a settlement adds its transactions (keyed by transaction ID), each tagged with the
    // settlement's groupKey. Tally how many transactions are selected per settlement so we can require
    // the whole settlement to be selected (a partial, line-item-only selection should not qualify).
    const selectedCountByGroupKey = new Map<string, number>();
    for (const selection of Object.values(selectedTransactions)) {
        const groupKey = selection?.groupKey;
        if (!selection?.isSelected || !groupKey?.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            continue;
        }
        selectedCountByGroupKey.set(groupKey, (selectedCountByGroupKey.get(groupKey) ?? 0) + 1);
    }

    return Array.from(selectedCountByGroupKey.entries())
        .map(([groupKey, selectedCount]) => ({group: searchData[groupKey] as SearchWithdrawalIDGroup | undefined, selectedCount}))
        .filter(
            (entry): entry is {group: SearchWithdrawalIDGroup; selectedCount: number} =>
                !!entry.group &&
                getSettlementStatus(entry.group.state) === CONST.SEARCH.SETTLEMENT_STATUS.CLEARED &&
                typeof entry.group.entryID === 'number' &&
                entry.selectedCount >= entry.group.count,
        )
        .map((entry) => entry.group);
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
    for (const settlementGroup of selectedSettlementGroups) {
        if (!settlementGroup.policyID) {
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
    if (feeds.length === 0) {
        return undefined;
    }

    return {
        feeds,
        hasMultipleFeeds: feeds.length > 1,
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

    return {
        policyID: feed.policyID,
        feedCountry: feed.feedCountry,
        entryIDs: feed.entryIDs,
        statementKey: getExpensifyCardStatementKey(feed.policyID, feed.feedCountry, feed.entryIDs),
    };
}

function downloadExpensifyCardStatementPDF(translate: LocalizedTranslate, fileName: string, statementKey: string, currentUserEmail: string, encryptedAuthToken: string): Promise<void> {
    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));
    const downloadFileName = `Expensify_Card_Statement_${statementKey}.pdf`;
    const pdfURL = `${baseURL}secure?secureType=pdfreport&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(downloadFileName)}&email=${encodeURIComponent(currentUserEmail)}`;
    return fileDownload(translate, addEncryptedAuthTokenToURL(pdfURL, encryptedAuthToken, true), downloadFileName, '');
}

export type {ExpensifyCardStatementFeed, ExpensifyCardStatementParams, ExpensifyCardStatementSelection};
export {
    downloadExpensifyCardStatementPDF,
    getExpensifyCardStatementKey,
    getExpensifyCardStatementParams,
    getExpensifyCardStatementSelection,
    isExpensifyCardStatementSearch,
};
