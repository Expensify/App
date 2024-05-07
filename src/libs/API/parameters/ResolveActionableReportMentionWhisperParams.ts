import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ResolveActionableReportMentionWhisperParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>;
};

export default ResolveActionableReportMentionWhisperParams;
