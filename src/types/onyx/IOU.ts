import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Icon} from './OnyxCommon';

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
    isSender?: boolean;
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
};

/** Model of IOU request */
type IOU = {
    /** IOU ID */
    id: string;

    /** IOU amount */
    amount?: number;

    /** Selected Currency Code of the current IOU */
    currency?: string;

    /** IOU comment */
    comment?: string;

    /** IOU category */
    category?: string;

    /** IOU merchant */
    merchant?: string;

    /** IOU creation date */
    created?: string;

    /** IOU receipt file path */
    receiptPath?: string;

    /** IOU comment */
    receiptFilename?: string;

    /** IOU transaction ID */
    transactionID?: string;

    /** IOU participants */
    participants?: Participant[];

    /** IOU tag */
    tag?: string;

    /** Is IOU billable */
    billable?: boolean;

    /** Is an IOU split request */
    isSplitRequest?: boolean;
};

export default IOU;
export type {Participant, Split};
