import type {SelectedParticipant} from '@pages/NewChatPage';

type NewGroupChatDraft = {
    participants: SelectedParticipant[];
    reportName: string;
};

export default NewGroupChatDraft;
