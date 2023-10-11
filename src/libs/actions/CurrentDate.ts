import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setCurrentDate(currentDate: string) {
    Onyx.set(ONYXKEYS.CURRENT_DATE, currentDate);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setCurrentDate,
};
