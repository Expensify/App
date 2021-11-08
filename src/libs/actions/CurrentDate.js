import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} currentDate
 */
function setCurrentDate(currentDate) {
    Onyx.set(ONYXKEYS.CURRENT_DATE, currentDate);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setCurrentDate,
};
