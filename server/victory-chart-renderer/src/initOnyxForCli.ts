import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

Onyx.init({
    keys: ONYXKEYS,
    enableDevTools: false,
    shouldSyncMultipleInstances: false,
    ramOnlyKeys: [ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING],
});
