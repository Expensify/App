import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

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
    /** The ID of the transaction */
    transactionID: string;

    /** The transaction created date */
    created: string;

    /** The edited transaction created date */
    modifiedCreated: string;

    /** The transaction amount */
    amount: number;

    /** The edited transaction amount */
    modifiedAmount: number;

    /** The transaction currency */
    currency: string;

    /** The edited transaction currency */
    modifiedCurrency: string;

    /** The transaction merchant */
    merchant: string;

    /** The edited transaction merchant */
    modifiedMerchant: string;

    /** The receipt object */
    receipt?: {source?: string};

    /** The transaction tag */
    tag: string;

    /** The transaction description */
    comment: {comment: string};

    /** The transaction category */
    category: string;

    /** The type of request */
    type: ValueOf<typeof CONST.SEARCH_TRANSACTION_TYPE>;

    /** The type of report the transaction is associated with */
    reportType: string;

    /** The ID of the policy the transaction is associated with */
    policyID: string;

    parentTransactionID?: string;
    hasEReceipt?: boolean;
    description: string;
    accountID: number;
    managerID: number;
    hasViolation: boolean;
    taxAmount?: number;
    reportID: string;
    transactionThreadReportID: string;
    action: string;
};

type SearchAccountDetails = Partial<SearchPolicyDetails & SearchPersonalDetails>;

type SearchTransactionType = ValueOf<typeof CONST.SEARCH_TRANSACTION_TYPE>;

type SearchQuery = ValueOf<typeof CONST.TAB_SEARCH>;

type SearchResults = {
    search: SearchResultsInfo;
    data: Record<string, SearchTransaction & Record<string, SearchPersonalDetails>> & Record<string, SearchPolicyDetails>;
};

export default SearchResults;

export type {SearchQuery, SearchTransaction, SearchTransactionType, SearchPersonalDetails, SearchPolicyDetails, SearchAccountDetails};
