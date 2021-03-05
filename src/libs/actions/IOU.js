import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Retrieve the users preferred currency
 */
export default function getPreferredCurrency() {
    Onyx.merge(ONYXKEYS.IOU.IS_LOADING, true);

    // fake loading timer, to be replaced with actual network request
    setTimeout(() => {
        Onyx.merge(ONYXKEYS.IOU.IS_LOADING, false);
    }, 1600);
}
