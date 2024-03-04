import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ResolveActionableMentionWhisperParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>;
};

export default ResolveActionableMentionWhisperParams;
