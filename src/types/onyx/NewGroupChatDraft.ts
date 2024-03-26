type SelectedParticipant = {
    accountID: number;
    login: string;
};

type NewGroupChatDraft = {
    participants: SelectedParticipant[];
    reportName: string;
};
export type {SelectedParticipant};
export default NewGroupChatDraft;
