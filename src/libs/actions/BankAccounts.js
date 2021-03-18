import Onyx from 'react-native-onyx';
import lodashGet from 'lodash.get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function getBankAccountList() {
    API.Get({returnValueList: 'bankAccountList'})
        .then((response) => {
            if (_.isEmpty(response.bankAccountList)) {
                // No bank account list...
                return;
            }

            // We want to filter bank accounts so that our list only includes
            // - Non-Business Bank Accounts
            // - Accounts linked via Plaid
            const personalBankAccounts = _.chain(response.bankAccountList)

                // We only want accounts that are in the OPEN state and were connected via Plaid and have no
                // verifications as only Business Bank Accounts (a.k.a. withdrawal / "Verified") will have these
                // @TODO looking at existing verifications isn't a good way to tell if we have a business bank account
                // but makes sense for now...
                .reject(account => (
                    account.state !== 'OPEN'
                    || !lodashGet(account, 'additionalData.plaidAccountID')
                    || lodashGet(account, 'additionalData.verifications')
                ))
                .value();

            Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNTS, personalBankAccounts);
        });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getBankAccountList,
};
