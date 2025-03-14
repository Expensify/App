import React from 'react';
import type {ListRenderItem} from 'react-native';
import {View} from 'react-native';
// import * as Expensicons from '@components/Icon/Expensicons';
// import OnyxProvider from '@components/OnyxProvider';
import type {MoneyRequestReportPreviewContentProps} from '@components/ReportActionItem/MoneyRequestReportPreview';
// import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import MoneyRequestReportPreviewContent from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

// import { CONST } from 'expensify-common';

/* eslint-disable react/jsx-props-no-spreading */

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */

/** All the data of the action */
// action: ReportAction;

/** Extra styles to pass to View wrapper */
// containerStyles?: StyleProp<ViewStyle>;

/** Popover context menu anchor, used for showing context menu */
// contextMenuAnchor?: ContextMenuAnchor;

const mockChatReport = {
    chatType: '',
    currency: 'USD',
    description: '',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: 'REPORTPREVIEW',
    lastActorAccountID: '17923934',
    lastMessageHtml: 'bartlomiej.krason+10@swmansion.com owes zł5,729.50',
    lastMessageText: 'bartlomiej.krason+10@swmansion.com owes zł5,729.50',
    lastReadSequenceNumber: 0,
    lastReadTime: '2025-02-27 12:23:34.576',
    lastVisibleActionCreated: '2025-02-27 12:21:27.700',
    lastVisibleActionLastModified: '2025-02-27 12:21:27.700',
    managerID: 0,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    participants: {'17748577': {notificationPreference: 'always'}, '17923934': {notificationPreference: 'always'}},
    permissions: ['read', 'write'],
    policyID: '_FAKE_',
    private_isArchived: '',
    reportID: '8364634971415873',
    reportName: 'Chat Report',
    stateNum: 0,
    statusNum: 0,
    total: 0,
    type: 'chat',
    unheldNonReimbursableTotal: 0,
    unheldTotal: 0,
    welcomeMessage: '',
    writeCapability: 'all',
};

const mockIOUReport = {
    chatReportID: '8364634971415873',
    chatType: '',
    currency: 'PLN',
    description: '',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    hasParentAccess: true,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: 'IOU',
    lastActorAccountID: '17748577',
    lastMessageHtml: 'zł0.00 expense',
    lastMessageText: 'zł0.00 expense',
    lastReadSequenceNumber: 0,
    lastReadTime: '2025-02-27 12:23:44.082',
    lastVisibleActionCreated: '2025-02-27 12:23:43.239',
    lastVisibleActionLastModified: '2025-02-27 12:23:43.239',
    managerID: 17923934,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 17748577,
    parentReportActionID: '7610691317838496055',
    parentReportID: '8364634971415873',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    participants: {'17748577': {notificationPreference: 'hidden'}, '17923934': {notificationPreference: 'hidden'}},
    permissions: [],
    policyID: '03C3FBC349E12C61',
    private_isArchived: '',
    reportID: '3527108249935433',
    reportName: 'IOU',
    stateNum: 1,
    statusNum: 1,
    total: 572950,
    type: 'iou',
    unheldNonReimbursableTotal: 0,
    unheldTotal: 572950,
    welcomeMessage: '',
    writeCapability: 'all',
};

