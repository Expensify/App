import type {Icon} from './OnyxCommon';

type Participant = {
    accountID: number;
    login: string;
    isPolicyExpenseChat?: boolean;
    isOwnPolicyExpenseChat?: boolean;
    selected?: boolean;
    reportID?: string;
    searchText?: string;
    alternateText: string;
    firstName: string;
    icons: Icon[];
    keyForList: string;
    lastName: string;
    phoneNumber: string;
    text: string;
    isSelected?: boolean;
};

type IOU = {
    id: string;
    amount?: number;
    /** Selected Currency Code of the current IOU */
    currency?: string;
    comment?: string;
    merchant?: string;
    created?: string;
    receiptPath?: string;
    receiptFilename?: string;
    transactionID?: string;
    participants?: Participant[];
    tag?: string;
};

export default IOU;
export type {Participant};
