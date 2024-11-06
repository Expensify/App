import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DelegatedAccess} from '@src/types/onyx/Account';

let delegatedAccess: DelegatedAccess;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (val) => {
        delegatedAccess = val?.delegatedAccess ?? {};
    },
});

// Moved from actions/Authentication.ts to avoid require cycles
function isConnectedAsDelegate() {
    return !!delegatedAccess?.delegate;
}

export default isConnectedAsDelegate;
