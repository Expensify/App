import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * @param {Boolean} shouldSignOut
 */
export default function setShouldSignOut(shouldSignOut) {
    Onyx.set(ONYXKEYS.SHOULD_SIGN_OUT, shouldSignOut);
}
