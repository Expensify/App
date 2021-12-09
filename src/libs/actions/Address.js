import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} selectedAddress
 */
function setAddress(selectedAddress) {
    Onyx.merge(ONYXKEYS.SELECTED_ADDRESS, selectedAddress);
}

// eslint-disable-next-line import/prefer-default-export
export {setAddress};
