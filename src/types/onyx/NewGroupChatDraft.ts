/** Selected chat participant */
type SelectedParticipant = {
    /** Participant ID */
    accountID: number;

    /** Participant login name */
    login: string | undefined;
};

/** Model of new group chat draft */
type NewGroupChatDraft = {
    participants: SelectedParticipant[];

    reportName: string | null;

    avatarUri: string | null;

    avatarFileName: string | null;

    avatarFileType: string | null;
};
export type {SelectedParticipant};
export default NewGroupChatDraft;
