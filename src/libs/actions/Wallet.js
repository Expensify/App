import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function getUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (_.isEmpty(response.userWallet)) {
                // No user wallet list...
                return;
            }

            Onyx.set(ONYXKEYS.USER_WALLET, response.userWallet);
        });
}

function getOnfidoToken() {

}

function verifyAdditionalDetails() {

}

export {
    getUserWallet,
    getOnfidoToken,
    verifyAdditionalDetails,
};
