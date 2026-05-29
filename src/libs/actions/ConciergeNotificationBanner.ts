import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function dismissForSession() {
    Onyx.set(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export -- Action files in src/libs/actions/ use named exports by convention so callers stay consistent as more actions are added
    dismissForSession,
};
