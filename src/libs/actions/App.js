import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} url
 */
function setCurrentURL(url) {
    Onyx.set(ONYXKEYS.CURRENT_URL, url);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setCurrentURL,
};
