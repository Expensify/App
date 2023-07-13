type Participant = {
    accountID: number;
    login?: string;
    isPolicyExpenseChat?: boolean;
    isOwnPolicyExpenseChat?: boolean;
    selected?: boolean;
    reportID?: string;
};

type IOU = {
    id: string;
    amount?: number;
    /** Selected Currency Code of the current IOU */
    currency?: string;
    comment?: string;
    participants?: Participant[];
};

export default IOU;
