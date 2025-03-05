import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Icon} from './OnyxCommon';
import type Report from './Report';

/** Model of IOU participant */
type Participant = {
    /** IOU participant account ID */
    accountID?: number;

    /** IOU participant login */
    login?: string;

    /** IOU participant display name */
    displayName?: string;

    /** Is IOU participant associated with policy expense chat */
    isPolicyExpenseChat?: boolean;

    /** Whether the IOU participant is an invoice receiver */
    isInvoiceRoom?: boolean;

    /** Is IOU participant associated with is own policy expense chat */
    isOwnPolicyExpenseChat?: boolean;

    /** Type of chat associated with IOU participant */
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

    /** IOU participant report ID */
    reportID?: string;

    /** IOU participant policy ID */
    policyID?: string;

    /** Is IOU participant selected in list */
    selected?: boolean;

    /** Text that IOU participant display name and login, if available, for searching purposes */
    searchText?: string;

    /** Additional text shown in lists (participant phone number or display name) */
    alternateText?: string;

    /** IOU participant first name */
    firstName?: string;

    /** Icons used in lists (participant avatar) */
    icons?: Icon[];

    /** Key to be used in lists (participant account ID) */
    keyForList?: string;

    /** IOU participant last name */
    lastName?: string;

    /** IOU participant phone number */
    phoneNumber?: string;

    /** Text to be displayed in lists (participant display name) */
    text?: string;

    /** Is IOU participant selected in list */
    isSelected?: boolean;

    /** Is IOU participant the current user */
    isSelfDM?: boolean;

    /** Whether the IOU participant is an invoice sender */
    isSender?: boolean;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType?: IOUType;

    /** When the participant is associated with a policy expense chat, this is the account ID of the policy owner */
    ownerAccountID?: number;

    /** The report associated to the IOU participant */
    item?: Report;
};

/** Model of IOU split */
type Split = {
    /** IOU split participant email */
    email?: string;

    /** IOU split participant amount paid */
    amount?: number;

    /** IOU split participant account ID */
    accountID?: number;

    /** Chat report ID */
    chatReportID?: string;

    /** IOU report ID */
    iouReportID?: string;

    /** Report Action ID */
    reportActionID?: string;

    /** Transaction ID */
    transactionID?: string;

    /** Policy ID */
    policyID?: string;

    /** Created chat report action ID */
    createdChatReportActionID?: string;

    /** Created IOU report action ID */
    createdIOUReportActionID?: string;

    /** Report preview report action ID */
    reportPreviewReportActionID?: string;

    /** Transaction thread report ID */
    transactionThreadReportID?: string;

    /** Created report action ID for thread */
    createdReportActionIDForThread?: string;

    /** IOU tax amount */
    taxAmount?: number;
};

/** Model of IOU request */
type IOU = {
    /** ID of the IOU request */
    id: string;

    /** Amount requested in IOU */
    amount?: number;

    /** Selected Currency Code of the current IOU */
    currency?: string;

    /** Comment of the IOU request creator */
    comment?: string;

    /** Category assigned to the IOU request */
    category?: string;

    /** Merchant where the amount was spent */
    merchant?: string;

    /** Date timestamp when the IOU request was created */
    created?: string;

    /** Local file path of the expense receipt */
    receiptPath?: string;

    /** File name of the expense receipt */
    receiptFilename?: string;

    /** Transaction ID assigned to the IOU request */
    transactionID?: string;

    /** Users involved in the IOU request */
    participants?: Participant[];

    /** Tag assigned to the IOU request */
    tag?: string;

    /** Whether the IOU request is billable */
    billable?: boolean;

    /** Whether the IOU request is to be split with multiple users */
    isSplitRequest?: boolean;
};

/** Model of IOU attendee */
type Attendee = {
    /** IOU attendee email */
    email: string;

    /** IOU attendee display name */
    displayName: string;

    /** IOU attendee avatar url */
    avatarUrl: string;

    /** Account ID */
    accountID?: number;

    /** Text to be displayed in lists (participant display name) */
    text?: string;

    /** IOU attendee login */
    login?: string;

    /** Text that IOU attendee display name and login, if available, for searching purposes */
    searchText?: string;

    /** Is IOU attendee selected in list */
    selected?: boolean;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType?: IOUType;

    /** IOU attendee report ID */
    reportID?: string;
};

export default IOU;
export type {Participant, Split, Attendee};
