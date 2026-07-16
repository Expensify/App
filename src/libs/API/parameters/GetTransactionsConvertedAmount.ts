import type {SearchQueryString} from '@components/Search/types';

type GetTransactionsConvertedAmountParams = {
    /** The serialized search query whose transactions should be converted */
    jsonQuery: SearchQueryString;

    /** The currency the amounts should be converted to */
    targetCurrency: string;

    /** Comma-separated transaction IDs to scope the conversion to a specific selection; omitted for the whole-search total */
    transactionIDList?: string;

    /** Comma-separated report IDs to convert each selected report's total; used by the Reports search */
    reportIDList?: string;

    /** Serialized default-currency source figures to stamp the conversions against; the command echoes them back for stale detection */
    sources?: string;
};

export default GetTransactionsConvertedAmountParams;
