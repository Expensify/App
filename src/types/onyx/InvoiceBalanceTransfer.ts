import type * as OnyxCommon from './OnyxCommon';

/** Model of invoice balance transfer */
type InvoiceBalanceTransfer = {
    /** Whether the data is being fetched from server */
    loading: boolean;

    /** Whether the success screen is shown to user. */
    shouldShowSuccess: boolean;

    /** Error messages to show in UI */
    errors?: OnyxCommon.Errors;
};

export default InvoiceBalanceTransfer;
