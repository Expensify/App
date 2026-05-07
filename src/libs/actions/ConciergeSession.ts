import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setConciergeSessionStartTime(time: string | null) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_CONCIERGE_SESSION_START_TIME, time);
}

function setConciergeShowFullHistory(value: boolean) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_CONCIERGE_SHOW_FULL_HISTORY, value);
}

export {setConciergeSessionStartTime, setConciergeShowFullHistory};
