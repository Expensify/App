import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Retrieve the users preferred currency
 */
function getPreferredCurrency() {
    Onyx.merge(ONYXKEYS.APP_STATE.IOU, {loading: true});

    // fake loading timer, to be replaced with actual network request
    setTimeout(() => {
        Onyx.merge(ONYXKEYS.APP_STATE.IOU, {loading: false});
    }, 1600);
}

// Re-enable the prefer-default-export lint when additional functions are added
export {
    getPreferredCurrency, // eslint-disable-line import/prefer-default-export
};
