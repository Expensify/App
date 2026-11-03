import {OnyxKey} from '@src/ONYXKEYS';
import Onyx from 'react-native-onyx';

function clearBankAccountErrors() {
    // Ensure safe reset or preservation of errors upon network reconnect
    Onyx.merge('bankAccount', {errors: null});
}

export {
    clearBankAccountErrors,
};
