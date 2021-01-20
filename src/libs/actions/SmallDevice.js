import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Is small device
 */
function isSmallDevice(isSmall) {
    Onyx.set(ONYXKEYS.IS_SMALL_DEVICE, isSmall);
}

export {
    isSmallDevice
};