const mockTransactions = [
    {
        transactionID: '4392822719892932143',
        amount: 0,
        currency: 'PLN',
        reportID: '3527108249935433',
        comment: '',
        merchant: '(none)',
        created: '2025-02-27',
        receipt: {source: 'https://www.expensify.com/receipts/w_e59685c67392f6aacc47ab29f8f10cb05bd75c84.png', state: 'SCANFAILED', receiptID: 804477135779246},
        filename: 'w_e59685c67392f6aacc47ab29f8f10cb05bd75c84.png',
        category: '',
        tag: '',
        taxCode: '',
        taxAmount: 0,
        billable: false,
        reimbursable: true,
        attendees: [
            {
                email: 'wiktor.gut@swmansion.com',
                login: 'wiktor.gut@swmansion.com',
                displayName: 'Wiktor Gut',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_2.png',
                accountID: 17748577,
                text: 'wiktor.gut@swmansion.com',
                selected: true,
                reportID: '8364634971415873',
            },
        ],
        inserted: '2025-02-27 12:22:17',
        bank: '',
        cardID: 0,
        cardName: 'Cash Expense',
        cardNumber: '',
        hasEReceipt: false,
        managedCard: false,
        mcc: '',
        modifiedAmount: 1000,
        modifiedCreated: '',
        modifiedCurrency: 'PLN',
        modifiedMCC: '',
        modifiedMerchant: '',
        originalAmount: 0,
        originalCurrency: '',
        parentTransactionID: '',
        posted: '',
        status: 'Posted',
        pendingFields: {},
        isLoading: false,
    },
    {
        transactionID: '5587128091263517544',
        amount: 1000,
        currency: 'PLN',
        reportID: '3527108249935433',
        comment: {comment: 'ikea'},
        merchant: '(none)',
        created: '2025-02-27',
        receipt: {},
        filename: '',
        category: '',
        tag: '',
        taxCode: '',
        taxAmount: 0,
        billable: false,
        reimbursable: true,
        attendees: [
            {
                email: 'wiktor.gut@swmansion.com',
                login: 'wiktor.gut@swmansion.com',
                displayName: 'Wiktor Gut',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_2.png',
                accountID: 17748577,
                text: 'wiktor.gut@swmansion.com',
                selected: true,
                reportID: '1667312211907579',
            },
        ],
        inserted: '2025-02-27 12:21:27',
        bank: '',
        cardID: 0,
        cardName: 'Cash Expense',
        cardNumber: '',
        hasEReceipt: false,
        managedCard: false,
        mcc: '',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMCC: '',
        modifiedMerchant: '',
        originalAmount: 0,
        originalCurrency: '',
        parentTransactionID: '',
        posted: '',
        status: 'Posted',
        pendingFields: {},
        isLoading: false,
    },
    {
        transactionID: '6006395751562139682',
        amount: 0,
        currency: 'PLN',
        reportID: '3527108249935433',
        comment: {comment: 'hopefuly a dupe'},
        merchant: '(none)',
        created: '2025-02-27',
        receipt: {source: 'https://www.expensify.com/receipts/w_5edcfa42a1d447d30284684c929037acdc1f5755.pdf', state: 'SCANFAILED', receiptID: 2615476965317027},
        filename: 'w_5edcfa42a1d447d30284684c929037acdc1f5755.pdf',
        category: '',
        tag: '',
        taxCode: '',
        taxAmount: 0,
        billable: false,
        reimbursable: true,
        attendees: [
            {
                email: 'wiktor.gut@swmansion.com',
                login: 'wiktor.gut@swmansion.com',
                displayName: 'Wiktor Gut',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_2.png',
                accountID: 17748577,
                text: 'wiktor.gut@swmansion.com',
                selected: true,
                reportID: '8364634971415873',
            },
        ],
        inserted: '2025-02-27 12:23:43',
        bank: '',
        cardID: 0,
        cardName: 'Cash Expense',
        cardNumber: '',
        hasEReceipt: false,
        managedCard: false,
        mcc: '',
        modifiedAmount: 126500,
        modifiedCreated: '',
        modifiedCurrency: 'NZD',
        modifiedMCC: '',
        modifiedMerchant: 'ikea',
        originalAmount: 0,
        originalCurrency: '',
        parentTransactionID: '',
        posted: '',
        status: 'Posted',
        pendingFields: {},
        isLoading: false,
    },
    {
        transactionID: '7101961069474307741',
        amount: 0,
        currency: 'PLN',
        reportID: '3527108249935433',
        comment: {comment: 'hopefuly a dupe'},
        merchant: '(none)',
        created: '2025-02-27',
        receipt: {source: 'https://www.expensify.com/receipts/w_fb63ccc1fe3c8adec12e6535c771329897369794.pdf', state: 'SCANFAILED', receiptID: 6450315525677550},
        filename: 'w_fb63ccc1fe3c8adec12e6535c771329897369794.pdf',
        category: '',
        tag: '',
        taxCode: '',
        taxAmount: 0,
        billable: false,
        reimbursable: true,
        attendees: [
            {
                email: 'wiktor.gut@swmansion.com',
                login: 'wiktor.gut@swmansion.com',
                displayName: 'Wiktor Gut',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_2.png',
                accountID: 17748577,
                text: 'wiktor.gut@swmansion.com',
                selected: true,
                reportID: '8364634971415873',
            },
        ],
        inserted: '2025-02-27 12:23:35',
        bank: '',
        cardID: 0,
        cardName: 'Cash Expense',
        cardNumber: '',
        hasEReceipt: false,
        managedCard: false,
        mcc: '',
        modifiedAmount: 126500,
        modifiedCreated: '',
        modifiedCurrency: 'NZD',
        modifiedMCC: '',
        modifiedMerchant: 'ikea',
        originalAmount: 0,
        originalCurrency: '',
        parentTransactionID: '',
        posted: '',
        status: 'Posted',
        pendingFields: {},
        isLoading: false,
    },
    {
        transactionID: '7284724025679636104',
        amount: 1000,
        currency: 'PLN',
        reportID: '3527108249935433',
        comment: {comment: 'ikea'},
        merchant: '(none)',
        created: '2025-02-27',
        receipt: {},
        filename: '',
        category: '',
        tag: '',
        taxCode: '',
        taxAmount: 0,
        billable: false,
        reimbursable: true,
        attendees: [
            {
                email: 'wiktor.gut@swmansion.com',
                login: 'wiktor.gut@swmansion.com',
                displayName: 'Wiktor Gut',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_2.png',
                accountID: 17748577,
                text: 'wiktor.gut@swmansion.com',
                selected: true,
                reportID: '8364634971415873',
            },
        ],
        inserted: '2025-02-27 12:21:35',
        bank: '',
        cardID: 0,
        cardName: 'Cash Expense',
        cardNumber: '',
        hasEReceipt: false,
        managedCard: false,
        mcc: '',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMCC: '',
        modifiedMerchant: '',
        originalAmount: 0,
        originalCurrency: '',
        parentTransactionID: '',
        posted: '',
        status: 'Posted',
        pendingFields: {},
        isLoading: false,
    },
    {
        transactionID: '8408846020846169912',
        amount: 0,
        currency: 'PLN',
        reportID: '3527108249935433',
        comment: '',
        merchant: '(none)',
        created: '2025-02-27',
        receipt: {source: 'https://www.expensify.com/receipts/w_67cb40bda8b9b4d83b5d7717294500cca39cc027.png', state: 'SCANFAILED', receiptID: 2113356951452522},
        filename: 'w_67cb40bda8b9b4d83b5d7717294500cca39cc027.png',
        category: '',
        tag: '',
        taxCode: '',
        taxAmount: 0,
        billable: false,
        reimbursable: true,
        attendees: [
            {
                email: 'wiktor.gut@swmansion.com',
                login: 'wiktor.gut@swmansion.com',
                displayName: 'Wiktor Gut',
                avatarUrl: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_2.png',
                accountID: 17748577,
                text: 'wiktor.gut@swmansion.com',
                selected: true,
                reportID: '8364634971415873',
            },
        ],
        inserted: '2025-02-27 12:22:44',
        bank: '',
        cardID: 0,
        cardName: 'Cash Expense',
        cardNumber: '',
        hasEReceipt: false,
        managedCard: false,
        mcc: '',
        modifiedAmount: 1000,
        modifiedCreated: '',
        modifiedCurrency: 'PLN',
        modifiedMCC: '',
        modifiedMerchant: '',
        originalAmount: 0,
        originalCurrency: '',
        parentTransactionID: '',
        posted: '',
        status: 'Posted',
        pendingFields: {},
        isLoading: false,
    },
];

