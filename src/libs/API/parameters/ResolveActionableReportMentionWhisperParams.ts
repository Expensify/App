import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ResolveActionableReportMentionWhisperParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>;
};

export default ResolveActionableReportMentionWhisperParams;
