import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ResolveActionableMentionWhisperParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>;
    /** Current report ID for navigation context - used to generate proper backTo parameters in whisper links */
    currentReportID: string;
};

export default ResolveActionableMentionWhisperParams;
