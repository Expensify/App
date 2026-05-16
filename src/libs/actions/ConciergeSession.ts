import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setConciergeShowFullHistory(value: boolean) {
    Onyx.set(ONYXKEYS.RAM_ONLY_CONCIERGE_SHOW_FULL_HISTORY, value);
}

export default setConciergeShowFullHistory;
