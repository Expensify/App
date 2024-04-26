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
    from: {displayName: string; avatarURL: string};
    to: {displayName: string; avatarURL: string};
    amount: number;
    modifiedAmount?: number;
    category?: string;
    tag?: string;
    type: string;
    hasViolation: boolean;
    taxAmount?: number;
    reportID: string;
    transactionThreadReportID: string; // Not present in live transactions_
    action: string;
};

type SearchResults = {
    search: SearchResultsInfo;
    data: Record<string, SearchTransaction>;
};

export default SearchResults;

export type {SearchTransaction};
