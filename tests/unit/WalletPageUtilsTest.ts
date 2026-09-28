import shouldOpenBankAccountByPolicy from '@pages/settings/Wallet/WalletPage/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';

const policyID = '1';
const currentUserLogin = 'payments-admin@example.com';
const accountData: AccountData = {
    bankAccountID: 1,
    additionalData: {policyID},
};

describe('shouldOpenBankAccountByPolicy', () => {
    it('returns true when the user can manage payments for the linked workspace', () => {
        const policies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                role: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.PAYMENTS_ADMIN},
                },
            },
        };

        expect(shouldOpenBankAccountByPolicy(accountData, policies, currentUserLogin)).toBe(true);
    });

    it('returns false when the shared account belongs to a workspace unavailable to the user', () => {
        expect(shouldOpenBankAccountByPolicy(accountData, {}, currentUserLogin)).toBe(false);
    });

    it('returns false when the user cannot manage payments for the linked workspace', () => {
        const policies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                role: CONST.POLICY.ROLE.USER,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                },
            },
        };

        expect(shouldOpenBankAccountByPolicy(accountData, policies, currentUserLogin)).toBe(false);
    });
});
