import CONST from '@src/CONST';
import ACTION_FORM_INPUT_IDS from '@src/types/form/DebugReportActionForm';
import REPORT_FORM_INPUT_IDS from '@src/types/form/DebugReportForm';

const FIELD_TYPES = {
    dropdown: 'dropdown',
    checkbox: 'checkbox',
    text: 'text',
    lastActionType: 'lastActionType',
};

const DETAILS_TYPES_MAP = {
    chatType: FIELD_TYPES.dropdown,
    currency: FIELD_TYPES.dropdown,
    description: FIELD_TYPES.text,
    errorFields: FIELD_TYPES.text,
    hasOutstandingChildRequest: FIELD_TYPES.checkbox,
    hasOutstandingChildTask: FIELD_TYPES.checkbox,
    isCancelledIOU: FIELD_TYPES.checkbox,
    isLoadingPrivateNotes: FIELD_TYPES.checkbox,
    isOwnPolicyExpenseChat: FIELD_TYPES.checkbox,
    isPinned: FIELD_TYPES.checkbox,
    isWaitingOnBankAccount: FIELD_TYPES.checkbox,
    lastActionType: FIELD_TYPES.dropdown,
    lastActorAccountID: FIELD_TYPES.text,
    lastMessageHtml: FIELD_TYPES.text,
    lastMessageText: FIELD_TYPES.text,
    lastReadSequenceNumber: FIELD_TYPES.text,
    lastReadTime: FIELD_TYPES.text,
    lastVisibleActionCreated: FIELD_TYPES.text,
    lastVisibleActionLastModified: FIELD_TYPES.text,
    managerID: FIELD_TYPES.text,
    nonReimbursableTotal: FIELD_TYPES.text,
    notificationPreference: FIELD_TYPES.dropdown,
    oldPolicyName: FIELD_TYPES.text,
    ownerAccountID: FIELD_TYPES.text,
    participantAccountIDs: FIELD_TYPES.text,
    participants: FIELD_TYPES.text,
    permissions: FIELD_TYPES.text,
    policyAvatar: FIELD_TYPES.text,
    policyID: FIELD_TYPES.text,
    policyName: FIELD_TYPES.text,
    privateNotes: FIELD_TYPES.text,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_isArchived: FIELD_TYPES.text,
    reportID: FIELD_TYPES.text,
    reportName: FIELD_TYPES.text,
    stateNum: FIELD_TYPES.text,
    statusNum: FIELD_TYPES.text,
    total: FIELD_TYPES.text,
    type: FIELD_TYPES.dropdown,
    unheldTotal: FIELD_TYPES.text,
    visibleChatMemberAccountIDs: FIELD_TYPES.text,
    welcomeMessage: FIELD_TYPES.text,
    writeCapability: FIELD_TYPES.dropdown,
};

const DETAILS_DROPDOWN_OPTIONS = {
    chatType: CONST.REPORT.CHAT_TYPE,
    currency: CONST.CURRENCY,
    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE,
    type: CONST.REPORT.TYPE,
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES,
};

const LAST_ACTION_TYPE = 'lastActionType';
const ACTION_NAME = 'actionName';

const DETAILS_SELECTION_LIST = [ACTION_FORM_INPUT_IDS.ACTION_NAME, REPORT_FORM_INPUT_IDS.LAST_ACTION_TYPE] as string[];

export {DETAILS_TYPES_MAP, DETAILS_DROPDOWN_OPTIONS, LAST_ACTION_TYPE, ACTION_NAME, FIELD_TYPES, DETAILS_SELECTION_LIST};
