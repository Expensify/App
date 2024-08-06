import type * as OnyxCommon from './OnyxCommon';

/** Model of invoice balance transfer */
type InvoiceBalanceTransfer = {
    /** Whether the data is being fetched from server */
    loading: boolean;

    /** Whether invoice balance has been transferred successfully */
    success: boolean;

    /** Error messages to show in UI */
    errors: OnyxCommon.Errors;
};

export default InvoiceBalanceTransfer;
