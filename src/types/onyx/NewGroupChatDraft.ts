type SelectedParticipant = {
    accountID: number;
    login: string;
};

type NewGroupChatDraft = {
    participants: SelectedParticipant[] | null;
    reportName: string | null;
    avatarUri: string | null;
};
export type {SelectedParticipant};
export default NewGroupChatDraft;
