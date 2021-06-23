import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function getPaymentMethods() {
    API.Get({
        returnValueList: 'bankAccountList, cardList, userWallet',
    })
        .then((response) => {
            Onyx.multiSet({
                [ONYXKEYS.USER_WALLET]: lodashGet(response, 'userWallet', null),
                [ONYXKEYS.BANK_ACCOUNT_LIST]: lodashGet(response, 'bankAccountList', []),
                [ONYXKEYS.CARD_LIST]: lodashGet(response, 'cardList', []),
            });
        });
}

export default getPaymentMethods;
