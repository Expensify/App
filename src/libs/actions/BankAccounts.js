import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function fetchBankAccountList() {
    // Note: For the moment, we are just running this to verify that we can successfully return data from the secure API
    API.Get({returnValueList: 'bankAccountList'}, true);
}

function fetchUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);
        });
}

export {
    fetchBankAccountList,
    fetchUserWallet,
};
