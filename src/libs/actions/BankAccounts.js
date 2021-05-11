import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function fetchBankAccountList() {
    // Note: For the moment, we are just running this to verify that we can successfully return data from the secure API
    API.Get({returnValueList: 'bankAccountList'}, true);
}

function fetchOnfidoToken() {
    API.Wallet_GetOnfidoSDKToken()
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            const apiResult = lodashGet(response, ['requestorIdentityOnfido', 'apiResult'], {});
            Onyx.merge(ONYXKEYS.ONFIDO_APPLICANT_INFO, {
                applicantID: apiResult.applicantID,
                sdkToken: apiResult.sdkToken,
            });
        });
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
    fetchOnfidoToken,
};
