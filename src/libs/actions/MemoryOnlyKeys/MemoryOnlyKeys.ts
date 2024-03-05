import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

const enable = () => {
    Log.info('[MemoryOnlyKeys] enabled');
    Onyx.set(ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS, true);
    Onyx.setMemoryOnlyKeys();
};

const disable = () => {
    Log.info('[MemoryOnlyKeys] disabled');
    Onyx.set(ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS, false);
    Onyx.setMemoryOnlyKeys();
};

export {disable, enable};
