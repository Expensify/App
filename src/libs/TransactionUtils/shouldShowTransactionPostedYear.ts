import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

function shouldShowTransactionPostedYear(transaction: OnyxInputOrEntry<Transaction>) {
    const posted = transaction?.posted;
    if (!posted) {
        return false;
    }
    // Posted date is in the YYYYMMDD format, so we read the year from the first 4 chars (the Date constructor treats YYYYMMDD as invalid).
    const postedYear = parseInt(String(posted).slice(0, 4), 10);
    return postedYear !== new Date().getFullYear();
}

export default shouldShowTransactionPostedYear;
