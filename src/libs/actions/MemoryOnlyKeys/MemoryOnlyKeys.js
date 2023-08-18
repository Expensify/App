import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import Log from '../../Log';

const memoryOnlyKeys = [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.POLICY, ONYXKEYS.PERSONAL_DETAILS_LIST];

const enable = () => {
    Log.info('[MemoryOnlyKeys] enabled');
    Onyx.set(ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS, true);
    Onyx.setMemoryOnlyKeys(memoryOnlyKeys);
};

const disable = () => {
    Log.info('[MemoryOnlyKeys] disabled');
    Onyx.set(ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS, false);
    Onyx.setMemoryOnlyKeys([]);
};

export {disable, enable};
