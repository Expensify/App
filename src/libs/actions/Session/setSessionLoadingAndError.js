import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * @param {Boolean} loading
 * @param {String} error
 */
export default function setSessionLoadingAndError(loading, error) {
    Onyx.merge(ONYXKEYS.SESSION, {loading, error});
}
