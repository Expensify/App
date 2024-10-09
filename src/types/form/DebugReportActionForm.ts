import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type Form from './Form';

const INPUT_IDS = {
    REPORT_ACTION_ID: 'reportActionID',
    SEQUENCE_NUMBER: 'sequenceNumber',
    ACTION_NAME: 'actionName',
    ACTOR_ACCOUNT_ID: 'actorAccountID',
    ACTOR: 'actor',
    PERSON: 'person',
    CREATED: 'created',
    IS_LOADING: 'isLoading',
    AVATAR: 'avatar',
    AUTOMATIC: 'automatic',
    SHOULD_SHOW: 'shouldShow',
    CHILD_REPORT_ID: 'childReportID',
    CHILD_REPORT_NAME: 'childReportName',
    CHILD_TYPE: 'childType',
    ACCOUNT_ID: 'accountID',
    CHILD_OLDEST_FOUR_ACCOUNT_IDS: 'childOldestFourAccountIDs',
    CHILD_COMMENTER_COUNT: 'childCommenterCount',
    CHILD_LAST_VISIBLE_ACTION_CREATED: 'childLastVisibleActionCreated',
    CHILD_VISIBLE_ACTION_COUNT: 'childVisibleActionCount',
    PARENT_REPORT_ID: 'parentReportID',
    CHILD_MANAGER_ACCOUNT_ID: 'childManagerAccountID',
    CHILD_OWNER_ACCOUNT_ID: 'childOwnerAccountID',
    CHILD_STATUS_NUM: 'childStatusNum',
    CHILD_STATE_NUM: 'childStateNum',
    CHILD_LAST_MONEY_REQUEST_COMMENT: 'childLastMoneyRequestComment',
    CHILD_LAST_ACTOR_ACCOUNT_ID: 'childLastActorAccountID',
    CHILD_MONEY_REQUEST_COUNT: 'childMoneyRequestCount',
    IS_FIRST_ITEM: 'isFirstItem',
    IS_ATTACHMENT_ONLY: 'isAttachmentOnly',
    IS_ATTACHMENT_WITH_TEXT: 'isAttachmentWithText',
    RECEIPT: 'receipt',
    LAST_MODIFIED: 'lastModified',
    DELEGATE_ACCOUNT_ID: 'delegateAccountID',
    ERRORS: 'errors',
    ERROR: 'error',
    CHILD_RECENT_RECEIPT_TRANSACTION_IDS: 'childRecentReceiptTransactionIDs',
    REPORT_ID: 'reportID',
    LINK_METADATA: 'linkMetadata',
    CHILD_REPORT_NOTIFICATION_PREFERENCE: 'childReportNotificationPreference',
    IS_NEWEST_REPORT_ACTION: 'isNewestReportAction',
    IS_OPTIMISTIC_ACTION: 'isOptimisticAction',
    ADMIN_ACCOUNT_ID: 'adminAccountID',
    WHISPERED_TO_ACCOUNT_IDS: 'whisperedToAccountIDs',
    ORIGINAL_MESSAGE: 'originalMessage',
    MESSAGE: 'message',
    PREVIOUS_MESSAGE: 'previousMessage',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DebugReportActionForm = Form<
    InputID,
    {
        [INPUT_IDS.REPORT_ACTION_ID]: string;
        [INPUT_IDS.SEQUENCE_NUMBER]: string;
        [INPUT_IDS.ACTION_NAME]: DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;
        [INPUT_IDS.ACTOR_ACCOUNT_ID]: string;
        [INPUT_IDS.ACTOR]: string;
        [INPUT_IDS.PERSON]: string;
        [INPUT_IDS.CREATED]: string;
        [INPUT_IDS.IS_LOADING]: boolean;
        [INPUT_IDS.AVATAR]: string;
        [INPUT_IDS.AUTOMATIC]: boolean;
        [INPUT_IDS.SHOULD_SHOW]: boolean;
        [INPUT_IDS.CHILD_REPORT_ID]: string;
        [INPUT_IDS.CHILD_REPORT_NAME]: string;
        [INPUT_IDS.CHILD_TYPE]: string;
        [INPUT_IDS.ACCOUNT_ID]: string;
        [INPUT_IDS.CHILD_OLDEST_FOUR_ACCOUNT_IDS]: string;
        [INPUT_IDS.CHILD_COMMENTER_COUNT]: string;
        [INPUT_IDS.CHILD_LAST_VISIBLE_ACTION_CREATED]: string;
        [INPUT_IDS.CHILD_VISIBLE_ACTION_COUNT]: string;
        [INPUT_IDS.PARENT_REPORT_ID]: string;
        [INPUT_IDS.CHILD_MANAGER_ACCOUNT_ID]: string;
        [INPUT_IDS.CHILD_OWNER_ACCOUNT_ID]: string;
        [INPUT_IDS.CHILD_STATUS_NUM]: string;
        [INPUT_IDS.CHILD_STATE_NUM]: string;
        [INPUT_IDS.CHILD_LAST_MONEY_REQUEST_COMMENT]: string;
        [INPUT_IDS.CHILD_LAST_ACTOR_ACCOUNT_ID]: string;
        [INPUT_IDS.CHILD_MONEY_REQUEST_COUNT]: string;
        [INPUT_IDS.IS_FIRST_ITEM]: boolean;
        [INPUT_IDS.IS_ATTACHMENT_ONLY]: boolean;
        [INPUT_IDS.IS_ATTACHMENT_WITH_TEXT]: boolean;
        [INPUT_IDS.RECEIPT]: string;
        [INPUT_IDS.LAST_MODIFIED]: string;
        [INPUT_IDS.DELEGATE_ACCOUNT_ID]: string;
        [INPUT_IDS.ERRORS]: string;
        [INPUT_IDS.ERROR]: string;
        [INPUT_IDS.CHILD_RECENT_RECEIPT_TRANSACTION_IDS]: string;
        [INPUT_IDS.REPORT_ID]: string;
        [INPUT_IDS.LINK_METADATA]: string;
        [INPUT_IDS.CHILD_REPORT_NOTIFICATION_PREFERENCE]: ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>;
        [INPUT_IDS.IS_NEWEST_REPORT_ACTION]: boolean;
        [INPUT_IDS.IS_OPTIMISTIC_ACTION]: boolean;
        [INPUT_IDS.ADMIN_ACCOUNT_ID]: string;
        [INPUT_IDS.WHISPERED_TO_ACCOUNT_IDS]: string;
        [INPUT_IDS.ORIGINAL_MESSAGE]: string;
        [INPUT_IDS.MESSAGE]: string;
        [INPUT_IDS.PREVIOUS_MESSAGE]: string;
    }
>;

export type {DebugReportActionForm};
export default INPUT_IDS;
