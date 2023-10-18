import CONST from '../../CONST';
import GetReturnKeyType from './types';

/**
 * Return returnKeyType passed as function parameter on Android
 * Due to the fact that in the Android browser some keyboardTypes change the confirmation icon and ignore keyboardType, the ability to change the confirmation icon in the Android app to the one used in the browser has been added
 */
const getReturnKeyType: GetReturnKeyType = (returnKeyType, keyboardType) => {
    if (keyboardType === CONST.KEYBOARD_TYPE.URL || keyboardType === CONST.KEYBOARD_TYPE.EMAIL_ADDRESS) {
        return 'go';
    }

    return returnKeyType;
};

export default getReturnKeyType;
