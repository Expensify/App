type NewGroupChatDraft = {
    participants: Array<{
        login: string;
        accountID: number;
    }>;
    reportName: string;
};

export default NewGroupChatDraft;
