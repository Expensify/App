import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * @param {String} error
 */
export default function setSessionError(error) {
    Onyx.merge(ONYXKEYS.SESSION, {error});
}