// from another report
const mockViolations = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    transactionViolations_3973462535018765193: [{type: 'violation', name: 'hold', data: null, showInReview: true}],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    transactionViolations_4568512976344515832: [
        {
            type: 'warning',
            name: 'duplicatedTransaction',
            data: {tooltip: 'List the potential duplicate transactions and merge, delete, or ignore them.', duplicates: ['5925412967099565847']},
            showInReview: true,
        },
    ],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    transactionViolations_5925412967099565847: [
        {
            type: 'warning',
            name: 'duplicatedTransaction',
            data: {tooltip: 'List the potential duplicate transactions and merge, delete, or ignore them.', duplicates: ['4568512976344515832']},
            showInReview: true,
        },
    ],
};

const mockAction = {
    reportActionID: '7610691317838496055',
    message: [
        {
            type: 'COMMENT',
            html: 'bartlomiej.krason+10@swmansion.com owes PLN 5,729.50',
            text: 'bartlomiej.krason+10@swmansion.com owes PLN 5,729.50',
            isEdited: false,
            whisperedTo: [],
            isDeletedParentAction: false,
            deleted: '',
            reactions: [],
        },
    ],
    actionName: 'REPORTPREVIEW',
    originalMessage: {linkedReportID: '3527108249935433', isNewDot: true, lastModified: '2025-02-27 12:21:27.700', whisperedTo: []},
    childCommenterCount: 0,
    childReportID: '3527108249935433',
    childLastVisibleActionCreated: '',
    created: '2025-02-27 12:21:27.700',
    actorAccountID: 17923934,
    childVisibleActionCount: 0,
    childOldestFourAccountIDs: '',
    childType: 'iou',
    person: [{type: 'TEXT', style: 'strong', text: 'Bartek Krasoń'}],
    childStateNum: 1,
    childStatusNum: 1,
    childReportName: 'IOU',
    childManagerAccountID: 17923934,
    childMoneyRequestCount: 6,
    childOwnerAccountID: 17748577,
};

