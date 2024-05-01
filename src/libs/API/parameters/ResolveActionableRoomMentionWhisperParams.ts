import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ResolveActionableRoomMentionWhisperParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_ROOM_MENTION_WHISPER_RESOLUTION>;
};

export default ResolveActionableRoomMentionWhisperParams;
