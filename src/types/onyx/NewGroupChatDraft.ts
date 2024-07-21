/** Selected chat participant */
type SelectedParticipant = {
    /** Participant ID */
    accountID: number;

    /** Participant login name */
    login: string;
};

/** Model of new group chat draft */
type NewGroupChatDraft = {
    /** New group chat participants */
    participants: SelectedParticipant[];

    /** New group chat name */
    reportName: string | null;

    /** New group chat avatar URI */
    avatarUri: string | null;

    /** New group chat avatar image encoded in bse64 string */
    avatarBase64: string | null;

    /** New group chat avatar file name */
    avatarFileName: string | null;

    /** New group chat avatar file type */
    avatarFileType: string | null;
};
export type {SelectedParticipant};
export default NewGroupChatDraft;