const moneyRequestPreviewBox = {
    backgroundColor: 'transparent',
    borderRadius: variables.componentBorderRadiusLarge,
    maxWidth: variables.reportPreviewMaxWidth,
    width: '100%',
};

const mockRenderItem: ListRenderItem<Transaction> = ({item}) => (
    <View style={[moneyRequestPreviewBox, {height: 280, width: 300, borderWidth: 1, borderBlockColor: 'black', padding: 10, justifyContent: 'center', alignItems: 'center'}]}>
        <Text>This is a TransactionPreview</Text>
        <Text>
            for {item.amount} {item.currency}
        </Text>
    </View>
);

export default {
    title: 'Components/MoneyRequestReportPreviewContent',
    component: MoneyRequestReportPreviewContent,
    argTypes: {
        /** The associated chatReport */
        chatReportID: {
            options: ['chatReportID', undefined],
            control: {type: 'radio'},
        },
        /** The active IOUReport, used for Onyx subscription */
        iouReportID: {
            options: ['iouReportID', undefined],
            control: {type: 'radio'},
        },
        /** The report's policyID, used for Onyx subscription */
        policyID: {
            options: ['policyID', undefined],
            control: {type: 'radio'},
        },
        /** Extra styles to pass to View wrapper */
        containerStyles: {
            options: [{marginTop: 8}],
            control: {type: 'radio'},
        },
        /** Popover context menu anchor, used for showing context menu */
        contextMenuAnchor: {
            options: [null],
            control: {type: 'radio'},
        },
        /** Callback for updating context menu active state, used for showing context menu */
        chceckIfContextMenuActive: {
            options: [undefined, () => {}],
            control: {type: 'radio'},
        },
        /** Callback when the payment options popover is shown */
        onPaymentOptionsShow: {
            options: [undefined, () => {}],
            control: {type: 'radio'},
        },
        /** Callback when the payment options popover is closed */
        onPaymentOptionsHide: {
            options: [undefined, () => {}],
            control: {type: 'radio'},
        },
        /** Whether a message is a whisper */
        isWhisper: {
            options: [true, false, undefined],
            control: {type: 'radio'},
        },
        /** Whether the corresponding report action item is hovered */
        isHovered: {
            options: [true, false, undefined],
            control: {type: 'radio'},
        },
    },
    args: {
        action: mockAction,
        chatReport: mockChatReport,
        policy: undefined,
        iouReport: mockIOUReport,
        transactions: mockTransactions,
        violations: mockViolations,
        invoiceReceiverPersonalDetail: undefined,
        invoiceReceiverPolicy: undefined,
        renderItem: mockRenderItem,
    },
};

function Template(props: MoneyRequestReportPreviewContentProps) {
    return (
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <MoneyRequestReportPreviewContent {...props} />
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

export {Default};
