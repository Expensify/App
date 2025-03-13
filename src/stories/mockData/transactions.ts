import CONST from '@src/CONST';
import type {OriginalMessageIOU, PersonalDetailsList, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

const amount = 1000;
const currency = 'USD';

/* eslint-disable @typescript-eslint/naming-convention */
const personalDetails: PersonalDetailsList = {
    11111111: {
        accountID: 11111111,
        avatar: '@assets/images/avatars/user/default-avatar_1.svg',
        firstName: 'John',
        lastName: 'Smith',
        status: {
            clearAfter: '',
            emojiCode: '🚲',
            text: '0% cycling in Canary islands',
        },
        displayName: 'John Smith',
        login: 'johnsmith@mail.com',
        pronouns: '__predefined_heHimHis',
        timezone: {
            automatic: true,
            selected: 'Europe/Luxembourg',
        },
        phoneNumber: '11111111',
        validated: true,
    },
    22222222: {
        accountID: 22222222,
        avatar: '@assets/images/avatars/user/default-avatar_2.svg',
        firstName: 'Ted',
        lastName: 'Kowalski',
        status: {
            clearAfter: '',
            emojiCode: '🚲',
            text: '0% cycling in Canary islands',
        },
        displayName: 'Ted Kowalski',
        login: 'tedkowalski@mail.com',
        pronouns: '__predefined_heHimHis',
        timezone: {
            automatic: true,
            selected: 'Europe/Warsaw',
        },
        phoneNumber: '22222222',
        validated: true,
    },
    33333333: {
        accountID: 33333333,
        avatar: '@assets/images/avatars/user/default-avatar_3.svg',
        firstName: 'Jane',
        lastName: 'Doe',
        status: {
            clearAfter: '',
            emojiCode: '🚲',
            text: '0% cycling in Canary islands',
        },
        displayName: 'Jane Doe',
        login: 'janedoe@mail.com',
        pronouns: '__predefined_sheHerHers',
        timezone: {
            automatic: true,
            selected: 'Europe/London',
        },
        phoneNumber: '33333333',
        validated: true,
    },
};

const iouReport: Report = {
    chatReportID: '1111111111111111',
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    currency,
    description: '',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    hasParentAccess: true,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    lastActorAccountID: 11111111,
    lastMessageHtml: 'abc',
    lastMessageText: 'abc',
    lastReadSequenceNumber: 0,
    lastReadTime: '2025-03-07 07:23:39.335',
    lastVisibleActionCreated: '2025-03-07 07:23:39.335',
    lastVisibleActionLastModified: '2025-03-07 07:23:39.335',
    managerID: 22222222,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 11111111,
    parentReportActionID: '1111111111111111111',
    parentReportID: '1111111111111111',
    participants: {
        '11111111': {
            notificationPreference: 'always',
        },
        '22222222': {
            notificationPreference: 'always',
        },
        '33333333': {
            notificationPreference: 'always',
        },
    },
    permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
    policyID: CONST.POLICY.ID_FAKE,
    reportID: '111111111111111',
    reportName: 'IOU',
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    total: 112298,
    // type: CONST.REPORT.TYPE.IOU,
    type: CONST.REPORT.TYPE.EXPENSE,
    unheldNonReimbursableTotal: 0,
    unheldTotal: 112298,
    welcomeMessage: '',
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
};

const chatReport: Report = {
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    currency,
    description: '',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    lastActorAccountID: 11111111,
    lastMessageHtml: '<mention-user accountID="11111111"/> <mention-user accountID="11111111"/>',
    lastMessageText: 'Test abc',
    lastReadSequenceNumber: 0,
    lastReadTime: '2025-03-11 08:51:38.736',
    lastVisibleActionCreated: '2025-03-11 08:47:56.654',
    lastVisibleActionLastModified: '2025-03-11 08:47:56.654',
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 11111111,
    participants: {
        '11111111': {
            notificationPreference: 'always',
        },
        '22222222': {
            notificationPreference: 'always',
        },
        '33333333': {
            notificationPreference: 'always',
        },
    },
    permissions: ['read', 'write'],
    policyID: CONST.POLICY.ID_FAKE,
    reportID: '1111111111111111',
    reportName: 'Chat Report',
    stateNum: 0,
    statusNum: 0,
    total: 0,
    type: 'chat',
    unheldNonReimbursableTotal: 0,
    unheldTotal: 0,
    welcomeMessage: '',
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
    iouReportID: '1111111111111111',
    managerID: 0,
};

const transaction: Transaction = {
    amount,
    bank: '',
    billable: false,
    cardID: 0,
    cardName: 'Cash Expense',
    cardNumber: '',
    category: '',
    comment: {},
    created: '2025-02-14',
    currency,
    filename: 'test.html',
    inserted: '2025-02-14 08:12:19',
    managedCard: false,
    merchant: 'Acme',
    modifiedAmount: 0,
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: '',
    originalAmount: 0,
    originalCurrency: '',
    parentTransactionID: '',
    posted: '',
    receipt: {
        state: CONST.IOU.RECEIPT_STATE.OPEN,
        source: 'mockData/eReceiptBGs/eReceiptBG_pink.png',
    },
    reimbursable: true,
    reportID: '111111111111111',
    status: CONST.TRANSACTION.STATUS.POSTED,
    tag: '',
    transactionID: '1111111111111111111',
    hasEReceipt: true,
};

const violations: TransactionViolations = [
    {
        name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
    {
        name: CONST.VIOLATIONS.MISSING_CATEGORY,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
    {
        name: CONST.VIOLATIONS.FIELD_REQUIRED,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
];

const originalMessage: OriginalMessageIOU = {
    IOUReportID: '111111111111111',
    IOUTransactionID: '590639150582440369',
    amount,
    comment: '',
    currency,
    lastModified: '2025-02-14 08:12:05.165',
    participantAccountIDs: [11111111, 22222222],
    type: 'create',
};

const action: ReportAction = {
    reportActionID: '1111111111111111111',
    message: [
        {
            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            html: '$0.01 expense',
            text: '$0.01 expense',
            isEdited: false,
            whisperedTo: [],
            isDeletedParentAction: false,
            deleted: '',
        },
    ],
    actionName: 'IOU',
    originalMessage,
    childReportID: '1111111111111111',
    created: '2025-02-14 08:12:05.165',
    actorAccountID: 11111111,
    childType: 'chat',
    person: [
        {
            type: 'TEXT',
            style: 'strong',
            text: 'John Smith',
        },
    ],
};

/* eslint-enable @typescript-eslint/naming-convention */

export {personalDetails, iouReport, chatReport, transaction, violations, action};
