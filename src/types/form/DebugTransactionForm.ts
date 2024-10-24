import type {ValueOf} from 'type-fest';
import type {IOURequestType} from '@libs/actions/IOU';
import type CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    AMOUNT: 'amount',
    TAX_AMOUNT: 'taxAmount',
    TAX_CODE: 'taxCode',
    BILLABLE: 'billable',
    CATEGORY: 'category',
    COMMENT: 'comment',
    CREATED: 'created',
    CURRENCY: 'currency',
    ERRORS: 'errors',
    ERROR_FIELDS: 'errorFields',
    FILENAME: 'filename',
    IOU_REQUEST_TYPE: 'iouRequestType',
    MERCHANT: 'merchant',
    MODIFIED_AMOUNT: 'modifiedAmount',
    MODIFIED_CREATED: 'modifiedCreated',
    MODIFIED_CURRENCY: 'modifiedCurrency',
    MODIFIED_MERCHANT: 'modifiedMerchant',
    MODIFIED_WAYPOINTS: 'modifiedWaypoints',
    PARTICIPANTS_AUTO_ASSIGNED: 'participantsAutoAssigned',
    PARTICIPANTS: 'participants',
    RECEIPT: 'receipt',
    REPORT_ID: 'reportID',
    ROUTES: 'routes',
    TRANSACTION_ID: 'transactionID',
    TAG: 'tag',
    IS_FROM_GLOBAL_CREATE: 'isFromGlobalCreate',
    TAX_RATE: 'taxRate',
    PARENT_TRANSACTION_ID: 'parentTransactionID',
    REIMBURSABLE: 'reimbursable',
    CARD_ID: 'cardID',
    STATUS: 'status',
    HAS_E_RECEIPT: 'hasEReceipt',
    MCC_GROUP: 'mccGroup',
    MODIFIED_MCC_GROUP: 'modifiedMCCGroup',
    ORIGINAL_AMOUNT: 'originalAmount',
    ORIGINAL_CURRENCY: 'originalCurrency',
    IS_LOADING: 'isLoading',
    SPLIT_SHARES: 'splitShares',
    SPLIT_PAYER_ACCOUNT_I_DS: 'splitPayerAccountIDs',
    SHOULD_SHOW_ORIGINAL_AMOUNT: 'shouldShowOriginalAmount',
    ACTIONABLE_WHISPER_REPORT_ACTION_ID: 'actionableWhisperReportActionID',
    LINKED_TRACKED_EXPENSE_REPORT_ACTION: 'linkedTrackedExpenseReportAction',
    LINKED_TRACKED_EXPENSE_REPORT_ID: 'linkedTrackedExpenseReportID',
    BANK: 'bank',
    CARD_NAME: 'cardName',
    CARD_NUMBER: 'cardNumber',
    MANAGED_CARD: 'managedCard',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DebugTransactionForm = Form<
    InputID,
    {
        [INPUT_IDS.AMOUNT]: string;
        [INPUT_IDS.TAX_AMOUNT]: string;
        [INPUT_IDS.TAX_CODE]: string;
        [INPUT_IDS.BILLABLE]: boolean;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.COMMENT]: string;
        [INPUT_IDS.CREATED]: string;
        [INPUT_IDS.CURRENCY]: string;
        [INPUT_IDS.ERRORS]: string;
        [INPUT_IDS.ERROR_FIELDS]: string;
        [INPUT_IDS.FILENAME]: string;
        [INPUT_IDS.IOU_REQUEST_TYPE]: IOURequestType;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MODIFIED_AMOUNT]: string;
        [INPUT_IDS.MODIFIED_CREATED]: string;
        [INPUT_IDS.MODIFIED_CURRENCY]: string;
        [INPUT_IDS.MODIFIED_MERCHANT]: string;
        [INPUT_IDS.MODIFIED_WAYPOINTS]: string;
        [INPUT_IDS.PARTICIPANTS_AUTO_ASSIGNED]: boolean;
        [INPUT_IDS.PARTICIPANTS]: string;
        [INPUT_IDS.RECEIPT]: string;
        [INPUT_IDS.REPORT_ID]: string;
        [INPUT_IDS.ROUTES]: string;
        [INPUT_IDS.TRANSACTION_ID]: string;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.IS_FROM_GLOBAL_CREATE]: boolean;
        [INPUT_IDS.TAX_RATE]: string;
        [INPUT_IDS.PARENT_TRANSACTION_ID]: string;
        [INPUT_IDS.REIMBURSABLE]: boolean;
        [INPUT_IDS.CARD_ID]: string;
        [INPUT_IDS.STATUS]: ValueOf<typeof CONST.TRANSACTION.STATUS>;
        [INPUT_IDS.HAS_E_RECEIPT]: boolean;
        [INPUT_IDS.MCC_GROUP]: ValueOf<typeof CONST.MCC_GROUPS>;
        [INPUT_IDS.MODIFIED_MCC_GROUP]: ValueOf<typeof CONST.MCC_GROUPS>;
        [INPUT_IDS.ORIGINAL_AMOUNT]: string;
        [INPUT_IDS.ORIGINAL_CURRENCY]: string;
        [INPUT_IDS.IS_LOADING]: boolean;
        [INPUT_IDS.SPLIT_SHARES]: string;
        [INPUT_IDS.SPLIT_PAYER_ACCOUNT_I_DS]: string;
        [INPUT_IDS.SHOULD_SHOW_ORIGINAL_AMOUNT]: boolean;
        [INPUT_IDS.ACTIONABLE_WHISPER_REPORT_ACTION_ID]: string;
        [INPUT_IDS.LINKED_TRACKED_EXPENSE_REPORT_ACTION]: string;
        [INPUT_IDS.LINKED_TRACKED_EXPENSE_REPORT_ID]: string;
        [INPUT_IDS.BANK]: string;
        [INPUT_IDS.CARD_NAME]: string;
        [INPUT_IDS.CARD_NUMBER]: string;
        [INPUT_IDS.MANAGED_CARD]: boolean;
    }
>;

export type {DebugTransactionForm};
export default INPUT_IDS;
