import type {ValueOf} from 'type-fest';
import type TransactionListItem from '@components/SelectionList/TransactionListItem';
import type CONST from '@src/CONST';
import type {Receipt} from './Transaction';

type SearchDataTypes = ValueOf<typeof CONST.SEARCH_DATA_TYPES>;

type ListItemType<T extends SearchDataTypes> = T extends typeof CONST.SEARCH_DATA_TYPES.TRANSACTION ? typeof TransactionListItem : never;

type SectionsType<T extends SearchDataTypes> = T extends typeof CONST.SEARCH_DATA_TYPES.TRANSACTION ? SearchTransaction[] : never;

type SearchTypeToItemMap = {
    [K in SearchDataTypes]: {
        listItem: ListItemType<K>;
        getSections: (data: SearchResults['data']) => SectionsType<K>;
    };
};

type SearchResultsInfo = {
    offset: number;
    type: string;
    hasMoreResults: boolean;
};

type SearchPersonalDetails = {
    accountID: number;
    avatar: string;
    displayName?: string;
    login?: string;
};

type SearchPolicyDetails = {
    id: string;
    avatarURL: string;
    name: string;
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
    from: SearchPersonalDetails | SearchPolicyDetails;
    to: SearchPersonalDetails | SearchPolicyDetails;
    amount: number;
    modifiedAmount?: number;
    category?: string;
    currency: string;
    tag?: string;
    type: SearchTransactionType;
    hasViolation: boolean;
    taxAmount?: number;
    reportID: string;
    reportType: string;
    policyID: string;
    transactionThreadReportID: string;
    shouldShowMerchant: boolean;
    action: string;
};

type SearchTransactionType = ValueOf<typeof CONST.SEARCH_TRANSACTION_TYPE>;

type SearchQuery = ValueOf<typeof CONST.TAB_SEARCH>;

type SearchResults = {
    search: SearchResultsInfo;
    data: Record<string, SearchTransaction & Record<string, SearchPersonalDetails>> & Record<string, SearchPolicyDetails>;
};

export default SearchResults;

export type {SearchQuery, SearchTransaction, SearchTransactionType, SearchPersonalDetails, SearchPolicyDetails, SearchDataTypes, SearchTypeToItemMap};
