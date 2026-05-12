// Test data for Invoices. The values come from the Onyx store in the app while manually testing.
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

const policy: OnyxEntry<OnyxTypes.Policy> = {
    id: 'CC048FA711B35B1F',
    type: 'team',
    name: "53019's Workspace",
    role: 'admin',
    owner: 'a1@53019.com',
    ownerAccountID: 32,
    isPolicyExpenseChatEnabled: true,
    outputCurrency: 'USD',
    autoReporting: true,
    autoReportingFrequency: 'instant',
    approvalMode: 'OPTIONAL',
    harvesting: {
        enabled: true,
        jobID: 7206965285807173000,
    },
    customUnits: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '39C3FF491F559': {
            customUnitID: '39C3FF491F559',
            name: 'Distance',
            attributes: {
                unit: 'mi',
            },
            rates: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '928A74633831E': {
                    customUnitRateID: '928A74633831E',
                    name: 'Default Rate',
                    rate: 67,
                    enabled: true,
                    currency: 'USD',
                },
            },
            defaultCategory: 'Car',
            enabled: true,
        },
    },
    areCategoriesEnabled: true,
    areTagsEnabled: false,
    areDistanceRatesEnabled: false,
    areWorkflowsEnabled: false,
    areReportFieldsEnabled: false,
    areConnectionsEnabled: false,
    employeeList: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'a1@53019.com': {
            role: 'admin',
            errors: {},
            email: 'a1@53019.com',
            forwardsTo: '',
            submitsTo: 'a1@53019.com',
        },
    },
    pendingFields: {},
    chatReportIDAnnounce: '0',
    chatReportIDAdmins: '1811331783036078',
    approver: 'a1@53019.com',
    areCompanyCardsEnabled: false,
    areExpensifyCardsEnabled: false,
    areInvoicesEnabled: true,
    arePerDiemRatesEnabled: false,
    areRulesEnabled: false,
    autoReimbursement: {
        limit: 0,
    },
    autoReimbursementLimit: 0,
    autoReportingOffset: 1,
    avatarURL: '',
    defaultBillable: false,
    description: '',
    disabledFields: {
        defaultBillable: true,
        reimbursable: false,
    },
    fieldList: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        text_title: {
            defaultValue: '{report:type} {report:startdate}',
            deletable: true,
            disabledOptions: [],
            externalIDs: [],
            fieldID: 'text_title',
            isTax: false,
            keys: [],
            name: 'title',
            orderWeight: 0,
            target: 'expense',
            type: 'formula',
            values: [],
        },
    },
    hasMultipleTagLists: false,
    invoice: {
        markUp: 0,
        companyName: 'b1-53019',
        companyWebsite: 'https://www.53019.com',
        pendingFields: {},
        bankAccount: {
            stripeConnectAccountBalance: 0,
            stripeConnectAccountID: 'acct_1QVeO7S7tHTCCfyY',
            transferBankAccountID: 29,
        },
    },
    preventSelfApproval: false,
    reimbursementChoice: 'reimburseManual',
    requiresCategory: false,
    requiresTag: false,
    tax: {
        trackingEnabled: false,
    },
    mccGroup: {
        airlines: {
            category: 'Travel',
            groupID: 'airlines',
        },
        commuter: {
            category: 'Car',
            groupID: 'commuter',
        },
        gas: {
            category: 'Car',
            groupID: 'gas',
        },
        goods: {
            category: 'Materials',
            groupID: 'goods',
        },
        groceries: {
            category: 'Meals and Entertainment',
            groupID: 'groceries',
        },
        hotel: {
            category: 'Travel',
            groupID: 'hotel',
        },
        mail: {
            category: 'Office Supplies',
            groupID: 'mail',
        },
        meals: {
            category: 'Meals and Entertainment',
            groupID: 'meals',
        },
        rental: {
            category: 'Travel',
            groupID: 'rental',
        },
        services: {
            category: 'Professional Services',
            groupID: 'services',
        },
        taxi: {
            category: 'Travel',
            groupID: 'taxi',
        },
        uncategorized: {
            category: 'Other',
            groupID: 'uncategorized',
        },
        utilities: {
            category: 'Utilities',
            groupID: 'utilities',
        },
    },
};

const transaction: OnyxEntry<OnyxTypes.Transaction> = {
    amount: 100,
    comment: {
        customUnit: {
            customUnitRateID: '_FAKE_P2P_ID_',
        },
        attendees: [
            {
                email: 'a1@53019.com',
                login: 'a1@53019.com',
                displayName: 'a1',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_9.png',
                accountID: 32,
                text: 'a1@53019.com',
                selected: true,
                reportID: '3634215302663162',
            },
        ],
    },
    created: '2024-12-13',
    currency: 'USD',
    iouRequestType: 'manual',
    reportID: '3634215302663162',
    transactionID: '1',
    isFromGlobalCreate: true,
    merchant: '(none)',
    shouldShowOriginalAmount: true,
    participants: [
        {
            accountID: 33,
            login: 'b1@53019.com',
            isPolicyExpenseChat: false,
            reportID: '',
            selected: true,
            iouType: 'invoice',
        },
        {
            policyID: 'CC048FA711B35B1F',
            isSender: true,
            selected: false,
            iouType: 'invoice',
        },
    ],
    tag: '',
    category: '',
    billable: false,
};

const convertedInvoiceChat: OnyxTypes.Report = {
    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
    currency: 'USD',
    description: '',
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,

    // The invoice receiver shouldn't have an accountID when the type is business,
    // but this is to test that it still works if the value is present, so cast it to unknown
    invoiceReceiver: {
        accountID: 33,
        policyID: '5F2F82F98C848CAA',
        type: 'policy',
    } as unknown as InvoiceReceiver,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    lastActorAccountID: 32,
    lastMessageHtml: 'paid $1.00',
    lastMessageText: 'paid $1.00',
    lastReadSequenceNumber: 0,
    lastReadTime: '2024-12-13 19:45:28.942',
    lastVisibleActionCreated: '2024-12-13 19:19:01.794',
    lastVisibleActionLastModified: '2024-12-13 19:19:01.794',
    managerID: 0,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 0,
    participants: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '32': {
            notificationPreference: 'always',
            role: 'admin',
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '33': {
            notificationPreference: 'always',
            permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE, CONST.REPORT.PERMISSIONS.SHARE, CONST.REPORT.PERMISSIONS.OWN],
        },
    },
    policyAvatar: '',
    policyID: 'CC048FA711B35B1F',
    policyName: "53019's Workspace",
    reportID: '7605647250932303',
    reportName: 'Chat Report',
    stateNum: 0,
    statusNum: 0,
    total: 0,
    type: 'chat',
    unheldNonReimbursableTotal: 0,
    unheldTotal: 0,
    visibility: 'private',
    welcomeMessage: '',
    writeCapability: 'all',
};

type InvoiceTestData = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    convertedInvoiceChat: OnyxTypes.Report;
};

export type {InvoiceTestData};
export {policy, transaction, convertedInvoiceChat};
