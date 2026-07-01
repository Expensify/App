import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ResolveActionableMentionWhisperParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER>;
    reportID?: string;
    inviteeEmails?: string[];
};

export default ResolveActionableMentionWhisperParams;
