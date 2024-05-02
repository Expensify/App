import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Receipt} from './Transaction';

type SearchResultsInfo = {
    offset: number;
    type: string;
    hasMoreResults: boolean;
};

type SearchTransaction = {
    transactionID: string;
    parentTransactionID?: string;
    receipt?: Receipt;
    hasEReceipt?: boolean;
    created: string;
    merchant: string;
    modifiedCreated?: string;
    modifiedMerchant?: string;
    description: string;
    accountID: number;
    managerID: number;
    amount: number;
    modifiedAmount?: number;
    category?: string;
    currency: string;
    tag?: string;
    type: SearchTransactionType;
    hasViolation: boolean;
    taxAmount?: number;
    reportID: string;
    transactionThreadReportID: string; // Not present in live transactions_
    action: string;
};

type SearchTransactionType = ValueOf<typeof CONST.SEARCH_TRANSACTION_TYPE>;

type SearchQuery = ValueOf<typeof CONST.TAB_SEARCH>;

type SearchResults = {
    search: SearchResultsInfo;
    data: Record<string, SearchTransaction>;
};

export default SearchResults;

export type {SearchQuery, SearchTransaction, SearchTransactionType};
