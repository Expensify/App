import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type Form from './Form';

const INPUT_IDS = {
    CHAT_TYPE: 'chatType',
    CURRENCY: 'currency',
    DESCRIPTION: 'description',
    ERROR_FIELDS: 'errorFields',
    HAS_OUTSTANDING_CHILD_REQUEST: 'hasOutstandingChildRequest',
    HAS_OUTSTANDING_CHILD_TASK: 'hasOutstandingChildTask',
    IS_CANCELLED_IOU: 'isCancelledIOU',
    IS_LOADING_PRIVATE_NOTES: 'isLoadingPrivateNotes',
    IS_OWN_POLICY_EXPENSE_CHAT: 'isOwnPolicyExpenseChat',
    IS_PINNED: 'isPinned',
    IS_WAITING_ON_BANK_ACCOUNT: 'isWaitingOnBankAccount',
    LAST_ACTION_TYPE: 'lastActionType',
    LAST_ACTOR_ACCOUNT_ID: 'lastActorAccountID',
    LAST_MESSAGE_HTML: 'lastMessageHtml',
    LAST_MESSAGE_TEXT: 'lastMessageText',
    LAST_READ_SEQUENCE_NUMBER: 'lastReadSequenceNumber',
    LAST_READ_TIME: 'lastReadTime',
    LAST_VISIBLE_ACTION_CREATED: 'lastVisibleActionCreated',
    LAST_VISIBLE_ACTION_LAST_MODIFIED: 'lastVisibleActionLastModified',
    MANAGER_ID: 'managerID',
    NON_REIMBURSABLE_TOTAL: 'nonReimbursableTotal',
    NOTIFICATION_PREFERENCE: 'notificationPreference',
    OLD_POLICY_NAME: 'oldPolicyName',
    OWNER_ACCOUNT_ID: 'ownerAccountID',
    PARTICIPANT_ACCOUNT_IDS: 'participantAccountIDs',
    PARTICIPANTS: 'participants',
    PERMISSIONS: 'permissions',
    POLICY_AVATAR: 'policyAvatar',
    POLICY_ID: 'policyID',
    POLICY_NAME: 'policyName',
    PRIVATE_NOTES: 'privateNotes',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PRIVATE_IS_ARCHIVED: 'private_isArchived',
    REPORT_ID: 'reportID',
    REPORT_NAME: 'reportName',
    STATE_NUM: 'stateNum',
    STATUS_NUM: 'statusNum',
    TOTAL: 'total',
    TYPE: 'type',
    UNHELD_TOTAL: 'unheldTotal',
    VISIBLE_CHAT_MEMBER_ACCOUNT_IDS: 'visibleChatMemberAccountIDs',
    WELCOME_MESSAGE: 'welcomeMessage',
    WRITE_CAPABILITY: 'writeCapability',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DebugReportForm = Form<
    InputID,
    {
        /** Whether the form has been submitted */
        [INPUT_IDS.CHAT_TYPE]: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;
        [INPUT_IDS.CURRENCY]: ValueOf<typeof CONST.CURRENCY>;
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.ERROR_FIELDS]: string;
        [INPUT_IDS.HAS_OUTSTANDING_CHILD_REQUEST]: boolean;
        [INPUT_IDS.HAS_OUTSTANDING_CHILD_TASK]: boolean;
        [INPUT_IDS.IS_CANCELLED_IOU]: boolean;
        [INPUT_IDS.IS_LOADING_PRIVATE_NOTES]: boolean;
        [INPUT_IDS.IS_OWN_POLICY_EXPENSE_CHAT]: boolean;
        [INPUT_IDS.IS_PINNED]: boolean;
        [INPUT_IDS.IS_WAITING_ON_BANK_ACCOUNT]: boolean;
        [INPUT_IDS.LAST_ACTION_TYPE]: DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;
        [INPUT_IDS.LAST_ACTOR_ACCOUNT_ID]: string;
        [INPUT_IDS.LAST_MESSAGE_HTML]: string;
        [INPUT_IDS.LAST_MESSAGE_TEXT]: string;
        [INPUT_IDS.LAST_READ_SEQUENCE_NUMBER]: string;
        [INPUT_IDS.LAST_READ_TIME]: string;
        [INPUT_IDS.LAST_VISIBLE_ACTION_CREATED]: string;
        [INPUT_IDS.LAST_VISIBLE_ACTION_LAST_MODIFIED]: string;
        [INPUT_IDS.MANAGER_ID]: string;
        [INPUT_IDS.NON_REIMBURSABLE_TOTAL]: string;
        [INPUT_IDS.NOTIFICATION_PREFERENCE]: ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>;
        [INPUT_IDS.OLD_POLICY_NAME]: string;
        [INPUT_IDS.OWNER_ACCOUNT_ID]: string;
        [INPUT_IDS.PARTICIPANT_ACCOUNT_IDS]: string;
        [INPUT_IDS.PARTICIPANTS]: string;
        [INPUT_IDS.PERMISSIONS]: string;
        [INPUT_IDS.POLICY_AVATAR]: string;
        [INPUT_IDS.POLICY_ID]: string;
        [INPUT_IDS.POLICY_NAME]: string;
        [INPUT_IDS.PRIVATE_NOTES]: string;
        [INPUT_IDS.PRIVATE_IS_ARCHIVED]: string;
        [INPUT_IDS.REPORT_ID]: string;
        [INPUT_IDS.REPORT_NAME]: string;
        [INPUT_IDS.STATE_NUM]: string;
        [INPUT_IDS.STATUS_NUM]: string;
        [INPUT_IDS.TOTAL]: string;
        [INPUT_IDS.TYPE]: ValueOf<typeof CONST.REPORT.TYPE>;
        [INPUT_IDS.UNHELD_TOTAL]: string;
        [INPUT_IDS.VISIBLE_CHAT_MEMBER_ACCOUNT_IDS]: string;
        [INPUT_IDS.WELCOME_MESSAGE]: string;
        [INPUT_IDS.WRITE_CAPABILITY]: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;
    }
>;

export type {DebugReportForm};
export default INPUT_IDS;
