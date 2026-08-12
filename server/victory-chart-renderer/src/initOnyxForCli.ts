import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

Onyx.init({
    keys: ONYXKEYS,
    enableDevTools: false,
    shouldSyncMultipleInstances: false,
    ramOnlyKeys: [ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING],
});
