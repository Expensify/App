import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setFocusModeNotification(value: boolean) {
    Onyx.set(ONYXKEYS.FOCUS_MODE_NOTIFICATION, value);
}

// eslint-disable-next-line import/prefer-default-export
export {setFocusModeNotification};
